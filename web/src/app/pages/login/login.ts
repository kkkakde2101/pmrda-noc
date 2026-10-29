import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { problemMessage } from '../../core/support';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="login-page">
      <div class="login-card">
        <div class="login-header">
          <div class="login-logo"><i class="fa-solid fa-tree"></i></div>
          <h1>PMRDA Tree NOC Portal</h1>
          <p>Pune Metropolitan Region Development Authority</p>
        </div>

        @if (expired) {
          <div class="alert alert-warning">Your session has expired. Please sign in again.</div>
        }
        @if (error()) {
          <div class="alert alert-error">{{ error() }}</div>
        }

        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="field">
            <label for="loginName">Login name / Mobile</label>
            <input id="loginName" type="text" class="input" formControlName="loginName"
              placeholder="Enter your login name" autocomplete="username">
            @if (submitted() && form.get('loginName')?.errors?.['required']) {
              <span class="field-error">Login name is required.</span>
            }
          </div>
          <div class="field">
            <label for="password">Password</label>
            <input id="password" type="password" class="input" formControlName="password"
              placeholder="Enter your password" autocomplete="current-password">
            @if (submitted() && form.get('password')?.errors?.['required']) {
              <span class="field-error">Password is required.</span>
            }
          </div>
          <button type="submit" class="btn btn-primary btn-full" [disabled]="busy()">
            @if (busy()) { <i class="fa-solid fa-spinner fa-spin"></i> Signing in... }
            @else { Sign in }
          </button>
        </form>

        <div class="login-footer">
          <small>For assistance, contact PMRDA Tree Authority office.</small>
        </div>
      </div>
    </div>
  `,
  styles: `
    .login-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg); padding: 16px; }
    .login-card { width: 100%; max-width: 400px; background: var(--card-bg); border: 1px solid var(--border); border-radius: 12px; padding: 40px 32px; box-shadow: 0 8px 32px rgba(0,0,0,.08); }
    .login-header { text-align: center; margin-bottom: 28px; }
    .login-logo { width: 60px; height: 60px; background: var(--pmrda-green); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 28px; color: #fff; margin: 0 auto 16px; }
    .login-header h1 { font-size: 20px; font-weight: 700; margin: 0 0 4px; }
    .login-header p { font-size: 13px; color: var(--text-muted); margin: 0; }
    .field { margin-bottom: 18px; }
    .field label { display: block; font-size: 13px; font-weight: 500; margin-bottom: 6px; }
    .input { width: 100%; padding: 10px 12px; border: 1px solid var(--border); border-radius: 6px; font-size: 14px; background: var(--bg); color: var(--text); box-sizing: border-box; }
    .input:focus { outline: 2px solid var(--pmrda-green); border-color: transparent; }
    .field-error { font-size: 12px; color: var(--danger); display: block; margin-top: 4px; }
    .btn-full { width: 100%; padding: 11px; font-size: 15px; margin-top: 4px; }
    .login-footer { text-align: center; margin-top: 20px; color: var(--text-muted); }
    .alert { padding: 10px 14px; border-radius: 6px; font-size: 13px; margin-bottom: 16px; }
    .alert-warning { background: #fff8e1; color: #856404; border: 1px solid #f0d060; }
    .alert-error { background: #fdf2f2; color: #c0392b; border: 1px solid #f5c6c6; }
  `,
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    loginName: ['', Validators.required],
    password: ['', Validators.required],
  });
  protected readonly busy = signal(false);
  protected readonly submitted = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly expired = this.route.snapshot.queryParamMap.has('expired');

  protected submit(): void {
    this.submitted.set(true);
    this.error.set(null);
    if (this.form.invalid) return;

    this.busy.set(true);
    const { loginName, password } = this.form.getRawValue();
    this.auth.login(loginName, password).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        const target = returnUrl && returnUrl.startsWith('/') ? returnUrl : '/';
        void this.router.navigateByUrl(target);
      },
      error: (err: unknown) => {
        this.busy.set(false);
        this.error.set(problemMessage(err, 'Invalid login name or password.'));
      },
    });
  }
}
