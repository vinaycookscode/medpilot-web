import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';
import { ToastContainerComponent } from '../../shared/toast-container/toast-container.component';
import { BgSceneComponent } from '../bg-scene/bg-scene.component';

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
export class ShellComponent {}
