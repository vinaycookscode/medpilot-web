import { Component, OnInit, inject, signal, computed, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { IconsModule } from '../../../shared/icons';
import { HmsConfigService, MetaItem } from '../../../core/services/hms-config.service';
import { ToastService } from '../../../core/services/toast.service';

const TYPE_LABELS: Record<string, string> = {
  specialization:    'Specialization',
  appointment_type:  'Appointment Type',
  admission_type:    'Admission Type',
  discharge_type:    'Discharge Type',
  patient_condition: 'Patient Condition',
  note_type:         'Note Type',
  ipd_charge_type:   'IPD Charge Type',
  blood_group:       'Blood Group',
  gender:            'Gender',
  medicine_unit:     'Medicine Unit',
  dosage_frequency:  'Dosage Frequency',
  medicine_route:    'Medicine Route',
  bed_category:      'Bed Category',
};

const COLOR_OPTIONS = [
  { value: 'blue',   label: 'Blue' },
  { value: 'green',  label: 'Green' },
  { value: 'red',    label: 'Red' },
  { value: 'orange', label: 'Orange' },
  { value: 'yellow', label: 'Yellow' },
  { value: 'purple', label: 'Purple' },
  { value: 'cyan',   label: 'Cyan' },
  { value: 'gray',   label: 'Gray' },
];

@Component({
  selector: 'app-master-data',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IconsModule],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './master-data.component.html',
  styleUrl:    './master-data.component.scss',
})
export class MasterDataComponent implements OnInit {
  private svc   = inject(HmsConfigService);
  private toast = inject(ToastService);
  private fb    = inject(FormBuilder);

  readonly allItems    = signal<MetaItem[]>([]);
  readonly activeType  = signal<string>('specialization');
  readonly loading     = signal(false);
  readonly showModal   = signal(false);
  readonly editItem    = signal<MetaItem | null>(null);
  readonly deleteTarget= signal<MetaItem | null>(null);

  readonly typeKeys = Object.keys(TYPE_LABELS);
  readonly typeLabels = TYPE_LABELS;
  readonly colorOptions = COLOR_OPTIONS;

  readonly filteredItems = computed(() =>
    [...this.allItems()]
      .filter(i => i.type === this.activeType())
      .sort((a, b) => a.displayOrder - b.displayOrder),
  );

  readonly form = this.fb.nonNullable.group({
    value:        ['', [Validators.required, Validators.maxLength(100)]],
    label:        ['', [Validators.required, Validators.maxLength(150)]],
    color:        ['' as string],
    displayOrder: [0, Validators.required],
    isActive:     [true],
  });

  ngOnInit() { this.loadItems(); }

  loadItems() {
    this.loading.set(true);
    this.svc.getAllItems().subscribe({
      next: items => { this.allItems.set(items); this.loading.set(false); },
      error: () => { this.toast.error('Failed to load master data'); this.loading.set(false); },
    });
  }

  selectType(type: string) {
    this.activeType.set(type);
    this.closeModal();
  }

  openAdd() {
    this.editItem.set(null);
    const nextOrder = this.filteredItems().length;
    this.form.reset({ value: '', label: '', color: '', displayOrder: nextOrder, isActive: true });
    this.showModal.set(true);
  }

  openEdit(item: MetaItem) {
    this.editItem.set(item);
    this.form.reset({
      value:        item.value,
      label:        item.label,
      color:        item.color ?? '',
      displayOrder: item.displayOrder,
      isActive:     item.isActive,
    });
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editItem.set(null);
    this.deleteTarget.set(null);
  }

  save() {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const dto = {
      ...(this.editItem() ? { id: this.editItem()!.id } : {}),
      type:         this.activeType(),
      value:        v.value,
      label:        v.label,
      color:        v.color || null,
      displayOrder: v.displayOrder,
      isActive:     v.isActive,
    };

    this.svc.upsert(dto).subscribe({
      next: saved => {
        const items = [...this.allItems()];
        const idx = items.findIndex(i => i.id === saved.id);
        if (idx >= 0) items[idx] = saved;
        else items.push(saved);
        this.allItems.set(items);
        this.toast.success(this.editItem() ? 'Item updated' : 'Item added');
        this.closeModal();
      },
      error: () => this.toast.error('Failed to save item'),
    });
  }

  confirmDelete(item: MetaItem) { this.deleteTarget.set(item); }

  doDelete() {
    const target = this.deleteTarget();
    if (!target) return;
    this.svc.remove(target.id).subscribe({
      next: () => {
        this.allItems.update(items => items.filter(i => i.id !== target.id));
        this.toast.success('Item deleted');
        this.deleteTarget.set(null);
      },
      error: () => this.toast.error('Failed to delete item'),
    });
  }

  moveUp(item: MetaItem) { this.reorder(item, -1); }
  moveDown(item: MetaItem) { this.reorder(item, +1); }

  private reorder(item: MetaItem, dir: -1 | 1) {
    const items = [...this.filteredItems()];
    const idx = items.findIndex(i => i.id === item.id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= items.length) return;

    const updates = [
      { id: items[idx].id,     displayOrder: items[swapIdx].displayOrder },
      { id: items[swapIdx].id, displayOrder: items[idx].displayOrder },
    ];
    this.svc.reorder(updates).subscribe({
      next: () => {
        const all = [...this.allItems()];
        updates.forEach(u => {
          const i = all.findIndex(x => x.id === u.id);
          if (i >= 0) all[i] = { ...all[i], displayOrder: u.displayOrder };
        });
        this.allItems.set(all);
      },
      error: () => this.toast.error('Failed to reorder'),
    });
  }

  typeItemCount(type: string) {
    return this.allItems().filter(i => i.type === type).length;
  }
}
