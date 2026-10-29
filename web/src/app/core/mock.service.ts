/**
 * Mock data service — used when API is not connected.
 * Provides realistic PMRDA Tree NOC demo data.
 */
import { Injectable, signal } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import {
  ApplicationDetail, ApplicationListItem, DashboardStats, InspectionReport, NocType,
  PagedResult, TreeInventoryItem, WorkflowAction,
} from './models';

let nextId = 10;

const MOCK_TREES: TreeInventoryItem[] = [
  { id: 1, treeNumber: 'T-01', commonName: 'Banyan', scientificName: 'Ficus benghalensis', ageYears: 15, heightMetres: 8.5, girthMetres: 1.2, latitude: 18.5204, longitude: 73.8567 },
  { id: 2, treeNumber: 'T-02', commonName: 'Neem', scientificName: 'Azadirachta indica', ageYears: 10, heightMetres: 6.0, girthMetres: 0.85, latitude: 18.5206, longitude: 73.8569 },
  { id: 3, treeNumber: 'T-03', commonName: 'Mango', scientificName: 'Mangifera indica', ageYears: 20, heightMetres: 9.0, girthMetres: 1.5, latitude: 18.5208, longitude: 73.8571 },
];

const MOCK_HISTORY: WorkflowAction[] = [
  { id: 1, action: 'Application Submitted', fromStatus: 'Draft', toStatus: 'Submitted', performedBy: 'Rajesh Patil (Applicant)', performedAt: '2026-10-15T10:30:00' },
  { id: 2, action: 'Inward Registered', fromStatus: 'Submitted', toStatus: 'UnderScrutiny', remarks: 'Registered. Ref: PMRDA/NOC/2026/0042', performedBy: 'Savita Jadhav (Assistant)', performedAt: '2026-10-16T09:15:00' },
];

