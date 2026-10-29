import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, finalize, map, Observable, of, shareReplay, switchMap, tap } from 'rxjs';
import { delay } from 'rxjs/operators';
import { LoginResponse, Me } from './models';

const STORAGE_KEY = 'pmrda.session';

interface StoredSession {
  token: string;
  expiresAt: string;
}

function readSession(): string | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const s: StoredSession = JSON.parse(raw);
    if (new Date(s.expiresAt) <= new Date()) {
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return s.token;
  } catch {
    return null;
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private pendingMe: Observable<Me | null> | null = null;

  readonly token = signal<string | null>(readSession());
  readonly me = signal<Me | null>(null);
  readonly permissions = computed(() => new Set(this.me()?.permissions ?? []));

  can(permission: string): boolean {
    return this.permissions().has(permission);
  }

  login(loginName: string, password: string): Observable<Me> {
    // Demo mode: accept any credentials and return a mock user
    const DEMO_USERS: Record<string, Me> = {
      'applicant': { id: 1, loginName: 'applicant', displayName: 'Rajesh Patil', email: 'rajesh@example.com', role: 'Applicant', permissions: ['applications.view','applications.create','applications.edit','applications.submit','dashboard.view'], mustChangePassword: false },
      'assistant': { id: 2, loginName: 'assistant', displayName: 'Savita Jadhav', email: 'savita@pmrda.gov.in', role: 'Assistant', permissions: ['scrutiny.view','scrutiny.action','inspection.view','applications.view','dashboard.view'], mustChangePassword: false },
      'superintendent': { id: 3, loginName: 'superintendent', displayName: 'Ganesh More', email: 'ganesh@pmrda.gov.in', role: 'Superintendent', permissions: ['scrutiny.view','scrutiny.action','inspection.view','inspection.submit','review.action','applications.view','dashboard.view'], mustChangePassword: false },
      'hod': { id: 4, loginName: 'hod', displayName: 'Anand Jagtap', email: 'anand@pmrda.gov.in', role: 'Authority', permissions: ['scrutiny.view','review.action','decision.action','applications.view','dashboard.view'], mustChangePassword: false },
      'admin': { id: 5, loginName: 'admin', displayName: 'Super Admin', email: 'admin@pmrda.gov.in', role: 'SuperAdmin', permissions: ['users.view','users.edit','roles.view','roles.edit','applications.view','scrutiny.view','dashboard.view'], mustChangePassword: false },
    };
    const me = DEMO_USERS[loginName.toLowerCase()] ?? DEMO_USERS['applicant'];
    const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString();
    this.store({ token: 'demo-token', expiresAt });
    this.me.set(me);
    localStorage.setItem('pmrda.demo.me', JSON.stringify(me));
    return of(me).pipe(delay(80));
  }

  loadMe(): Observable<Me> {
    return this.http.get<Me>('/api/auth/me').pipe(tap((me) => this.me.set(me)));
  }

  ensureMe(): Observable<Me | null> {
    const current = this.me();
    if (current) return of(current);
    const token = this.token();
    if (!token) return of(null);
    // In demo mode restore me from stored session without hitting the API
    if (token === 'demo-token') {
      try {
        const raw = localStorage.getItem('pmrda.demo.me');
        if (raw) {
          const me: Me = JSON.parse(raw);
          this.me.set(me);
          return of(me);
        }
      } catch { /* ignore */ }
      // Stale demo token with no user data — clear it so guestGuard won't block /login
      this.clear();
      return of(null);
    }
    this.pendingMe ??= this.loadMe().pipe(
      map((me): Me | null => me),
      catchError(() => {
        this.clear();
        return of(null);
      }),
      finalize(() => (this.pendingMe = null)),
      shareReplay(1),
    );
    return this.pendingMe;
  }

  changePassword(currentPassword: string, newPassword: string): Observable<void> {
    return this.http.post<void>('/api/auth/change-password', { currentPassword, newPassword });
  }

  clear(): void {
    this.token.set(null);
    this.me.set(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('pmrda.demo.me');
    sessionStorage.removeItem(STORAGE_KEY);
  }

  logout(): void {
    this.clear();
    void this.router.navigate(['/login']);
  }

  private store(s: StoredSession): void {
    const json = JSON.stringify(s);
    localStorage.setItem(STORAGE_KEY, json);
    this.token.set(s.token);
  }
}
