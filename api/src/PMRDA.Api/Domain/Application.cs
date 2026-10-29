namespace PMRDA.Api.Domain;

public class TreeNocApplication : AuditableEntity
{
    public int Id { get; set; }
    public string ApplicationNumber { get; set; } = "";
    public NocType NocType { get; set; }
    public ApplicationStatus Status { get; set; } = ApplicationStatus.Draft;

    // Applicant
    public string ApplicantName { get; set; } = "";
    public string ApplicantAddress { get; set; } = "";
    public string MobileNumber { get; set; } = "";
    public int? Age { get; set; }
    public string? Occupation { get; set; }
    public string? AuthorisedSignatory { get; set; }

    // Property
    public string SurveyNumber { get; set; } = "";
    public string? GatNumber { get; set; }
    public string? PlotNumber { get; set; }
    public string Village { get; set; } = "";
    public string Taluka { get; set; } = "";
    public string District { get; set; } = "Pune";
    public decimal PlotAreaSqm { get; set; }
    public string? GoogleCoordinates { get; set; }

    // Tree data
    public int ExistingTreeCount { get; set; }
    public int RequiredPlantationCount { get; set; }
    public string? ProposedPlantationList { get; set; }
    public string? GoogleCoordinatesLast5Years { get; set; }

    // Provisional-specific
    public bool HasNoPriorTreeCuttingPermission { get; set; }
    public bool CommencementCertificateAttached { get; set; }

    // Final-specific
    public bool? ProvisionalNocObtained { get; set; }
    public string? ProvisionalNocNumber { get; set; }
    public bool? TreeCuttingNocObtained { get; set; }
    public string? TreeCuttingNocDetails { get; set; }
    public int? PreviouslyExistingTrees { get; set; }
    public int? NewlyPlantedTrees { get; set; }

    // Undertaking
    public bool UndertakingSigned { get; set; }
    public DateOnly? UndertakingDate { get; set; }

    // Challan
    public string? ChallanNumber { get; set; }
    public decimal? ChallanAmount { get; set; }
    public DateOnly? ChallanDate { get; set; }
    public bool ChallanAttached { get; set; }

    // Workflow
    public string? CurrentRemarks { get; set; }
    public DateTime? SubmittedAt { get; set; }
    public string? NocOrderNumber { get; set; }
    public DateTime? NocIssuedAt { get; set; }

    // Navigation
    public int ApplicantUserId { get; set; }
    public User? ApplicantUser { get; set; }
    public List<TreeInventoryItem> TreeInventory { get; set; } = [];
    public List<ApplicationDocument> Documents { get; set; } = [];
    public List<WorkflowAction> WorkflowHistory { get; set; } = [];
    public SiteInspectionReport? InspectionReport { get; set; }
}

public class TreeInventoryItem
{
    public int Id { get; set; }
    public int ApplicationId { get; set; }
    public TreeNocApplication? Application { get; set; }
    public string TreeNumber { get; set; } = "";
    public string CommonName { get; set; } = "";
    public string ScientificName { get; set; } = "";
    public int? AgeYears { get; set; }
    public decimal? HeightMetres { get; set; }
    public decimal? GirthMetres { get; set; }
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public string? Remarks { get; set; }
}

public class ApplicationDocument
{
    public int Id { get; set; }
    public int ApplicationId { get; set; }
    public TreeNocApplication? Application { get; set; }
    public int ChecklistItemNumber { get; set; }
    public string Label { get; set; } = "";
    public string FileName { get; set; } = "";
    public string StoragePath { get; set; } = "";
    public long FileSize { get; set; }
    public DateTime UploadedAt { get; set; }
    public int UploadedByUserId { get; set; }
}

public class WorkflowAction
{
    public int Id { get; set; }
    public int ApplicationId { get; set; }
    public TreeNocApplication? Application { get; set; }
    public string Action { get; set; } = "";
    public ApplicationStatus FromStatus { get; set; }
    public ApplicationStatus ToStatus { get; set; }
    public string? Remarks { get; set; }
    public int PerformedByUserId { get; set; }
    public User? PerformedBy { get; set; }
    public DateTime PerformedAt { get; set; }
}

public class SiteInspectionReport
{
    public int Id { get; set; }
    public int ApplicationId { get; set; }
    public TreeNocApplication? Application { get; set; }
    public string InspectorName { get; set; } = "";
    public DateOnly InspectionDate { get; set; }
    public int TotalTreesOnSite { get; set; }
    public decimal TotalPlotArea { get; set; }
    public bool TreesVerified { get; set; }
    public int RecommendedPlantationCount { get; set; }
    public string Findings { get; set; } = "";
    public string? Remarks { get; set; }
    public DateTime SubmittedAt { get; set; }
    public int SubmittedByUserId { get; set; }
}
