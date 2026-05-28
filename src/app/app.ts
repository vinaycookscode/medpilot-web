import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { IconsModule } from './shared/icons';
import { GwToastOutletComponent } from './shared/ui/feedback/toast/toast-outlet.component';

@Component({
  selector: 'app-root',
  standalone: true,
  // Importing IconsModule at the root ensures the lucide icon registry
  // is populated before any gw-* or page component renders.
  imports: [RouterOutlet, IconsModule, GwToastOutletComponent],
  template: `
    <router-outlet />
    <gw-toast-outlet />
  `,
  styles: [],
})
export class App {}
