import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { P } from '../core/models';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="app-layout" [class.sidebar-open]="sidebarOpen()">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-brand">
          <div class="brand-logo">
            <i class="fa-solid fa-tree"></i>
          </div>
          <div class="brand-text">
            <span class="brand-name">PMRDA</span>
            <span class="brand-sub">Tree NOC Portal</span>
          </div>
        </div>

        <nav class="sidebar-nav">
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
            <i class="fa-solid fa-gauge-high"></i><span>Dashboard</span>
          </a>

          @if (can(P.applicationsView)) {
            <div class="nav-group-label">Applications</div>
            <a routerLink="/applications" routerLinkActive="active" class="nav-item">
              <i class="fa-solid fa-file-lines"></i><span>My Applications</span>
            </a>
            <a routerLink="/applications/new" routerLinkActive="active" class="nav-item">
              <i class="fa-solid fa-plus-circle"></i><span>New Application</span>
            </a>
          }

          @if (can(P.scrutinyView) || can(P.reviewAction) || can(P.decisionAction)) {
            <div class="nav-group-label">Review & Decision</div>
            <a routerLink="/review" routerLinkActive="active" class="nav-item">
              <i class="fa-solid fa-clipboard-check"></i><span>Review Queue</span>
            </a>
          }

          @if (can(P.inspectionSubmit)) {
            <a routerLink="/inspections" routerLinkActive="active" class="nav-item">
              <i class="fa-solid fa-magnifying-glass-location"></i><span>Inspections</span>
            </a>
          }

          @if (can(P.usersView)) {
            <div class="nav-group-label">Administration</div>
            <a routerLink="/admin/users" routerLinkActive="active" class="nav-item">
              <i class="fa-solid fa-users"></i><span>Users</span>
            </a>
          }
        </nav>

        <div class="sidebar-footer">
          <div class="user-info">
            <div class="user-avatar">{{ initials() }}</div>
            <div class="user-details">
              <span class="user-name">{{ me()?.displayName }}</span>
              <span class="user-role">{{ me()?.role }}</span>
            </div>
          </div>
          <button class="btn-logout" (click)="logout()" title="Sign out">
            <i class="fa-solid fa-right-from-bracket"></i>
          </button>
        </div>
      </aside>

      <!-- Main content -->
      <div class="main-wrapper">
        <header class="top-bar">
          <button class="menu-toggle" (click)="sidebarOpen.set(!sidebarOpen())" aria-label="Toggle menu">
            <i class="fa-solid fa-bars"></i>
          </button>
          <div class="top-bar-title">Pune Metropolitan Region Development Authority</div>
        </header>
        <main class="main-content">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: `
    .app-layout { display: flex; min-height: 100vh; background: var(--bg); }

    /* Sidebar */
    .sidebar {
      width: 240px; min-width: 240px; background: var(--sidebar-bg); color: var(--sidebar-text);
      display: flex; flex-direction: column; position: fixed; left: 0; top: 0; bottom: 0; z-index: 100;
      transform: translateX(-100%); transition: transform .25s ease;
    }
    .sidebar-open .sidebar { transform: translateX(0); }
    @media (min-width: 992px) {
      .sidebar { transform: translateX(0); position: sticky; top: 0; height: 100vh; overflow-y: auto; }
      .main-wrapper { margin-left: 0; }
    }
    .sidebar-brand { display: flex; align-items: center; gap: 10px; padding: 20px 16px 16px; border-bottom: 1px solid rgba(255,255,255,.1); }
    .brand-logo { width: 36px; height: 36px; background: var(--pmrda-green); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 18px; }
    .brand-name { display: block; font-weight: 700; font-size: 15px; }
    .brand-sub { display: block; font-size: 11px; opacity: .7; }
    .sidebar-nav { flex: 1; overflow-y: auto; padding: 12px 8px; }
    .nav-group-label { font-size: 10px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; opacity: .5; padding: 12px 8px 4px; }
    .nav-item {
      display: flex; align-items: center; gap: 10px; padding: 9px 10px; border-radius: 6px;
      color: rgba(255,255,255,.8); text-decoration: none; font-size: 14px; transition: background .15s;
    }
    .nav-item:hover, .nav-item.active { background: rgba(255,255,255,.12); color: #fff; }
    .nav-item i { width: 18px; text-align: center; font-size: 14px; }
    .sidebar-footer { padding: 12px; border-top: 1px solid rgba(255,255,255,.1); display: flex; align-items: center; gap: 8px; }
    .user-avatar { width: 32px; height: 32px; background: var(--pmrda-green); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; }
    .user-details { flex: 1; min-width: 0; }
    .user-name { display: block; font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .user-role { display: block; font-size: 11px; opacity: .6; }
    .btn-logout { background: none; border: none; color: rgba(255,255,255,.6); cursor: pointer; padding: 4px 6px; border-radius: 4px; }
    .btn-logout:hover { color: #fff; background: rgba(255,255,255,.1); }

    /* Main */
    .main-wrapper { flex: 1; display: flex; flex-direction: column; min-width: 0; }
    .top-bar { height: 56px; background: var(--card-bg); border-bottom: 1px solid var(--border); display: flex; align-items: center; padding: 0 20px; gap: 12px; position: sticky; top: 0; z-index: 50; }
    .menu-toggle { background: none; border: none; font-size: 18px; cursor: pointer; color: var(--text); padding: 4px 8px; }
    .top-bar-title { font-size: 13px; color: var(--text-muted); font-weight: 500; }
    .main-content { flex: 1; padding: 24px; max-width: 1280px; width: 100%; }
    @media (max-width: 991px) { .main-content { padding: 16px; } }
  `,
})
export class Shell {
  protected readonly auth = inject(AuthService);
  protected readonly router = inject(Router);
  protected readonly P = P;
  protected readonly sidebarOpen = signal(false);
  protected readonly me = this.auth.me;

  protected readonly initials = computed(() => {
    const parts = (this.me()?.displayName ?? '').split(/\s+/).filter(Boolean);
    return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?';
  });

  protected can(permission: string): boolean {
    return this.auth.can(permission);
  }

  protected logout(): void {
    this.auth.logout();
  }
}
