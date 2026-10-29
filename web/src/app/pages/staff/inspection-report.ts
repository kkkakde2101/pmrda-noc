import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';
import { MockNocService } from '../../core/mock.service';
import { StatusBadge } from '../../shared/ui';

@Component({
  selector: 'app-inspection-report',
  imports: [RouterLink, FormsModule, StatusBadge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (app(); as a) {
      <div class="page-header">
        <div>
          <h1>Site Inspection Report</h1>
          <div class="breadcrumb">
            <a routerLink="/">Home</a><span>/</span>
            <a routerLink="/review">Review Queue</a><span>/</span>
            <a [routerLink]="['/review', a.id]">{{ a.applicationNumber }}</a><span>/</span>
            <span>Inspection Report</span>
          </div>
        </div>
        <app-status-badge [status]="a.status" />
      </div>

      <div class="insp-layout">
        <!-- Application summary card -->
        <div class="panel" style="margin-bottom:0">
          <div class="panel-heading"><h3>Application Summary</h3></div>
          <div class="panel-body">
            <div class="summary-grid">
              <div class="summary-item"><span class="summary-label">Application No.</span><span>{{ a.applicationNumber }}</span></div>
              <div class="summary-item"><span class="summary-label">NOC Type</span><span>{{ a.nocType === 'Provisional' ? 'Provisional Tree NOC' : 'Final Tree Completion NOC' }}</span></div>
              <div class="summary-item"><span class="summary-label">Applicant</span><span>{{ a.applicantName }}</span></div>
              <div class="summary-item"><span class="summary-label">Property</span><span>Survey {{ a.surveyNumber }}, {{ a.village }}, {{ a.taluka }}</span></div>
              <div class="summary-item"><span class="summary-label">Plot Area</span><span>{{ a.plotAreaSqm }} sq.m ({{ a.requiredPlantationCount }} trees required)</span></div>
              <div class="summary-item"><span class="summary-label">Trees Declared</span><span>{{ a.existingTreeCount }} existing trees on application</span></div>
            </div>
          </div>
        </div>

        <!-- Inspection report form -->
        <div class="panel">
          <div class="panel-heading"><h3><i class="fa-solid fa-magnifying-glass-location"></i> Site Inspection Report</h3></div>
          <div class="panel-body">
            <div class="form-grid">
              <div class="field">
                <label>Inspector Name <span class="req">*</span></label>
                <input class="input" [(ngModel)]="form.inspectorName" placeholder="Full name of inspector" />
              </div>
              <div class="field">
                <label>Inspection Date <span class="req">*</span></label>
                <input class="input" type="date" [(ngModel)]="form.inspectionDate" />
              </div>
              <div class="field">
                <label>Total Trees Found on Site <span class="req">*</span></label>
                <input class="input" type="number" [(ngModel)]="form.totalTreesOnSite" min="0" placeholder="Count of trees found during inspection" />
              </div>
              <div class="field">
                <label>Total Plot Area Verified (sq.m) <span class="req">*</span></label>
                <input class="input" type="number" [(ngModel)]="form.totalPlotArea" min="0" placeholder="Plot area as measured on site" />
              </div>
              <div class="field">
                <label>Recommended Plantation Count <span class="req">*</span></label>
                <input class="input" type="number" [(ngModel)]="form.recommendedPlantationCount" min="0"
                  placeholder="Trees recommended (1 per 80 sq.m)" />
                <span class="field-hint">Based on plot area: <strong>{{ autoRecommended() }}</strong> trees (1 per 80 sq.m)</span>
              </div>
              <div class="field">
                <label>Tree Inventory Verified</label>
                <label class="checkbox-label" style="margin-top:8px">
                  <input type="checkbox" [(ngModel)]="form.treesVerified" />
                  <span>Confirmed — tree species, count, geotagging and photographs match submitted documents</span>
                </label>
              </div>
              <div class="field full">
                <label>Inspection Findings <span class="req">*</span></label>
                <textarea class="input" [(ngModel)]="form.findings" rows="5"
                  placeholder="Describe site conditions, tree inventory status, compliance observations, discrepancies found, plantation status, etc."></textarea>
              </div>
              <div class="field full">
                <label>Remarks / Recommendations</label>
                <textarea class="input" [(ngModel)]="form.remarks" rows="3"
                  placeholder="Any recommendations, conditions for approval, deficiencies to address, or additional observations."></textarea>
              </div>
              <div class="field full">
                <label>Geotagging Report Reference</label>
                <input class="input" [(ngModel)]="form.geotaggingReport"
                  placeholder="Reference to geotagging evidence, photo/video file names, or 'Attached'" />
              </div>
            </div>
          </div>
        </div>

        <!-- Media evidence notice -->
        <div class="alert alert-info">
          <i class="fa-solid fa-circle-info"></i>
          <div>Attach colour photographs of all trees in site-plan numbering order, geotagged site images, and any video evidence separately. File references should be noted in the Geotagging Report field above.</div>
        </div>

        @if (error()) {
          <div class="alert alert-error"><i class="fa-solid fa-circle-exclamation"></i> {{ error() }}</div>
        }
        @if (submitted()) {
          <div class="alert alert-success">
            <i class="fa-solid fa-circle-check"></i>
            Inspection report submitted. Application status updated to <strong>Inspection Report Submitted</strong>.
          </div>
        }

        <div class="step-actions">
          <a [routerLink]="['/review', a.id]" class="btn btn-secondary">
            <i class="fa-solid fa-arrow-left"></i> Back to Application
          </a>
          <button class="btn btn-primary btn-lg" [disabled]="busy() || submitted()" (click)="submit(a.id)">
            @if (busy()) { <i class="fa-solid fa-spinner fa-spin"></i> Submitting… }
            @else { <i class="fa-solid fa-file-circle-check"></i> Submit Inspection Report }
          </button>
        </div>
      </div>
    } @else {
      <div class="panel-body text-muted">Loading…</div>
    }
  `,
  styles: `
    .insp-layout { display: flex; flex-direction: column; gap: 16px; }
    .summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .summary-item { display: flex; flex-direction: column; gap: 2px; }
    .summary-label { font-size: 11px; text-transform: uppercase; font-weight: 600; color: var(--text-muted); letter-spacing: .05em; }
    .checkbox-label { display: flex; gap: 10px; align-items: flex-start; cursor: pointer; font-size: 14px; }
    .checkbox-label input { margin-top: 2px; flex-shrink: 0; width: 16px; height: 16px; }
    .step-actions { display: flex; justify-content: space-between; align-items: center; padding-top: 16px; border-top: 1px solid var(--border); gap: 12px; }
  `,
})
export class InspectionReport {
  private readonly svc = inject(MockNocService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly submitted = signal(false);

  protected readonly app = toSignal(
    this.route.paramMap.pipe(
      switchMap((p) => this.svc.getApplication(Number(p.get('id')))),
    ),
  );

  protected form = {
    inspectorName: '',
    inspectionDate: new Date().toISOString().split('T')[0],
    totalTreesOnSite: 0,
    totalPlotArea: 0,
    treesVerified: false,
    recommendedPlantationCount: 0,
    findings: '',
    remarks: '',
    geotaggingReport: '',
  };

  protected autoRecommended(): number {
    return Math.ceil((this.form.totalPlotArea || this.app()?.plotAreaSqm || 0) / 80);
  }

  protected submit(appId: number) {
    if (!this.form.inspectorName || !this.form.inspectionDate || !this.form.findings || !this.form.totalTreesOnSite) {
      this.error.set('Please fill in all required fields: Inspector Name, Date, Trees on Site, and Findings.');
      return;
    }
    this.busy.set(true);
    this.error.set(null);
    this.svc.submitInspectionReport(appId, { ...this.form }).subscribe({
      next: () => {
        this.busy.set(false);
        this.submitted.set(true);
        setTimeout(() => void this.router.navigate(['/review', appId]), 2000);
      },
      error: () => {
        this.busy.set(false);
        this.error.set('Failed to submit report. Please try again.');
      },
    });
  }
}
