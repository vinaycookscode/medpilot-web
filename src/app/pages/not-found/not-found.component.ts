import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IconsModule } from '../../shared/icons';
import { GwButtonComponent } from '../../shared/ui/buttons/button/button.component';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [IconsModule, GwButtonComponent],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss',
})
export class NotFoundComponent {
  private router = inject(Router);

  goHome() {
    this.router.navigate(['/dashboard']);
  }
}
