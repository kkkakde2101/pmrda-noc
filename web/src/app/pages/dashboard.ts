import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { MockNocService } from '../core/mock.service';
import { AuthService } from '../core/auth.service';
import { P } from '../core/models';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-header">
      <div>
        <h1>Dashboard</h1>
        <div class="breadcrumb"><span>Home</span></div>
      </div>
    </div>

    <div class="welcome-banner">
      <i class="fa-solid fa-tree"></i>
      <div>
        <strong>Welcome, {{ auth.me()?.displayName }}</strong>
        <span>PMRDA Tree NOC Portal — Pune Metropolitan Region Development Authority</span>
      </div>
    </div>

    @if (stats(); as s) {
      <div class="stat-grid">
        <div class="stat-tile highlight">
          <div class="stat-label">Pending My Action</div>
          <div class="stat-value">{{ s.pendingMyAction }}</div>
          <div class="stat-sub">Applications awaiting your action</div>
        </div>
        <div class="stat-tile">
          <div class="stat-label">Total Applications</div>
          <div class="stat-value">{{ s.totalApplications }}</div>
          <div class="stat-sub">All time</div>
        </div>
        <div class="stat-tile">
          <div class="stat-label">Provisional NOC</div>
          <div class="stat-value">{{ s.provisional }}</div>
        </div>
        <div class="stat-tile">
          <div class="stat-label">Final NOC</div>
          <div class="stat-value">{{ s.final }}</div>
        </div>
        <div class="stat-tile">
          <div class="stat-label">Under Review</div>
          <div class="stat-value">{{ s.pending }}</div>
          <div class="stat-sub">In workflow</div>
        </div>
        <div class="stat-tile">
          <div class="stat-label">Approved</div>
          <div class="stat-value text-success">{{ s.approved }}</div>
        </div>
        <div class="stat-tile">
          <div class="stat-label">Rejected</div>
          <div class="stat-value text-danger">{{ s.rejected }}</div>
        </div>
      </div>

      <div class="dash-grid">
        <!-- Quick actions -->
        <div class="panel">
          <div class="panel-heading"><h3>Quick Actions</h3></div>
          <div class="panel-body">
            <div class="quick-actions">
              @if (auth.can(P.applicationsCreate)) {
                <a routerLink="/applications/new" class="quick-action-btn">
                  <i class="fa-solid fa-plus-circle"></i>
                  <span>New Application</span>
                  <small>Apply for Provisional or Final Tree NOC</small>
                </a>
              }
              @if (auth.can(P.applicationsView)) {
                <a routerLink="/applications" class="quick-action-btn">
                  <i class="fa-solid fa-file-lines"></i>
                  <span>My Applications</span>
                  <small>View status of your applications</small>
                </a>
              }
              @if (auth.can(P.scrutinyView)) {
                <a routerLink="/review" class="quick-action-btn">
                  <i class="fa-solid fa-clipboard-check"></i>
                  <span>Review Queue</span>
                  <small>{{ s.pendingMyAction }} applications awaiting action</small>
                </a>
              }
            </div>
          </div>
        </div>

        <!-- NOC types info -->
        <div class="panel">
          <div class="panel-heading"><h3>About Tree NOC</h3></div>
          <div class="panel-body">
            <div class="noc-info">
              <div class="noc-type-card">
                <div class="noc-icon prov"><i class="fa-solid fa-seedling"></i></div>
                <div>
                  <strong>Provisional Tree NOC</strong>
                  <p>For proposed development projects. Submit before construction begins. Requires existing tree inventory, landscape plan, and proposed plantation list.</p>
                </div>
              </div>
              <div class="noc-type-card">
                <div class="noc-icon final"><i class="fa-solid fa-tree"></i></div>
                <div>
                  <strong>Final Tree Completion NOC</strong>
                  <p>For completed projects. Required for Occupancy Certificate. Verify all plantation completed, submit geotagging and survey reports.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: `
    .welcome-banner { display: flex; align-items: center; gap: 16px; background: var(--pmrda-green-pale); border: 1px solid #a5d6a7; border-radius: 8px; padding: 16px 20px; margin-bottom: 20px; }
    .welcome-banner i { font-size: 28px; color: var(--pmrda-green); }
    .welcome-banner strong { display: block; font-size: 16px; }
    .welcome-banner span { font-size: 13px; color: var(--text-muted); }
    .dash-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    @media (max-width: 768px) { .dash-grid { grid-template-columns: 1fr; } }
    .quick-actions { display: flex; flex-direction: column; gap: 10px; }
    .quick-action-btn { display: flex; align-items: center; gap: 14px; padding: 14px; border: 1px solid var(--border); border-radius: 8px; text-decoration: none; color: var(--text); background: var(--card-bg); transition: border-color .15s, background .15s; }
    .quick-action-btn:hover { border-color: var(--pmrda-green); background: var(--pmrda-green-pale); }
    .quick-action-btn i { font-size: 22px; color: var(--pmrda-green); width: 28px; text-align: center; }
    .quick-action-btn span { font-weight: 600; font-size: 14px; }
    .quick-action-btn small { display: block; font-size: 12px; color: var(--text-muted); }
    .noc-info { display: flex; flex-direction: column; gap: 16px; }
    .noc-type-card { display: flex; gap: 14px; }
    .noc-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
    .noc-icon.prov { background: #e8f5e9; color: var(--pmrda-green); }
    .noc-icon.final { background: #e3f2fd; color: #1565c0; }
    .noc-type-card strong { display: block; font-size: 14px; margin-bottom: 4px; }
    .noc-type-card p { margin: 0; font-size: 13px; color: var(--text-muted); line-height: 1.5; }
  `,
})
export class Dashboard {
  protected readonly auth = inject(AuthService);
  protected readonly P = P;
  private readonly svc = inject(MockNocService);
  protected readonly stats = toSignal(this.svc.getDashboard());
}
