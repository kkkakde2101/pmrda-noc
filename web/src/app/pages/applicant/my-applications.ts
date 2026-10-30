import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { MockNocService } from '../../core/mock.service';
import { formatDate } from '../../core/support';
import { StatusBadge } from '../../shared/ui';

@Component({
  selector: 'app-my-applications',
  imports: [RouterLink, StatusBadge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-header">
      <div>
        <h1>My Applications</h1>
        <div class="breadcrumb"><a routerLink="/">Home</a><span>/</span><span>My Applications</span></div>
      </div>
      <a routerLink="/applications/new" class="btn btn-primary">
        <i class="fa-solid fa-plus"></i> New Application
      </a>
    </div>

    <div class="panel">
      <div class="panel-heading"><h3>Applications <span class="text-muted" style="font-weight:400;font-size:13px">({{ result()?.total ?? 0 }})</span></h3></div>
      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>Application No.</th>
              <th>NOC Type</th>
              <th>Property / Survey No.</th>
              <th>Village</th>
              <th>Status</th>
              <th>Submitted</th>
              <th>Last Updated</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            @for (app of result()?.items; track app.id) {
              <tr>
                <td><strong>{{ app.applicationNumber }}</strong></td>
                <td>
                  <span class="noc-tag">
                    Tree Cutting
                  </span>
                </td>
                <td>{{ app.surveyNumber }}</td>
                <td>{{ app.village }}</td>
                <td><app-status-badge [status]="app.status" /></td>
                <td>{{ formatDate(app.submittedAt) }}</td>
                <td>{{ formatDate(app.updatedAt) }}</td>
                <td>
                  <a [routerLink]="['/applications', app.id]" class="btn btn-sm btn-secondary">
                    <i class="fa-solid fa-eye"></i> View
                  </a>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="8" class="empty-state">
                  <i class="fa-solid fa-file-circle-plus"></i>
                  <p>No applications yet. <a routerLink="/applications/new">Submit your first application.</a></p>
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
    .empty-state { text-align: center; padding: 40px 20px !important; color: var(--text-muted); }
    .empty-state i { font-size: 40px; margin-bottom: 12px; display: block; opacity: .4; }
    .empty-state p { margin: 0; }
  `,
})
export class MyApplications {
  protected readonly formatDate = formatDate;
  private readonly svc = inject(MockNocService);
  protected readonly result = toSignal(this.svc.listApplications());
}
