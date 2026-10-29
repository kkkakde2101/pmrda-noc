import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { MockNocService } from '../../core/mock.service';
import { formatDate } from '../../core/support';
import { StatusBadge } from '../../shared/ui';

@Component({
  selector: 'app-review-list',
  imports: [RouterLink, StatusBadge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-header">
      <div>
        <h1>Review Queue</h1>
        <div class="breadcrumb"><a routerLink="/">Home</a><span>/</span><span>Review Queue</span></div>
      </div>
    </div>

    <div class="panel">
      <div class="panel-heading">
        <h3>Applications Pending Action <span class="text-muted" style="font-weight:400;font-size:13px">({{ result()?.total ?? 0 }})</span></h3>
      </div>
      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>Application No.</th>
              <th>NOC Type</th>
              <th>Applicant</th>
              <th>Survey No.</th>
              <th>Village</th>
              <th>Status</th>
              <th>Submitted</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            @for (app of result()?.items; track app.id) {
              <tr>
                <td><strong>{{ app.applicationNumber }}</strong></td>
                <td>
                  <span class="noc-tag" [class.final]="app.nocType === 'Final'">
                    {{ app.nocType }}
                  </span>
                </td>
                <td>{{ app.applicantName }}</td>
                <td>{{ app.surveyNumber }}</td>
                <td>{{ app.village }}</td>
                <td><app-status-badge [status]="app.status" /></td>
                <td>{{ formatDate(app.submittedAt) }}</td>
                <td>
                  <a [routerLink]="['/review', app.id]" class="btn btn-sm btn-primary">
                    <i class="fa-solid fa-clipboard-check"></i> Review
                  </a>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="8" style="text-align:center;padding:40px;color:var(--text-muted)">
                  <i class="fa-solid fa-inbox" style="font-size:32px;opacity:.3;display:block;margin-bottom:10px"></i>
                  No applications pending your action.
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: `
    .noc-tag { display: inline-flex; padding: 2px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; background: var(--pmrda-green-pale); color: var(--pmrda-green-dark); }
    .noc-tag.final { background: var(--info-bg); color: var(--info-text); }
  `,
})
export class ReviewList {
  protected readonly formatDate = formatDate;
  private readonly svc = inject(MockNocService);
  protected readonly result = toSignal(this.svc.listForReview());
}
