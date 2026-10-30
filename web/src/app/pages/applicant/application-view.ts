import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';
import { MockNocService } from '../../core/mock.service';
import { formatDate, formatDateTime } from '../../core/support';
import { ApplicationDetail, NOC_TYPE_LABELS, STATUS_LABELS, ApplicationStatus } from '../../core/models';
import { StatusBadge } from '../../shared/ui';

@Component({
  selector: 'app-application-view',
  imports: [RouterLink, StatusBadge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (app(); as a) {
      <div class="page-header">
        <div>
          <h1>{{ a.applicationNumber }}</h1>
          <div class="breadcrumb">
            <a routerLink="/">Home</a><span>/</span>
            <a routerLink="/applications">My Applications</a><span>/</span>
            <span>{{ a.applicationNumber }}</span>
          </div>
        </div>
        <div style="display:flex;gap:8px;align-items:center">
          <app-status-badge [status]="a.status" />
          @if (a.status === 'Draft' || a.status === 'ReturnedForCorrection') {
            <a [routerLink]="['/applications', a.id, 'edit']" class="btn btn-primary">
              <i class="fa-solid fa-pencil"></i> Edit
            </a>
          }
        </div>
      </div>

      @if (a.currentRemarks && a.status === 'ReturnedForCorrection') {
        <div class="alert alert-warning">
          <i class="fa-solid fa-triangle-exclamation"></i>
          <div><strong>Returned for correction:</strong> {{ a.currentRemarks }}</div>
        </div>
      }
      @if (a.status === 'Approved') {
        <div class="alert alert-success" style="justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px">
          <div style="display:flex;align-items:center;gap:10px">
            <i class="fa-solid fa-circle-check"></i>
            <div><strong>NOC Approved!</strong> Your Tree NOC has been issued by PMRDA Tree Authority.</div>
          </div>
          <button class="btn btn-primary" (click)="downloadNoc(a)">
            <i class="fa-solid fa-file-arrow-down"></i> Download NOC Certificate
          </button>
        </div>
      }

      <div class="detail-grid">
        <!-- Left column -->
        <div>
          <div class="panel">
            <div class="panel-heading"><h3>Application Details</h3></div>
            <div class="panel-body">
              <dl class="detail-list">
                <dt>NOC Type</dt><dd>{{ nocLabel(a.nocType) }}</dd>
                <dt>Status</dt><dd><app-status-badge [status]="a.status" /></dd>
                <dt>Submitted</dt><dd>{{ formatDate(a.submittedAt) }}</dd>
                <dt>Last Updated</dt><dd>{{ formatDateTime(a.updatedAt) }}</dd>
              </dl>
            </div>
          </div>

          <div class="panel">
            <div class="panel-heading"><h3>Applicant Details</h3></div>
            <div class="panel-body">
              <dl class="detail-list">
                <dt>Name</dt><dd>{{ a.applicantName }}</dd>
                <dt>Mobile</dt><dd>{{ a.mobileNumber }}</dd>
                <dt>Address</dt><dd>{{ a.applicantAddress }}</dd>
                @if (a.age) { <dt>Age</dt><dd>{{ a.age }} years</dd> }
                @if (a.occupation) { <dt>Occupation</dt><dd>{{ a.occupation }}</dd> }
              </dl>
            </div>
          </div>

          <div class="panel">
            <div class="panel-heading"><h3>Property Details</h3></div>
            <div class="panel-body">
              <dl class="detail-list">
                <dt>Survey / Gat No.</dt><dd>{{ a.surveyNumber }}</dd>
                @if (a.plotNumber) { <dt>Plot No.</dt><dd>{{ a.plotNumber }}</dd> }
                <dt>Village</dt><dd>{{ a.village }}</dd>
                <dt>Taluka</dt><dd>{{ a.taluka }}</dd>
                <dt>District</dt><dd>{{ a.district }}</dd>
                <dt>Plot Area</dt><dd>{{ a.plotAreaSqm }} sq.m</dd>
                <dt>Plantation Required</dt><dd>{{ a.requiredPlantationCount }} trees (1 per 80 sq.m)</dd>
                @if (a.googleCoordinates) { <dt>GPS Coordinates</dt><dd>{{ a.googleCoordinates }}</dd> }
              </dl>
            </div>
          </div>
        </div>

        <!-- Right column -->
        <div>
          <!-- Tree inventory -->
          <div class="panel">
            <div class="panel-heading"><h3>Tree Inventory <span class="text-muted" style="font-size:13px;font-weight:400">({{ a.treeInventory.length }} trees)</span></h3></div>
            @if (a.treeInventory.length) {
              <div class="table-wrap">
                <table class="table">
                  <thead>
                    <tr><th>No.</th><th>Common Name</th><th>Scientific Name</th><th>Age</th><th>Height (m)</th><th>Girth (m)</th></tr>
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
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            } @else {
              <div class="panel-body text-muted">No tree inventory recorded.</div>
            }
          </div>

          <!-- Documents -->
          <div class="panel">
            <div class="panel-heading"><h3>Uploaded Documents</h3></div>
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
                          <i class="fa-solid fa-download"></i> Download
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

          <!-- Challan -->
          @if (a.challanAttached) {
            <div class="panel">
              <div class="panel-heading"><h3>Challan / Deposit</h3></div>
              <div class="panel-body">
                <dl class="detail-list">
                  @if (a.challanNumber) { <dt>Challan No.</dt><dd>{{ a.challanNumber }}</dd> }
                  @if (a.challanAmount) { <dt>Amount</dt><dd>₹{{ a.challanAmount }}</dd> }
                  @if (a.challanDate) { <dt>Date</dt><dd>{{ formatDate(a.challanDate) }}</dd> }
                </dl>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Workflow timeline -->
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
                  @if (wf.remarks) {
                    <div class="timeline-remarks">{{ wf.remarks }}</div>
                  }
                </div>
              </li>
            }
          </ul>
        </div>
      </div>
    } @else {
      <div class="panel-body text-muted">Loading...</div>
    }
  `,
  styles: `
    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    @media (max-width: 768px) { .detail-grid { grid-template-columns: 1fr; } }
    .detail-list { display: grid; grid-template-columns: max-content 1fr; gap: 6px 16px; margin: 0; }
    dt { font-size: 12px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: .04em; padding: 2px 0; white-space: nowrap; }
    dd { margin: 0; padding: 2px 0; font-size: 14px; }
  `,
})
export class ApplicationView {
  private readonly svc = inject(MockNocService);
  private readonly route = inject(ActivatedRoute);
  protected readonly formatDate = formatDate;
  protected readonly formatDateTime = formatDateTime;

  protected readonly app = toSignal(
    this.route.paramMap.pipe(
      switchMap((p) => this.svc.getApplication(Number(p.get('id')))),
    ),
  );

  protected nocLabel(t: string) { return NOC_TYPE_LABELS[t as keyof typeof NOC_TYPE_LABELS] ?? t; }

  protected downloadNoc(a: ApplicationDetail) {
    if (!a) return;
    const issueDate = new Date(a.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
    const nocTitle = NOC_TYPE_LABELS[a.nocType];
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${a.applicationNumber} — NOC Certificate</title>
<style>
  body { font-family: "Times New Roman", serif; margin: 0; padding: 40px 60px; color: #111; line-height: 1.7; }
  .border { border: 3px double #2e7d32; padding: 30px 40px; min-height: 90vh; }
  .header { text-align: center; border-bottom: 2px solid #2e7d32; padding-bottom: 16px; margin-bottom: 24px; }
  .logo-line { font-size: 13px; color: #555; letter-spacing: 1px; text-transform: uppercase; }
  h1 { font-size: 18px; color: #2e7d32; margin: 8px 0 4px; }
  h2 { font-size: 15px; color: #333; margin: 0; font-weight: normal; }
  .ref-line { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 20px; }
  .body-text { font-size: 14px; text-align: justify; margin-bottom: 14px; }
  .conditions { font-size: 13px; margin: 16px 0; padding-left: 20px; }
  .conditions li { margin-bottom: 8px; }
  .signature { margin-top: 48px; display: flex; justify-content: flex-end; }
  .sig-block { text-align: center; }
  .sig-line { border-top: 1px solid #333; width: 220px; margin-bottom: 6px; }
  .footer { text-align: center; font-size: 11px; color: #888; margin-top: 32px; border-top: 1px solid #ccc; padding-top: 12px; }
  @media print { body { padding: 20px 40px; } }
</style></head><body>
<div class="border">
  <div class="header">
    <div class="logo-line">Government of Maharashtra</div>
    <h1>Pune Metropolitan Region Development Authority (PMRDA)</h1>
    <h2>Tree Authority · Garden Department</h2>
  </div>
  <div class="ref-line">
    <span><strong>NOC No.:</strong> ${a.applicationNumber}</span>
    <span><strong>Date:</strong> ${issueDate}</span>
  </div>
  <p class="body-text"><strong>SUBJECT: ${nocTitle.toUpperCase()} — DEVELOPMENT PROJECT AT SURVEY NO. ${a.surveyNumber}, VILLAGE ${a.village.toUpperCase()}, TALUKA ${a.taluka.toUpperCase()}, DIST. PUNE</strong></p>
  <p class="body-text">This is to certify that the application submitted by <strong>${a.applicantName}</strong>, residing at ${a.applicantAddress}, for obtaining <strong>${nocTitle}</strong> for the property bearing Survey/Gat No. <strong>${a.surveyNumber}</strong>, Village <strong>${a.village}</strong>, Taluka <strong>${a.taluka}</strong>, District Pune, having plot area of <strong>${a.plotAreaSqm} sq.m</strong>, has been examined and is hereby <strong>APPROVED</strong> subject to the following conditions:</p>
  <ol class="conditions">
    <li>The applicant shall plant and maintain <strong>${a.requiredPlantationCount} trees</strong> of native/local varieties as per Tree Authority norms (1 tree per 80 sq.m of plot area).</li>
    <li>The applicant shall furnish six-monthly reports for the first three years from the date of plantation, along with photographs of planted trees and geotagging evidence.</li>
    <li>The applicant shall ensure proper care for tree growth for ${a.nocType === 'Final' ? '<strong>seven (7) years</strong>' : 'the required period'} from the date of this NOC.</li>
    <li>The trees planted shall be of minimum height 3 metres, minimum girth 0.90 metres, and age 2–5 years, as per PMRDA norms.</li>
    <li>This NOC is subject to compliance with all provisions of the Maharashtra (Urban Areas) Protection and Preservation of Trees Act, 1975, and amendments of 2009 and 2021.</li>
    <li>Any violation of the above conditions shall render this NOC liable to cancellation and may attract legal action under the applicable Act.</li>
  </ol>
  <p class="body-text">This NOC is valid only for the above-mentioned property and purpose and does not authorise tree-cutting unless a separate permission has been obtained.</p>
  <div class="signature">
    <div class="sig-block">
      <div class="sig-line"></div>
      <div><strong>Director, Tree Authority</strong></div>
      <div>PMRDA, Pune</div>
      <div style="font-size:12px;color:#666">${issueDate}</div>
    </div>
  </div>
  <div class="footer">PMRDA · New Administrative Building, Near Akurdi Railway Station, Akurdi, Pune 411 044 · This is a computer-generated certificate.</div>
</div></body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${a.applicationNumber.replace(/\//g, '-')}_NOC_Certificate.html`;
    link.click();
    URL.revokeObjectURL(url);
  }

  protected dotClass(s: ApplicationStatus): string {
    if (s === 'Approved') return 'green';
    if (s === 'Rejected') return 'red';
    if (s === 'ReturnedForCorrection') return 'orange';
    if (s === 'Submitted' || s === 'UnderScrutiny') return 'blue';
    return 'gray';
  }

  protected dotIcon(s: ApplicationStatus): string {
    if (s === 'Approved') return 'fa-circle-check';
    if (s === 'Rejected') return 'fa-circle-xmark';
    if (s === 'ReturnedForCorrection') return 'fa-rotate-left';
    if (s === 'UnderInspection') return 'fa-magnifying-glass';
    return 'fa-circle-dot';
  }
}
