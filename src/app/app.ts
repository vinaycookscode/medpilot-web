import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GwToastOutletComponent } from './shared/ui/feedback/toast/toast-outlet.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, GwToastOutletComponent],
  template: `
    <router-outlet />
    <gw-toast-outlet />
  `,
  styles: [],
})
export class App {}
