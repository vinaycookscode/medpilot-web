import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { AppMetaService } from '../services/app-meta.service';

/**
 * Blocks navigation to a route when the current user's role lacks `canView`
 * on the module key declared in `route.data.module`.
 *
 * Wire up: `data: { module: 'patients' }` on the route. Super admins bypass
 * the check. Missing module key → no permission gate (no-op).
 */
export const permissionGuard: CanActivateFn = async (route: ActivatedRouteSnapshot) => {
  const auth    = inject(AuthService);
  const appMeta = inject(AppMetaService);
  const router  = inject(Router);

  const module = route.data['module'] as string | undefined;
  if (!module) return true;
  if (auth.role() === 'super_admin') return true;

  // Wait for app-meta to load before deciding — otherwise a first-time
  // navigation can race against the initial /app-meta request.
  if (!appMeta.loaded()) {
    try {
      await firstValueFrom(appMeta.load());
    } catch {
      return true;
    }
  }

  if (appMeta.canDo(module, 'canView')) return true;

  // User can't view this page. Decide where to send them:
  //  - has SOME access elsewhere → /not-found (don't leak which pages exist)
  //  - has NO access anywhere     → /no-access (dedicated empty-account screen)
  const perms = appMeta.permissions();
  const hasAnyAccess = Object.values(perms).some(p => p?.canView === true);
  return router.createUrlTree([hasAnyAccess ? '/not-found' : '/no-access']);
};
