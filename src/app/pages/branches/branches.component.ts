import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '../../shared/icons';
import { BranchesService } from '../../core/services/branches.service';
import { ToastService } from '../../core/services/toast.service';
import { Branch } from '../../core/models/branch.models';
import { GwFormFieldComponent } from '../../shared/ui/forms/form-field/form-field.component';
import { GwInputComponent } from '../../shared/ui/forms/input/input.component';
import { GwToggleComponent } from '../../shared/ui/forms/toggle/toggle.component';
import { GwButtonComponent } from '../../shared/ui/buttons/button/button.component';
import { GwIconButtonComponent } from '../../shared/ui/buttons/icon-button/icon-button.component';
import { GwBadgeComponent } from '../../shared/ui/display/badge/badge.component';
import { GwEmptyStateComponent } from '../../shared/ui/display/empty-state/empty-state.component';
import { GwSpinnerComponent } from '../../shared/ui/display/spinner/spinner.component';
import { GwDialogComponent } from '../../shared/ui/overlays/dialog/dialog.component';

@Component({
  selector: 'app-branches',
  standalone: true,
  imports: [
    FormsModule, IconsModule,
    GwFormFieldComponent, GwInputComponent, GwToggleComponent,
    GwButtonComponent, GwIconButtonComponent,
    GwBadgeComponent, GwEmptyStateComponent, GwSpinnerComponent,
    GwDialogComponent,
  ],
  templateUrl: './branches.component.html',
  styleUrl: './branches.component.scss',
})
export class BranchesComponent implements OnInit {
  private branchesService = inject(BranchesService);
  private toast = inject(ToastService);

  readonly loading  = signal(true);
  readonly saving   = signal(false);
  readonly branches = signal<Branch[]>([]);
  readonly showForm = signal(false);
  readonly editBranch = signal<Branch | null>(null);

  form = this.blankForm();

  ngOnInit() { this.load(); }

  load() {
    this.branchesService.getAll().subscribe({
      next: r => { this.branches.set(r.data ?? []); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  openAdd() {
    this.editBranch.set(null);
    this.form = this.blankForm();
    this.showForm.set(true);
  }

  openEdit(b: Branch) {
    this.editBranch.set(b);
    this.form = {
      name: b.name,
      addressLine1: b.addressLine1 ?? '',
      addressLine2: b.addressLine2 ?? '',
      city: b.city ?? '',
      state: b.state ?? '',
      pincode: b.pincode ?? '',
      phone: b.phone ?? '',
      email: b.email ?? '',
      isHeadOffice: b.isHeadOffice,
    };
    this.showForm.set(true);
  }

  saveForm() {
    this.saving.set(true);
    const existing = this.editBranch();
    const req = existing
      ? this.branchesService.update(existing.id, this.form)
      : this.branchesService.create(this.form);

    req.subscribe({
      next: () => {
        this.saving.set(false);
        this.showForm.set(false);
        this.toast.show(existing ? 'Branch updated' : 'Branch added', 'success');
        this.load();
      },
      error: () => { this.saving.set(false); this.toast.show('Failed to save', 'danger'); },
    });
  }

  deleteBranch(b: Branch) {
    if (!confirm(`Delete branch "${b.name}"?`)) return;
    this.branchesService.delete(b.id).subscribe({
      next: () => { this.toast.show('Branch deleted', 'success'); this.load(); },
      error: () => this.toast.show('Failed to delete', 'danger'),
    });
  }

  addressOf(b: Branch): string {
    return [b.addressLine1, b.addressLine2, b.city, b.state, b.pincode].filter(v => !!v).join(', ');
  }

  private blankForm() {
    return { name: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', phone: '', email: '', isHeadOffice: false };
  }
}
