using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PMRDA.Api.Auth;
using PMRDA.Api.Data;
using PMRDA.Api.Domain;

namespace PMRDA.Api.Features.Applications;

[ApiController, Route("api/applications")]
public sealed class ApplicationsController(AppDbContext db, ICurrentUser currentUser) : ControllerBase
{
    // ---- List (applicant sees their own; staff sees all) ----
    [HttpGet]
    public async Task<PagedResult<ApplicationListItem>> List([FromQuery] ApplicationQuery q, CancellationToken ct)
    {
        var query = db.Applications.AsNoTracking();

        if (currentUser.Role == SystemRole.Applicant)
            query = query.Where(a => a.ApplicantUserId == currentUser.Id);

        if (q.NocType.HasValue)
            query = query.Where(a => a.NocType == q.NocType);

        if (!string.IsNullOrWhiteSpace(q.Status) && Enum.TryParse<ApplicationStatus>(q.Status, out var st))
            query = query.Where(a => a.Status == st);

        if (!string.IsNullOrWhiteSpace(q.Search))
        {
            var s = q.Search.Trim();
            query = query.Where(a => a.ApplicationNumber.Contains(s) || a.ApplicantName.Contains(s) || a.SurveyNumber.Contains(s) || a.Village.Contains(s));
        }

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(a => a.CreatedAt)
            .Skip((q.Page - 1) * q.PageSize)
            .Take(q.PageSize)
            .Select(a => new ApplicationListItem(
                a.Id, a.ApplicationNumber, a.NocType,
                a.ApplicantName, $"{a.SurveyNumber}, {a.Village}",
                a.SurveyNumber, a.Village, a.Status, a.SubmittedAt, a.UpdatedAt ?? a.CreatedAt))
            .ToListAsync(ct);

        return new PagedResult<ApplicationListItem>(items, total, q.Page, q.PageSize);
    }

    // ---- Review queue (staff only — non-draft, non-terminal) ----
    [HttpGet("review-queue")]
    public async Task<PagedResult<ApplicationListItem>> ReviewQueue([FromQuery] ApplicationQuery q, CancellationToken ct)
    {
        var terminal = new[] { ApplicationStatus.Draft, ApplicationStatus.Approved, ApplicationStatus.Rejected };
        var query = db.Applications.AsNoTracking().Where(a => !terminal.Contains(a.Status));

        if (q.NocType.HasValue) query = query.Where(a => a.NocType == q.NocType);
        if (!string.IsNullOrWhiteSpace(q.Search)) { var s = q.Search.Trim(); query = query.Where(a => a.ApplicationNumber.Contains(s) || a.ApplicantName.Contains(s)); }

        var total = await query.CountAsync(ct);
        var items = await query.OrderBy(a => a.SubmittedAt)
            .Skip((q.Page - 1) * q.PageSize).Take(q.PageSize)
            .Select(a => new ApplicationListItem(a.Id, a.ApplicationNumber, a.NocType, a.ApplicantName, $"{a.SurveyNumber}, {a.Village}", a.SurveyNumber, a.Village, a.Status, a.SubmittedAt, a.UpdatedAt ?? a.CreatedAt))
            .ToListAsync(ct);

        return new PagedResult<ApplicationListItem>(items, total, q.Page, q.PageSize);
    }

    // ---- Get single ----
    [HttpGet("{id:int}")]
    public async Task<ActionResult<ApplicationDetailDto>> Get(int id, CancellationToken ct)
    {
        var a = await db.Applications
            .Include(x => x.TreeInventory)
            .Include(x => x.Documents)
            .Include(x => x.WorkflowHistory).ThenInclude(w => w.PerformedBy)
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id, ct);

        if (a is null) return NotFound();
        if (currentUser.Role == SystemRole.Applicant && a.ApplicantUserId != currentUser.Id) return Forbid();

