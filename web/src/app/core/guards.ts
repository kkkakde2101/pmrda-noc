import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.ensureMe().pipe(
    map((me) => {
      if (!me) return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
      if (me.mustChangePassword && !state.url.startsWith('/change-password')) {
        return router.createUrlTree(['/change-password']);
      }
      return true;
    }),
  );
};

export const permissionGuard = (permission: string): CanActivateFn => () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.ensureMe().pipe(
    map((me) => {
      if (!me) return router.createUrlTree(['/login']);
      return auth.can(permission) ? true : router.createUrlTree(['/forbidden']);
    }),
  );
};

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.token() ? router.createUrlTree(['/']) : true;
};
