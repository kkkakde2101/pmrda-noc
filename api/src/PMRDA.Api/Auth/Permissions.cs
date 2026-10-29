namespace PMRDA.Api.Auth;

public static class Permissions
{
    public const string ApplicationsView   = "applications.view";
    public const string ApplicationsCreate = "applications.create";
    public const string ApplicationsEdit   = "applications.edit";
    public const string ApplicationsSubmit = "applications.submit";
    public const string ScrutinyView       = "scrutiny.view";
    public const string ScrutinyAction     = "scrutiny.action";
    public const string InspectionView     = "inspection.view";
    public const string InspectionSubmit   = "inspection.submit";
    public const string ReviewAction       = "review.action";
    public const string DecisionAction     = "decision.action";
    public const string UsersView          = "users.view";
    public const string UsersEdit          = "users.edit";
    public const string RolesView          = "roles.view";
    public const string RolesEdit          = "roles.edit";
    public const string DashboardView      = "dashboard.view";

    public static readonly string[] Applicant    = [ApplicationsView, ApplicationsCreate, ApplicationsEdit, ApplicationsSubmit, DashboardView];
    public static readonly string[] Assistant    = [ScrutinyView, ScrutinyAction, InspectionView, ApplicationsView, DashboardView];
    public static readonly string[] Superintendent = [ScrutinyView, ScrutinyAction, InspectionView, InspectionSubmit, ReviewAction, ApplicationsView, DashboardView];
    public static readonly string[] Authority    = [ScrutinyView, ReviewAction, DecisionAction, ApplicationsView, DashboardView];
    public static readonly string[] SuperAdmin   = [UsersView, UsersEdit, RolesView, RolesEdit, ApplicationsView, ScrutinyView, DashboardView];
}
