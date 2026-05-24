import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AppMetaService } from '../services/app-meta.service';

/**
 * Module → route candidates in priority order. First module the user has
 * `canView` on becomes their landing page when they hit /no-access directly.
 */
const ACCESS_CANDIDATES: Array<[string, string]> = [
  ['dashboard',     '/dashboard'],
  ['patients',      '/patients'],
  ['appointments',  '/appointments'],
  ['opd',           '/opd'],
  ['ipd',           '/ipd'],
  ['prescriptions', '/prescriptions'],
  ['labs',          '/labs'],
  ['billing',       '/billing'],
  ['insurance',     '/insurance'],
  ['inventory',     '/inventory'],
  ['staff',         '/staff'],
  ['schedules',     '/schedules'],
  ['reports',       '/reports'],
  ['notifications', '/notifications'],
  ['settings',      '/settings'],
];

/**
 * Blocks direct navigation to /no-access when the user actually has access
 * somewhere — they're redirected to their first accessible page instead.
 */
export const noAccessGuard: CanActivateFn = () => {
  const auth    = inject(AuthService);
  const appMeta = inject(AppMetaService);
  const router  = inject(Router);

  // Super admins always have access — bounce to dashboard
  if (auth.role() === 'super_admin') {
    return router.createUrlTree(['/dashboard']);
  }

  // If app-meta hasn't loaded yet we cannot make a decision — defer by
  // showing /no-access; the reactive effect in the shell will re-route once
  // permissions arrive.
  if (!appMeta.loaded()) return true;

  // Find the first module the user can actually view
  for (const [mod, path] of ACCESS_CANDIDATES) {
    if (appMeta.canDo(mod, 'canView')) {
      return router.createUrlTree([path]);
    }
  }

  // User genuinely has no access — show the page
  return true;
};
