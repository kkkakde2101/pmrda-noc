// ---- Enums / literal types -----------------------------------------------------------------------

export type NocType = 'Provisional' | 'Final';

export type ApplicationStatus =
  | 'Draft'
  | 'Submitted'
  | 'UnderScrutiny'
  | 'ReturnedForCorrection'
  | 'UnderInspection'
  | 'InspectionReportSubmitted'
  | 'UnderReview'
  | 'PendingDecision'
  | 'ChallanPending'
  | 'Approved'
  | 'Rejected';

export type SystemRole = 'Applicant' | 'Assistant' | 'Superintendent' | 'Authority' | 'SuperAdmin';

// ---- Permission keys (kept in sync with Permissions.cs) ------------------------------------------

export const P = {
  applicationsView:     'applications.view',
  applicationsCreate:   'applications.create',
  applicationsEdit:     'applications.edit',
  applicationsSubmit:   'applications.submit',
  scrutinyView:         'scrutiny.view',
  scrutinyAction:       'scrutiny.action',
  inspectionView:       'inspection.view',
  inspectionSubmit:     'inspection.submit',
  reviewAction:         'review.action',
  decisionAction:       'decision.action',
  usersView:            'users.view',
  usersEdit:            'users.edit',
  rolesView:            'roles.view',
  rolesEdit:            'roles.edit',
  dashboardView:        'dashboard.view',
} as const;

// ---- Auth models ---------------------------------------------------------------------------------

export interface LoginResponse {
  token: string;
  expiresAt: string;
}

export interface Me {
  id: number;
  loginName: string;
  displayName: string;
  email: string;
  role: SystemRole;
  permissions: string[];
  mustChangePassword: boolean;
}

// ---- Application models --------------------------------------------------------------------------

export interface ApplicationListItem {
  id: number;
  applicationNumber: string;
  nocType: NocType;
  applicantName: string;
  propertyAddress: string;
  surveyNumber: string;
  village: string;
  status: ApplicationStatus;
  submittedAt: string | null;
  updatedAt: string;
}

export interface ApplicationDetail {
  id: number;
  applicationNumber: string;
  nocType: NocType;
  status: ApplicationStatus;
  // Applicant
  applicantName: string;
  applicantAddress: string;
  mobileNumber: string;
  age?: number;
  occupation?: string;
  authorisedSignatory?: string;
  // Property
  surveyNumber: string;
  gatNumber?: string;
  plotNumber?: string;
  village: string;
  taluka: string;
  district: string;
  plotAreaSqm: number;
  googleCoordinates?: string;
  // Tree data
  existingTreeCount: number;
  requiredPlantationCount: number;
  treeInventory: TreeInventoryItem[];
  proposedPlantationList?: string;
  // Provisional-specific
  hasNoPriorTreeCuttingPermission: boolean;
  commencementCertificateAttached: boolean;
  googleCoordinatesLast5Years?: string;
  // Final-specific
  provisionalNocObtained?: boolean;
  provisionalNocNumber?: string;
  treeCuttingNocObtained?: boolean;
  treeCuttingNocDetails?: string;
  totalExistingTrees?: number;
  previouslyExistingTrees?: number;
  newlyPlantedTrees?: number;
  // Undertaking
  undertakingSigned: boolean;
  undertakingDate?: string;
  // Challan
  challanNumber?: string;
  challanAmount?: number;
  challanDate?: string;
  challanAttached: boolean;
  // Workflow
  documents: DocumentItem[];
  workflowHistory: WorkflowAction[];
  inspectionReport?: InspectionReport;
  currentRemarks?: string;
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TreeInventoryItem {
  id?: number;
  treeNumber: string;
  commonName: string;
  scientificName: string;
  ageYears?: number;
  heightMetres?: number;
  girthMetres?: number;
  latitude?: number;
  longitude?: number;
  remarks?: string;
}

export interface DocumentItem {
  id: number;
  checklistItemNumber: number;
  label: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  url: string;
}

export interface WorkflowAction {
  id: number;
  action: string;
  fromStatus: ApplicationStatus;
  toStatus: ApplicationStatus;
  remarks?: string;
  performedBy: string;
  performedAt: string;
}

export interface InspectionReport {
  id: number;
  inspectorName: string;
  inspectionDate: string;
  totalTreesOnSite: number;
  totalPlotArea: number;
  treesVerified: boolean;
  recommendedPlantationCount: number;
  findings: string;
  remarks?: string;
  geotaggingReport?: string;
  submittedAt: string;
}

// ---- Staff review models -------------------------------------------------------------------------

export interface ReviewActionInput {
  action: 'Approve' | 'Reject' | 'Return' | 'Forward' | 'RequestInspection';
  remarks: string;
  nocNumber?: string;
}

export interface InspectionReportInput {
  inspectorName: string;
  inspectionDate: string;
  totalTreesOnSite: number;
  totalPlotArea: number;
  treesVerified: boolean;
  recommendedPlantationCount: number;
  findings: string;
  remarks?: string;
}

// ---- Dashboard ---------------------------------------------------------------------------------

export interface DashboardStats {
  totalApplications: number;
  provisional: number;
  final: number;
  pending: number;
  approved: number;
  rejected: number;
  pendingMyAction: number;
}

// ---- Misc ---------------------------------------------------------------------------------------

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface Option {
  id: number | string;
  name: string;
}

export const NOC_TYPE_LABELS: Record<NocType, string> = {
  Provisional: 'Provisional Tree NOC',
  Final: 'Final Tree Completion NOC',
};

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  Draft: 'Draft',
  Submitted: 'Submitted',
  UnderScrutiny: 'Under Scrutiny',
  ReturnedForCorrection: 'Returned for Correction',
  UnderInspection: 'Under Inspection',
  InspectionReportSubmitted: 'Inspection Report Submitted',
  UnderReview: 'Under Review',
  PendingDecision: 'Pending Decision',
  ChallanPending: 'Challan Pending',
  Approved: 'Approved',
  Rejected: 'Rejected',
};

export const STATUS_BADGE: Record<ApplicationStatus, 'info' | 'warning' | 'success' | 'danger' | 'secondary'> = {
  Draft: 'secondary',
  Submitted: 'info',
  UnderScrutiny: 'info',
  ReturnedForCorrection: 'warning',
  UnderInspection: 'info',
  InspectionReportSubmitted: 'info',
  UnderReview: 'info',
  PendingDecision: 'warning',
  ChallanPending: 'warning',
  Approved: 'success',
  Rejected: 'danger',
};