const MOCK_APPLICATIONS: ApplicationDetail[] = [
  {
    id: 1, applicationNumber: 'PMRDA/TNOC/PROV/2026/0041',
    nocType: 'Provisional', status: 'UnderScrutiny',
    applicantName: 'Rajesh Patil', applicantAddress: 'Flat 201, Shivam Residency, Wakad, Pune 411057',
    mobileNumber: '9876543210', age: 42, occupation: 'Builder', authorisedSignatory: 'Rajesh Patil',
    surveyNumber: '123/1', gatNumber: '123', plotNumber: 'Plot A', village: 'Wadgaon Sheri', taluka: 'Haveli', district: 'Pune',
    plotAreaSqm: 4500, googleCoordinates: '18.5204°N, 73.8567°E',
    existingTreeCount: 3, requiredPlantationCount: 57,
    treeInventory: MOCK_TREES, proposedPlantationList: 'Native varieties: Neem (20), Banyan (10), Peepal (10), Gulmohar (10), Rain Tree (7)',
    hasNoPriorTreeCuttingPermission: true, commencementCertificateAttached: true,
    googleCoordinatesLast5Years: 'Available — submitted with application',
    undertakingSigned: true, undertakingDate: '2026-10-14',
    challanAttached: true, challanNumber: 'CHN/2026/8821', challanAmount: 5000, challanDate: '2026-10-14',
    documents: [
      { id: 1, checklistItemNumber: 1, label: 'Application letter', fileName: 'application_letter.pdf', fileSize: 245000, uploadedAt: '2026-10-14T14:00:00', url: '#' },
      { id: 2, checklistItemNumber: 2, label: 'Land ownership documents', fileName: 'ownership_docs.pdf', fileSize: 1240000, uploadedAt: '2026-10-14T14:05:00', url: '#' },
      { id: 3, checklistItemNumber: 3, label: 'Master layout and landscape plan', fileName: 'layout_plan.pdf', fileSize: 3500000, uploadedAt: '2026-10-14T14:10:00', url: '#' },
      { id: 4, checklistItemNumber: 5, label: 'Tree survey report', fileName: 'tree_survey.pdf', fileSize: 2100000, uploadedAt: '2026-10-14T14:15:00', url: '#' },
      { id: 5, checklistItemNumber: 14, label: 'Deposit challan', fileName: 'challan.pdf', fileSize: 180000, uploadedAt: '2026-10-14T14:20:00', url: '#' },
    ],
    workflowHistory: MOCK_HISTORY,
    createdAt: '2026-10-14T12:00:00', updatedAt: '2026-10-16T09:15:00', submittedAt: '2026-10-15T10:30:00',
  },
  {
    id: 2, applicationNumber: 'PMRDA/TNOC/FINAL/2026/0028',
    nocType: 'Final', status: 'Approved',
    applicantName: 'Sunita Deshpande', applicantAddress: 'Plot 15, Sector 7, Koregaon Park, Pune 411001',
    mobileNumber: '9823456780', age: 38, occupation: 'Developer',
    surveyNumber: '45/2', gatNumber: '45', plotNumber: 'Plot 15', village: 'Uruli Kanchan', taluka: 'Purandar', district: 'Pune',
    plotAreaSqm: 2400, googleCoordinates: '18.4623°N, 74.0513°E',
    existingTreeCount: 2, requiredPlantationCount: 30,
    treeInventory: MOCK_TREES.slice(0, 2),
    hasNoPriorTreeCuttingPermission: true, commencementCertificateAttached: true,
    provisionalNocObtained: true, provisionalNocNumber: 'PMRDA/TNOC/PROV/2025/0015',
    treeCuttingNocObtained: false, previouslyExistingTrees: 2, newlyPlantedTrees: 30,
    undertakingSigned: true, undertakingDate: '2026-09-01',
    challanAttached: true, challanNumber: 'CHN/2026/7701', challanAmount: 3000,
    documents: [],
    workflowHistory: [
      ...MOCK_HISTORY,
      { id: 3, action: 'Forwarded for Inspection', fromStatus: 'UnderScrutiny', toStatus: 'UnderInspection', performedBy: 'Ganesh More (Assistant)', performedAt: '2026-09-10T11:00:00' },
      { id: 4, action: 'Inspection Report Submitted', fromStatus: 'UnderInspection', toStatus: 'UnderReview', remarks: 'All 30 trees verified. Native varieties. Geotagging done.', performedBy: 'Inspector Suresh Kulkarni', performedAt: '2026-09-18T15:30:00' },
      { id: 5, action: 'NOC Approved', fromStatus: 'PendingDecision', toStatus: 'Approved', remarks: 'All conditions satisfied. NOC granted.', performedBy: 'Director Anand Jagtap (HoD)', performedAt: '2026-09-25T10:00:00' },
    ],
    createdAt: '2026-09-01T09:00:00', updatedAt: '2026-09-25T10:00:00', submittedAt: '2026-09-02T10:00:00',
  },
  {
    id: 3, applicationNumber: 'PMRDA/TNOC/PROV/2026/0038',
    nocType: 'Provisional', status: 'ReturnedForCorrection',
    applicantName: 'Prashant Gaikwad', applicantAddress: 'Survey No. 67/3, Undri, Pune 411060',
    mobileNumber: '9765432109', age: 55, occupation: 'Landowner',
    surveyNumber: '67/3', gatNumber: '67', plotNumber: '', village: 'Undri', taluka: 'Haveli', district: 'Pune',
    plotAreaSqm: 6800, googleCoordinates: '18.4803°N, 73.9285°E',
    existingTreeCount: 8, requiredPlantationCount: 85,
    treeInventory: MOCK_TREES,
    hasNoPriorTreeCuttingPermission: true, commencementCertificateAttached: false,
    undertakingSigned: true,
    challanAttached: false,
    currentRemarks: 'Commencement certificate missing. Tree survey report does not include girth measurements. Please resubmit with corrections.',
    documents: [],
    workflowHistory: [
      { id: 1, action: 'Application Submitted', fromStatus: 'Draft', toStatus: 'Submitted', performedBy: 'Prashant Gaikwad (Applicant)', performedAt: '2026-10-10T09:00:00' },
      { id: 2, action: 'Returned for Correction', fromStatus: 'UnderScrutiny', toStatus: 'ReturnedForCorrection', remarks: 'Commencement certificate missing. Tree survey report does not include girth measurements.', performedBy: 'Savita Jadhav (Assistant)', performedAt: '2026-10-12T14:00:00' },
    ],
    createdAt: '2026-10-09T11:00:00', updatedAt: '2026-10-12T14:00:00', submittedAt: '2026-10-10T09:00:00',
  },
];

@Injectable({ providedIn: 'root' })
export class MockNocService {
  private readonly apps = signal<ApplicationDetail[]>(MOCK_APPLICATIONS);

  getDashboard(): Observable<DashboardStats> {
    return of({
      totalApplications: 41, provisional: 28, final: 13,
      pending: 18, approved: 19, rejected: 4, pendingMyAction: 5,
    }).pipe(delay(80));
  }

  listApplications(): Observable<PagedResult<ApplicationListItem>> {
    const items: ApplicationListItem[] = this.apps().map((a) => ({
      id: a.id, applicationNumber: a.applicationNumber, nocType: a.nocType,
      applicantName: a.applicantName, propertyAddress: `${a.surveyNumber}, ${a.village}`,
      surveyNumber: a.surveyNumber, village: a.village, status: a.status,
      submittedAt: a.submittedAt ?? null, updatedAt: a.updatedAt,
    }));
    return of({ items, total: items.length, page: 1, pageSize: 25 }).pipe(delay(80));
  }

