import { HttpErrorResponse } from '@angular/common/http';

export function problemMessage(err: unknown, fallback = 'Something went wrong. Try again.'): string {
  if (!(err instanceof HttpErrorResponse)) return fallback;
  const body = err.error as { detail?: string; title?: string } | null;
  if (err.status === 0) return 'The server cannot be reached. Check your connection and try again.';
  if (err.status === 403) return 'Your role does not allow this action.';
  if (err.status === 404) return 'This record no longer exists or is not accessible.';
  if (body?.detail) return body.detail;
  if (err.status === 400 && body?.title) return 'Some fields need attention.';
  return fallback;
}

export function fieldErrors(err: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  if (err instanceof HttpErrorResponse && err.status === 400) {
    const errors = (err.error as { errors?: Record<string, string[]> } | null)?.errors ?? {};
    for (const [key, messages] of Object.entries(errors)) {
      const name = key.replace(/^\$\./, '');
      out[name.charAt(0).toLowerCase() + name.slice(1)] = messages[0] ?? 'This value is not valid.';
    }
  }
  return out;
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  const d = new Date(value);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  const d = new Date(value);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function treesRequired(plotAreaSqm: number): number {
  return Math.ceil(plotAreaSqm / 80);
}
