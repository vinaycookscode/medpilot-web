import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IconsModule } from '../../shared/icons';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [IconsModule],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss',
})
export class NotFoundComponent {
  private router = inject(Router);

  goHome() {
    this.router.navigate(['/dashboard']);
  }
}
