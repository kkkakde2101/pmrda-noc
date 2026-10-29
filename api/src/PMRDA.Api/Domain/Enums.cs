namespace PMRDA.Api.Domain;

public enum NocType { Provisional, Final }

public enum ApplicationStatus
{
    Draft,
    Submitted,
    UnderScrutiny,
    ReturnedForCorrection,
    UnderInspection,
    InspectionReportSubmitted,
    UnderReview,
    PendingDecision,
    ChallanPending,
    Approved,
    Rejected,
}

public enum SystemRole { Applicant, Assistant, Superintendent, Authority, SuperAdmin }
