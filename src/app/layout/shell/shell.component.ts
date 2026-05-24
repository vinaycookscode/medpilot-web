import { Component, OnInit, inject, effect } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';
import { ToastContainerComponent } from '../../shared/toast-container/toast-container.component';
import { BgSceneComponent } from '../bg-scene/bg-scene.component';
import { AuthService } from '../../core/services/auth.service';
import { AppMetaService } from '../../core/services/app-meta.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent, ToastContainerComponent, BgSceneComponent],
  template: `
    <app-bg-scene />
    <div class="app-shell">
      <header class="app-topbar">
        <app-topbar />
      </header>
      <nav class="app-sidebar">
        <app-sidebar />
      </nav>
      <main class="app-content">
        <router-outlet />
      </main>
    </div>
    <app-toast-container />
  `,
})
export class ShellComponent implements OnInit {
  private auth = inject(AuthService);
  private appMeta = inject(AppMetaService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  constructor() {
    // Reactive guard: when the permissions signal changes (e.g. Super Admin
    // revoked access while the user was on the page), re-check the current
    // route's module gate and bounce to /no-access if it no longer passes.
    effect(() => {
      // Subscribe to permissions changes
      const perms = this.appMeta.permissions();

      if (this.auth.role() === 'super_admin') return;
      const url = this.router.url.split('?')[0];
      if (url === '/no-access' || url === '/not-found' || url === '/login') return;

      const module = this.findModuleForUrl(url);
      if (!module) return;
      if (!this.appMeta.canDo(module, 'canView')) {
        const hasAnyAccess = Object.values(perms).some(p => p?.canView === true);
        this.router.navigate([hasAnyAccess ? '/not-found' : '/no-access']);
      }
    });
  }

  ngOnInit() {
    this.auth.loadMetaIfMissing();
    // Every successful navigation triggers a version check — picks up
    // permission changes the moment a user clicks anything, in addition to
    // the 5-second background poll.
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => this.appMeta.refreshNow());
  }

  /** Walks the active route tree to find the module key declared in route.data. */
  private findModuleForUrl(_url: string): string | undefined {
    let r: ActivatedRoute | null = this.route;
    while (r) {
      const mod = r.snapshot.data?.['module'] as string | undefined;
      if (mod) return mod;
      r = r.firstChild;
    }
    return undefined;
  }
}
