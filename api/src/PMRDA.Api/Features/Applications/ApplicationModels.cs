using System.ComponentModel.DataAnnotations;
using PMRDA.Api.Domain;

namespace PMRDA.Api.Features.Applications;

// ---- Query ----
public sealed class ApplicationQuery
{
    public NocType? NocType { get; set; }
    public string? Status { get; set; }
    public string? Search { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 25;
}

// ---- List item ----
public sealed record ApplicationListItem(
    int Id, string ApplicationNumber, NocType NocType,
    string ApplicantName, string PropertyAddress,
    string SurveyNumber, string Village,
    ApplicationStatus Status, DateTime? SubmittedAt, DateTime UpdatedAt);

// ---- Detail ----
public sealed record ApplicationDetailDto(
    int Id, string ApplicationNumber, NocType NocType, ApplicationStatus Status,
    string ApplicantName, string ApplicantAddress, string MobileNumber,
    int? Age, string? Occupation, string? AuthorisedSignatory,
    string SurveyNumber, string? GatNumber, string? PlotNumber,
    string Village, string Taluka, string District,
    decimal PlotAreaSqm, string? GoogleCoordinates,
    int ExistingTreeCount, int RequiredPlantationCount, string? ProposedPlantationList,
    bool HasNoPriorTreeCuttingPermission, bool CommencementCertificateAttached,
    string? GoogleCoordinatesLast5Years,
    bool? ProvisionalNocObtained, string? ProvisionalNocNumber,
    bool? TreeCuttingNocObtained, string? TreeCuttingNocDetails,
    int? PreviouslyExistingTrees, int? NewlyPlantedTrees,
    bool UndertakingSigned, string? UndertakingDate,
    string? ChallanNumber, decimal? ChallanAmount, string? ChallanDate, bool ChallanAttached,
    string? CurrentRemarks, DateTime? SubmittedAt, DateTime CreatedAt, DateTime? UpdatedAt,
    List<TreeInventoryItemDto> TreeInventory,
    List<DocumentDto> Documents,
    List<WorkflowActionDto> WorkflowHistory);

public sealed record TreeInventoryItemDto(
    int? Id, string TreeNumber, string CommonName, string ScientificName,
    int? AgeYears, decimal? HeightMetres, decimal? GirthMetres,
    decimal? Latitude, decimal? Longitude, string? Remarks);

public sealed record DocumentDto(
    int Id, int ChecklistItemNumber, string Label,
    string FileName, long FileSize, DateTime UploadedAt, string Url);

public sealed record WorkflowActionDto(
    int Id, string Action, ApplicationStatus FromStatus, ApplicationStatus ToStatus,
    string? Remarks, string PerformedBy, DateTime PerformedAt);

// ---- Create / Update ----
public sealed class ApplicationInput
{
    [Required] public NocType? NocType { get; set; }
    [Required, StringLength(200, MinimumLength = 2)] public string ApplicantName { get; set; } = "";
    [Required, StringLength(500)] public string ApplicantAddress { get; set; } = "";
    [Required, RegularExpression("^[6-9]\\d{9}$")] public string MobileNumber { get; set; } = "";
    public int? Age { get; set; }
    public string? Occupation { get; set; }
    public string? AuthorisedSignatory { get; set; }
    [Required, StringLength(50)] public string SurveyNumber { get; set; } = "";
    public string? GatNumber { get; set; }
    public string? PlotNumber { get; set; }
    [Required, StringLength(100)] public string Village { get; set; } = "";
    [Required, StringLength(100)] public string Taluka { get; set; } = "";
    public string District { get; set; } = "Pune";
    [Required, Range(1, 10000000)] public decimal PlotAreaSqm { get; set; }
    public string? GoogleCoordinates { get; set; }
    [Range(0, 10000)] public int ExistingTreeCount { get; set; }
    public string? ProposedPlantationList { get; set; }
    public string? GoogleCoordinatesLast5Years { get; set; }
    public bool? ProvisionalNocObtained { get; set; }
    public string? ProvisionalNocNumber { get; set; }
    public bool? TreeCuttingNocObtained { get; set; }
    public string? TreeCuttingNocDetails { get; set; }
    public int? PreviouslyExistingTrees { get; set; }
    public int? NewlyPlantedTrees { get; set; }
    public bool UndertakingSigned { get; set; }
    public string? ChallanNumber { get; set; }
    public decimal? ChallanAmount { get; set; }
    public string? ChallanDate { get; set; }
}

// ---- Workflow action ----
public sealed class ReviewActionInput
{
    [Required] public string? Action { get; set; }
    [Required, StringLength(2000)] public string Remarks { get; set; } = "";
    public string? NocNumber { get; set; }
}

// ---- Paged result ----
public sealed record PagedResult<T>(List<T> Items, int Total, int Page, int PageSize);