        return MapDetail(a);
    }

    // ---- Create ----
    [HttpPost]
    public async Task<ActionResult<ApplicationDetailDto>> Create([FromBody] ApplicationInput input, CancellationToken ct)
    {
        var year = DateTime.UtcNow.Year;
        var seq = await db.Applications.CountAsync(ct) + 1;
        var prefix = input.NocType == NocType.Final ? "FINAL" : "PROV";
        var number = $"PMRDA/TNOC/{prefix}/{year}/{seq:D4}";

        var app = new TreeNocApplication
        {
            ApplicationNumber = number,
            NocType = input.NocType!.Value,
            ApplicantName = input.ApplicantName,
            ApplicantAddress = input.ApplicantAddress,
            MobileNumber = input.MobileNumber,
            Age = input.Age,
            Occupation = input.Occupation,
            AuthorisedSignatory = input.AuthorisedSignatory,
            SurveyNumber = input.SurveyNumber,
            GatNumber = input.GatNumber,
            PlotNumber = input.PlotNumber,
            Village = input.Village,
            Taluka = input.Taluka,
            District = input.District,
            PlotAreaSqm = input.PlotAreaSqm,
            GoogleCoordinates = input.GoogleCoordinates,
            ExistingTreeCount = input.ExistingTreeCount,
            RequiredPlantationCount = (int)Math.Ceiling(input.PlotAreaSqm / 80m),
            ProposedPlantationList = input.ProposedPlantationList,
            HasNoPriorTreeCuttingPermission = true,
            UndertakingSigned = input.UndertakingSigned,
            ApplicantUserId = currentUser.Id,
            CreatedAt = DateTime.UtcNow,
        };

        db.Applications.Add(app);
        await db.SaveChangesAsync(ct);
        return CreatedAtAction(nameof(Get), new { id = app.Id }, MapDetail(app));
    }

    // ---- Submit ----
    [HttpPost("{id:int}/submit")]
    public async Task<ActionResult<ApplicationDetailDto>> Submit(int id, CancellationToken ct)
    {
        var app = await db.Applications.Include(x => x.WorkflowHistory).FirstOrDefaultAsync(x => x.Id == id, ct);
        if (app is null) return NotFound();
        if (app.ApplicantUserId != currentUser.Id) return Forbid();
        if (app.Status != ApplicationStatus.Draft && app.Status != ApplicationStatus.ReturnedForCorrection)
            return BadRequest(new { detail = "Application is not in a submittable state." });

        app.Status = ApplicationStatus.Submitted;
        app.SubmittedAt = DateTime.UtcNow;
        app.UpdatedAt = DateTime.UtcNow;
        app.WorkflowHistory.Add(new WorkflowAction
        {
            Action = "Application Submitted", FromStatus = ApplicationStatus.Draft,
            ToStatus = ApplicationStatus.Submitted, PerformedByUserId = currentUser.Id, PerformedAt = DateTime.UtcNow,
        });
        await db.SaveChangesAsync(ct);
        return MapDetail(app);
    }

    // ---- Staff action (scrutiny / review / decision) ----
    [HttpPost("{id:int}/action")]
    public async Task<ActionResult<ApplicationDetailDto>> Action(int id, [FromBody] ReviewActionInput input, CancellationToken ct)
    {
        var app = await db.Applications.Include(x => x.WorkflowHistory).FirstOrDefaultAsync(x => x.Id == id, ct);
        if (app is null) return NotFound();

        var (toStatus, allowed) = input.Action switch
        {
            "Forward"          => (ApplicationStatus.UnderReview, true),
            "RequestInspection"=> (ApplicationStatus.UnderInspection, true),
            "Return"           => (ApplicationStatus.ReturnedForCorrection, true),
            "Approve"          => (ApplicationStatus.Approved, currentUser.Role is SystemRole.Authority or SystemRole.SuperAdmin),
            "Reject"           => (ApplicationStatus.Rejected, true),
            _                  => (app.Status, false),
        };

        if (!allowed) return Forbid();

        var from = app.Status;
        app.Status = toStatus;
        app.CurrentRemarks = input.Remarks;
        app.UpdatedAt = DateTime.UtcNow;

        if (toStatus == ApplicationStatus.Approved && !string.IsNullOrWhiteSpace(input.NocNumber))
        {
            app.NocOrderNumber = input.NocNumber;
            app.NocIssuedAt = DateTime.UtcNow;
        }

        app.WorkflowHistory.Add(new WorkflowAction
        {
            Action = input.Action!, FromStatus = from, ToStatus = toStatus,
            Remarks = input.Remarks, PerformedByUserId = currentUser.Id, PerformedAt = DateTime.UtcNow,
        });

        await db.SaveChangesAsync(ct);
        return MapDetail(app);
    }

    // ---- Map to DTO ----
    private static ApplicationDetailDto MapDetail(TreeNocApplication a) => new(
        a.Id, a.ApplicationNumber, a.NocType, a.Status,
        a.ApplicantName, a.ApplicantAddress, a.MobileNumber,
        a.Age, a.Occupation, a.AuthorisedSignatory,
        a.SurveyNumber, a.GatNumber, a.PlotNumber,
        a.Village, a.Taluka, a.District,
        a.PlotAreaSqm, a.GoogleCoordinates,
        a.ExistingTreeCount, a.RequiredPlantationCount, a.ProposedPlantationList,
        a.HasNoPriorTreeCuttingPermission, a.CommencementCertificateAttached,
        a.GoogleCoordinatesLast5Years,
        a.ProvisionalNocObtained, a.ProvisionalNocNumber,
        a.TreeCuttingNocObtained, a.TreeCuttingNocDetails,
        a.PreviouslyExistingTrees, a.NewlyPlantedTrees,
        a.UndertakingSigned, a.UndertakingDate?.ToString("yyyy-MM-dd"),
        a.ChallanNumber, a.ChallanAmount, a.ChallanDate?.ToString("yyyy-MM-dd"), a.ChallanAttached,
        a.CurrentRemarks, a.SubmittedAt, a.CreatedAt, a.UpdatedAt,
        a.TreeInventory.Select(t => new TreeInventoryItemDto(t.Id, t.TreeNumber, t.CommonName, t.ScientificName, t.AgeYears, t.HeightMetres, t.GirthMetres, t.Latitude, t.Longitude, t.Remarks)).ToList(),
        a.Documents.Select(d => new DocumentDto(d.Id, d.ChecklistItemNumber, d.Label, d.FileName, d.FileSize, d.UploadedAt, $"/api/applications/{a.Id}/documents/{d.Id}")).ToList(),
        a.WorkflowHistory.OrderBy(w => w.PerformedAt).Select(w => new WorkflowActionDto(w.Id, w.Action, w.FromStatus, w.ToStatus, w.Remarks, w.PerformedBy?.FullName ?? "System", w.PerformedAt)).ToList()
    );
}

public interface ICurrentUser
{
    int Id { get; }
    SystemRole Role { get; }
}