  listForReview(): Observable<PagedResult<ApplicationListItem>> {
    const reviewable: ApplicationListItem[] = this.apps()
      .filter((a) => a.status !== 'Draft' && a.status !== 'Approved' && a.status !== 'Rejected')
      .map((a) => ({
        id: a.id, applicationNumber: a.applicationNumber, nocType: a.nocType,
        applicantName: a.applicantName, propertyAddress: `${a.surveyNumber}, ${a.village}`,
        surveyNumber: a.surveyNumber, village: a.village, status: a.status,
        submittedAt: a.submittedAt ?? null, updatedAt: a.updatedAt,
      }));
    return of({ items: reviewable, total: reviewable.length, page: 1, pageSize: 25 }).pipe(delay(80));
  }

  getApplication(id: number): Observable<ApplicationDetail> {
    const app = this.apps().find((a) => a.id === id);
    if (!app) return throwError(() => new Error('Application not found'));
    return of({ ...app }).pipe(delay(80));
  }

  createApplication(input: Partial<ApplicationDetail>): Observable<ApplicationDetail> {
    const now = new Date().toISOString();
    const app: ApplicationDetail = {
      id: ++nextId,
      applicationNumber: `PMRDA/TNOC/${input.nocType === 'Final' ? 'FINAL' : 'PROV'}/2026/${String(nextId).padStart(4, '0')}`,
      nocType: input.nocType as NocType ?? 'Provisional',
      status: 'Draft',
      applicantName: input.applicantName ?? '',
      applicantAddress: input.applicantAddress ?? '',
      mobileNumber: input.mobileNumber ?? '',
      surveyNumber: input.surveyNumber ?? '',
      village: input.village ?? '',
      taluka: input.taluka ?? '',
      district: input.district ?? 'Pune',
      plotAreaSqm: input.plotAreaSqm ?? 0,
      existingTreeCount: input.existingTreeCount ?? 0,
      requiredPlantationCount: Math.ceil((input.plotAreaSqm ?? 0) / 80),
      hasNoPriorTreeCuttingPermission: true,
      commencementCertificateAttached: false,
      undertakingSigned: false,
      challanAttached: false,
      treeInventory: [],
      documents: [],
      workflowHistory: [],
      createdAt: now, updatedAt: now,
    };
    this.apps.update((list) => [...list, app]);
    return of(app).pipe(delay(80));
  }

  submitApplication(id: number): Observable<ApplicationDetail> {
    const now = new Date().toISOString();
    this.apps.update((list) => list.map((a) => {
      if (a.id !== id) return a;
      const action: WorkflowAction = {
        id: Date.now(), action: 'Application Submitted', fromStatus: 'Draft', toStatus: 'Submitted',
        performedBy: 'Applicant', performedAt: now,
      };
      return { ...a, status: 'Submitted', submittedAt: now, updatedAt: now, workflowHistory: [...a.workflowHistory, action] };
    }));
    return this.getApplication(id);
  }

  submitInspectionReport(id: number, report: Omit<InspectionReport, 'id' | 'submittedAt'>): Observable<ApplicationDetail> {
    const now = new Date().toISOString();
    const fullReport: InspectionReport = { ...report, id: Date.now(), submittedAt: now };
    this.apps.update((list) => list.map((a) => {
      if (a.id !== id) return a;
      const wf: WorkflowAction = {
        id: Date.now(), action: 'Inspection Report Submitted', fromStatus: 'UnderInspection',
        toStatus: 'InspectionReportSubmitted', remarks: report.findings,
        performedBy: report.inspectorName, performedAt: now,
      };
      return { ...a, status: 'InspectionReportSubmitted', updatedAt: now, inspectionReport: fullReport, workflowHistory: [...a.workflowHistory, wf] };
    }));
    return this.getApplication(id);
  }

  reviewAction(id: number, action: string, remarks: string): Observable<ApplicationDetail> {
    const now = new Date().toISOString();
    const current = this.apps().find((a) => a.id === id)?.status ?? 'Submitted';
    const statusMap: Record<string, ApplicationDetail['status']> = {
      Approve: 'Approved', Reject: 'Rejected', Return: 'ReturnedForCorrection',
      // Forward advances one step: Submitted→UnderScrutiny, anything later→UnderReview
      Forward: current === 'Submitted' ? 'UnderScrutiny' : 'UnderReview',
      RequestInspection: 'UnderInspection',
    };
    const toStatus = statusMap[action] ?? 'UnderScrutiny';
    this.apps.update((list) => list.map((a) => {
      if (a.id !== id) return a;
      const wf: WorkflowAction = {
        id: Date.now(), action, fromStatus: a.status, toStatus,
        remarks, performedBy: 'Staff', performedAt: now,
      };
      return { ...a, status: toStatus, updatedAt: now, currentRemarks: remarks, workflowHistory: [...a.workflowHistory, wf] };
    }));
    return this.getApplication(id);
  }
}
