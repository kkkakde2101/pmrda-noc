import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';
import { MockNocService } from '../../core/mock.service';
import { formatDate, formatDateTime } from '../../core/support';
import { ApplicationStatus, NOC_TYPE_LABELS } from '../../core/models';
import { StatusBadge } from '../../shared/ui';

@Component({
  selector: 'app-review-detail',
  imports: [RouterLink, FormsModule, StatusBadge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (app(); as a) {
      <div class="page-header">
        <div>
          <h1>Review: {{ a.applicationNumber }}</h1>
          <div class="breadcrumb">
            <a routerLink="/">Home</a><span>/</span>
            <a routerLink="/review">Review Queue</a><span>/</span>
            <span>{{ a.applicationNumber }}</span>
          </div>
        </div>
        <app-status-badge [status]="a.status" />
      </div>

      <div class="review-layout">
        <!-- Application summary (left) -->
        <div class="review-main">
          <div class="panel">
            <div class="panel-heading"><h3>Application Summary</h3></div>
            <div class="panel-body">
              <div class="summary-grid">
                <div class="summary-item">
                  <span class="summary-label">NOC Type</span>
                  <span>{{ nocLabels[a.nocType] }}</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">Applicant</span>
                  <span>{{ a.applicantName }} · {{ a.mobileNumber }}</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">Property</span>
                  <span>Survey No. {{ a.surveyNumber }}, {{ a.village }}, {{ a.taluka }}, Pune</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">Plot Area</span>
                  <span>{{ a.plotAreaSqm }} sq.m — {{ a.requiredPlantationCount }} trees required</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">Existing Trees</span>
                  <span>{{ a.existingTreeCount }} trees on site</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">Submitted</span>
                  <span>{{ formatDate(a.submittedAt) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Tree inventory -->
          <div class="panel">
            <div class="panel-heading"><h3>Tree Inventory ({{ a.treeInventory.length }} trees)</h3></div>
            @if (a.treeInventory.length) {
              <div class="table-wrap">
                <table class="table">
                  <thead>
                    <tr><th>No.</th><th>Common Name</th><th>Scientific Name</th><th>Age (yr)</th><th>Height (m)</th><th>Girth (m)</th><th>Coordinates</th></tr>
                  </thead>
                  <tbody>
                    @for (t of a.treeInventory; track t.id) {
                      <tr>
                        <td>{{ t.treeNumber }}</td>
                        <td>{{ t.commonName }}</td>
                        <td><em>{{ t.scientificName }}</em></td>
                        <td>{{ t.ageYears ?? '—' }}</td>
                        <td>{{ t.heightMetres ?? '—' }}</td>
                        <td>{{ t.girthMetres ?? '—' }}</td>
                        <td style="font-size:12px">{{ t.latitude }}, {{ t.longitude }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            } @else {
              <div class="panel-body text-muted">No tree inventory provided.</div>
            }
          </div>

          <!-- Documents -->
          <div class="panel">
            <div class="panel-heading"><h3>Submitted Documents ({{ a.documents.length }})</h3></div>
            @if (a.documents.length) {
              <ul class="checklist" style="padding:0 16px">
                @for (doc of a.documents; track doc.id) {
                  <li class="checklist-item">
                    <div class="checklist-num">{{ doc.checklistItemNumber }}</div>
                    <div class="checklist-content">
                      <div class="checklist-label">{{ doc.label }}</div>
                      <div class="checklist-uploaded ok">
                        <i class="fa-solid fa-circle-check"></i> {{ doc.fileName }}
                        <a href="#" class="btn btn-sm btn-secondary" style="margin-left:8px">
                          <i class="fa-solid fa-download"></i> View
                        </a>
                      </div>
                    </div>
                  </li>
                }
              </ul>
            } @else {
              <div class="panel-body text-muted">No documents uploaded.</div>
            }
          </div>

          <!-- History -->
          <div class="panel">
            <div class="panel-heading"><h3>Application History</h3></div>
            <div class="panel-body">
              <ul class="timeline">
                @for (wf of a.workflowHistory; track wf.id) {
                  <li class="timeline-item">
                    <div class="timeline-dot" [class]="dotClass(wf.toStatus)">
                      <i class="fa-solid" [class]="dotIcon(wf.toStatus)"></i>
                    </div>
                    <div class="timeline-body">
                      <div class="timeline-title">{{ wf.action }}</div>
                      <div class="timeline-meta">{{ wf.performedBy }} · {{ formatDateTime(wf.performedAt) }}</div>
                      @if (wf.remarks) { <div class="timeline-remarks">{{ wf.remarks }}</div> }
                    </div>
                  </li>
                }
              </ul>
            </div>
          </div>
        </div>

        <!-- Action panel (right) -->
        <div class="action-panel">
          <div class="panel">
            <div class="panel-heading"><h3>Take Action</h3></div>
            <div class="panel-body">
              <div class="field" style="margin-bottom:14px">
                <label>Remarks <span class="req">*</span></label>
                <textarea class="input" [(ngModel)]="remarks" rows="4"
                  placeholder="Enter your remarks, findings, or reason for action..."></textarea>
              </div>

              <div class="action-buttons">
                @if (canForward(a.status)) {
                  <button class="btn btn-primary w-full" [disabled]="busy()" (click)="doAction('Forward')">
                    <i class="fa-solid fa-arrow-right"></i>
                    {{ a.status === 'Submitted' ? 'Register & Forward to Scrutiny' : 'Forward for Review' }}
                  </button>
                }
                @if (canRequestInspection(a.status)) {
                  <button class="btn btn-warning w-full" [disabled]="busy()" (click)="doAction('RequestInspection')">
                    <i class="fa-solid fa-magnifying-glass-location"></i> Send for Site Inspection
                  </button>
                }
                @if (a.status === 'UnderInspection') {
                  <a [routerLink]="['/review', a.id, 'inspection']" class="btn btn-primary w-full" style="text-align:center">
                    <i class="fa-solid fa-file-circle-check"></i> Submit Inspection Report
                  </a>
                }
                @if (canApprove(a.status)) {
                  <button class="btn btn-primary w-full" [disabled]="busy()" (click)="doAction('Approve')" style="background:#388e3c;border-color:#388e3c">
                    <i class="fa-solid fa-circle-check"></i> Approve & Issue NOC
                  </button>
                }
                <button class="btn btn-warning w-full" [disabled]="busy()" (click)="doAction('Return')">
                  <i class="fa-solid fa-rotate-left"></i> Return for Correction
                </button>
                <button class="btn btn-danger w-full" [disabled]="busy()" (click)="doAction('Reject')">
                  <i class="fa-solid fa-circle-xmark"></i> Reject Application
                </button>
              </div>

              @if (actionDone()) {
                <div class="alert alert-success" style="margin-top:12px">
                  <i class="fa-solid fa-circle-check"></i> Action recorded successfully.
                </div>
              }
            </div>
          </div>

          <!-- Checklist verification -->
          <div class="panel">
            <div class="panel-heading"><h3>Scrutiny Checklist</h3></div>
            <div class="panel-body">
              @for (item of scrutinyItems; track $index) {
                <div class="scrutiny-check">
                  <label class="checkbox-label" style="gap:10px;font-size:13px">
                    <input type="checkbox" [(ngModel)]="item.checked">
                    {{ item.label }}
                  </label>
                </div>
              }
              <div style="margin-top:12px;font-size:13px;color:var(--text-muted)">
                {{ checkedCount() }} / {{ scrutinyItems.length }} items verified
              </div>
            </div>
          </div>
        </div>
      </div>
    } @else {
      <div class="panel-body text-muted">Loading application...</div>
    }
  `,
  styles: `
    .review-layout { display: grid; grid-template-columns: 1fr 320px; gap: 16px; align-items: start; }
    @media (max-width: 1024px) { .review-layout { grid-template-columns: 1fr; } }
    .summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .summary-item { display: flex; flex-direction: column; gap: 2px; }
    .summary-label { font-size: 11px; text-transform: uppercase; font-weight: 600; color: var(--text-muted); letter-spacing: .05em; }
    .action-buttons { display: flex; flex-direction: column; gap: 8px; }
    .scrutiny-check { padding: 6px 0; border-bottom: 1px solid var(--border); }
    .scrutiny-check:last-child { border-bottom: none; }
    .checkbox-label { display: flex; gap: 10px; align-items: flex-start; cursor: pointer; }
    .checkbox-label input { margin-top: 2px; flex-shrink: 0; }
  `,
})
export class ReviewDetail {
  private readonly svc = inject(MockNocService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly nocLabels = NOC_TYPE_LABELS;
  protected readonly formatDate = formatDate;
  protected readonly formatDateTime = formatDateTime;
  protected remarks = '';
  protected readonly busy = signal(false);
  protected readonly actionDone = signal(false);

  protected readonly app = toSignal(
    this.route.paramMap.pipe(
      switchMap((p) => this.svc.getApplication(Number(p.get('id')))),
    ),
  );

  private get appId(): number {
    return Number(this.route.snapshot.paramMap.get('id'));
  }

  protected readonly scrutinyItems = [
    { label: 'Application letter with applicant details', checked: false },
    { label: 'Land ownership documents verified', checked: false },
    { label: 'Layout/site plan signed by architect', checked: false },
    { label: 'Tree survey report complete and signed', checked: false },
    { label: 'Tree count and species verified', checked: false },
    { label: 'Commencement certificate present', checked: false },
    { label: 'No tree cutting letter from owner', checked: false },
    { label: 'Deposit challan attached', checked: false },
  ];

  protected checkedCount() { return this.scrutinyItems.filter((i) => i.checked).length; }

  // Forward: move Submitted→UnderScrutiny, or UnderScrutiny→UnderReview
  protected canForward(s: ApplicationStatus) { return s === 'Submitted' || s === 'UnderScrutiny'; }
  // Inspection only makes sense once the app is under scrutiny (not on first submission)
  protected canRequestInspection(s: ApplicationStatus) { return s === 'UnderScrutiny'; }
  protected canApprove(s: ApplicationStatus) { return s === 'UnderReview' || s === 'InspectionReportSubmitted' || s === 'PendingDecision'; }

  protected doAction(action: string) {
    if (!this.remarks.trim()) { alert('Please enter remarks before taking action.'); return; }
    this.busy.set(true);
    const id = this.appId;
    this.svc.reviewAction(id, action, this.remarks).subscribe({
      next: () => {
        this.busy.set(false);
        this.actionDone.set(true);
        setTimeout(() => void this.router.navigate(['/review']), 1500);
      },
      error: () => this.busy.set(false),
    });
  }

  protected dotClass(s: ApplicationStatus): string {
    if (s === 'Approved') return 'green';
    if (s === 'Rejected') return 'red';
    if (s === 'ReturnedForCorrection') return 'orange';
    return 'blue';
  }

  protected dotIcon(s: ApplicationStatus): string {
    if (s === 'Approved') return 'fa-circle-check';
    if (s === 'Rejected') return 'fa-circle-xmark';
    if (s === 'ReturnedForCorrection') return 'fa-rotate-left';
    if (s === 'UnderInspection') return 'fa-magnifying-glass';
    return 'fa-circle-dot';
  }
}
