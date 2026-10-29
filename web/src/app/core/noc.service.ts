import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  ApplicationDetail, ApplicationListItem, DashboardStats,
  InspectionReportInput, NocType, PagedResult, ReviewActionInput,
} from './models';

export interface ApplicationQuery {
  nocType?: NocType;
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface ApplicationInput {
  nocType: NocType;
  applicantName: string;
  applicantAddress: string;
  mobileNumber: string;
  age?: number;
  occupation?: string;
  authorisedSignatory?: string;
  surveyNumber: string;
  gatNumber?: string;
  plotNumber?: string;
  village: string;
  taluka: string;
  district: string;
  plotAreaSqm: number;
  googleCoordinates?: string;
  existingTreeCount: number;
  proposedPlantationList?: string;
  googleCoordinatesLast5Years?: string;
  provisionalNocObtained?: boolean;
  provisionalNocNumber?: string;
  treeCuttingNocObtained?: boolean;
  treeCuttingNocDetails?: string;
  previouslyExistingTrees?: number;
  newlyPlantedTrees?: number;
  undertakingSigned: boolean;
  challanNumber?: string;
  challanAmount?: number;
  challanDate?: string;
}

@Injectable({ providedIn: 'root' })
export class NocService {
  private readonly http = inject(HttpClient);

  getDashboard(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>('/api/dashboard');
  }

  listApplications(q: ApplicationQuery): Observable<PagedResult<ApplicationListItem>> {
    let params = new HttpParams();
    if (q.nocType) params = params.set('nocType', q.nocType);
    if (q.status) params = params.set('status', q.status);
    if (q.search) params = params.set('search', q.search);
    if (q.page) params = params.set('page', q.page);
    if (q.pageSize) params = params.set('pageSize', q.pageSize ?? 25);
    return this.http.get<PagedResult<ApplicationListItem>>('/api/applications', { params });
  }

  listForReview(q: ApplicationQuery): Observable<PagedResult<ApplicationListItem>> {
    let params = new HttpParams();
    if (q.nocType) params = params.set('nocType', q.nocType);
    if (q.status) params = params.set('status', q.status);
    if (q.search) params = params.set('search', q.search);
    if (q.page) params = params.set('page', q.page ?? 1);
    if (q.pageSize) params = params.set('pageSize', q.pageSize ?? 25);
    return this.http.get<PagedResult<ApplicationListItem>>('/api/applications/review-queue', { params });
  }

  getApplication(id: number): Observable<ApplicationDetail> {
    return this.http.get<ApplicationDetail>(`/api/applications/${id}`);
  }

  createApplication(input: ApplicationInput): Observable<ApplicationDetail> {
    return this.http.post<ApplicationDetail>('/api/applications', input);
  }

  updateApplication(id: number, input: ApplicationInput): Observable<ApplicationDetail> {
    return this.http.put<ApplicationDetail>(`/api/applications/${id}`, input);
  }

  submitApplication(id: number): Observable<ApplicationDetail> {
    return this.http.post<ApplicationDetail>(`/api/applications/${id}/submit`, {});
  }

  uploadDocument(applicationId: number, checklistItemNumber: number, file: File): Observable<{ id: number; url: string }> {
    const form = new FormData();
    form.append('file', file);
    form.append('checklistItemNumber', String(checklistItemNumber));
    return this.http.post<{ id: number; url: string }>(`/api/applications/${applicationId}/documents`, form);
  }

  deleteDocument(applicationId: number, documentId: number): Observable<void> {
    return this.http.delete<void>(`/api/applications/${applicationId}/documents/${documentId}`);
  }

  saveTreeInventory(applicationId: number, items: unknown[]): Observable<void> {
    return this.http.put<void>(`/api/applications/${applicationId}/tree-inventory`, { items });
  }

  reviewAction(applicationId: number, input: ReviewActionInput): Observable<ApplicationDetail> {
    return this.http.post<ApplicationDetail>(`/api/applications/${applicationId}/action`, input);
  }

  submitInspectionReport(applicationId: number, input: InspectionReportInput): Observable<ApplicationDetail> {
    return this.http.post<ApplicationDetail>(`/api/applications/${applicationId}/inspection`, input);
  }
}
