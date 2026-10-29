import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forbidden',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="status-page">
      <i class="fa-solid fa-lock fa-3x"></i>
      <h1>403 — Not Allowed</h1>
      <p>Your role does not have permission to access this page.</p>
      <a routerLink="/" class="btn btn-primary">Go to Dashboard</a>
    </div>
  `,
  styles: `.status-page { text-align:center; padding: 80px 20px; color:var(--text-muted); }
    .status-page i { margin-bottom:16px; color:var(--border); }
    .status-page h1 { font-size:24px; color:var(--text); margin-bottom:8px; }
    .status-page p { margin-bottom:20px; }`,
})
export class Forbidden {}

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="status-page">
      <i class="fa-solid fa-compass-drafting fa-3x"></i>
      <h1>404 — Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <a routerLink="/" class="btn btn-primary">Go to Dashboard</a>
    </div>
  `,
  styles: `.status-page { text-align:center; padding: 80px 20px; color:var(--text-muted); }
    .status-page i { margin-bottom:16px; color:var(--border); }
    .status-page h1 { font-size:24px; color:var(--text); margin-bottom:8px; }
    .status-page p { margin-bottom:20px; }`,
})
export class NotFound {}
