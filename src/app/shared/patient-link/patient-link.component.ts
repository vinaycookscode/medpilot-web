import { Component, Input, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IconsModule } from '../icons';
import { PatientsService, PatientOverview } from '../../core/services/patients.service';
import { GwPopoverComponent } from '../ui/overlays/popover/popover.component';
import { GwButtonComponent } from '../ui/buttons/button/button.component';
import { GwSpinnerComponent } from '../ui/display/spinner/spinner.component';

/**
 * Reusable patient name. Click → full history page. Hover → a preview popover
 * (current treatment + admission + counts) with a "Full history" button.
 * Drop in anywhere a patient name appears: <app-patient-link [patientId]="p.id" [name]="..."/>
 */
@Component({
  selector: 'app-patient-link',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IconsModule, GwPopoverComponent, GwButtonComponent, GwSpinnerComponent],
  template: `
    <span #nameEl class="pl" (click)="goHistory($event)" (mouseenter)="onEnter()" (mouseleave)="scheduleClose()">{{ name }}</span>
    @if (open()) {
      <gw-popover [anchor]="nameEl" [open]="true" placement="bottom" align="start" [showArrow]="true"
                  [dismissOnOutsideClick]="false" (mouseenter)="cancelClose()" (mouseleave)="scheduleClose()">
        <div class="pl-pop">
          @if (data(); as ov) {
            @if (ov.activeAdmission; as a) {
              <div class="pl-pop__status"><span class="badge badge--success">Admitted</span><span>{{ a.admissionNumber }}</span></div>
              <div class="pl-pop__line"><lucide-icon name="bed" [size]="13" /> {{ a.ward }} · {{ a.bed }} · {{ a.lengthOfStay }} day(s)</div>
              <div class="pl-pop__line"><lucide-icon name="stethoscope" [size]="13" /> Dr. {{ a.doctor }}</div>
              @if (a.diagnosis) { <div class="pl-pop__dx">{{ a.diagnosis }}</div> }
            } @else if (ov.activeEncounter; as e) {
              <div class="pl-pop__status"><span class="badge badge--primary">OPD in progress</span><span>{{ e.encounterNumber }}</span></div>
              <div class="pl-pop__line"><lucide-icon name="stethoscope" [size]="13" /> Dr. {{ e.doctor }}</div>
              @if (e.chiefComplaint) { <div class="pl-pop__dx">{{ e.chiefComplaint }}</div> }
            } @else {
              <div class="pl-pop__status"><span class="badge badge--neutral">No active treatment</span></div>
            }
            <div class="pl-pop__counts">
              <span>{{ ov.counts.admissions }} adm</span><span>{{ ov.counts.opdVisits }} OPD</span>
              <span>{{ ov.counts.prescriptions }} Rx</span><span>{{ ov.counts.investigations }} inv</span>
            </div>
            <gw-button variant="primary" size="sm" [block]="true" leadingIcon="history" (click)="goHistory($event)">View full history</gw-button>
          } @else {
            <div class="pl-pop__loading"><gw-spinner size="sm" /> Loading…</div>
          }
        </div>
      </gw-popover>
    }
  `,
  styles: [`
    .pl { color: var(--color-primary); font-weight: 600; cursor: pointer; }
    .pl:hover { text-decoration: underline; }
    .pl-pop { min-width: 240px; max-width: 290px; display: flex; flex-direction: column; gap: var(--sp-2); padding: var(--sp-1); }
    .pl-pop__status { display: flex; align-items: center; gap: var(--sp-2); font-size: .8rem; font-weight: 600; color: var(--text-primary); }
    .pl-pop__line { display: flex; align-items: center; gap: var(--sp-2); font-size: .8rem; color: var(--text-secondary); }
    .pl-pop__line lucide-icon { color: var(--text-tertiary); }
    .pl-pop__dx { font-size: .8rem; color: var(--text-primary); }
    .pl-pop__counts { display: flex; flex-wrap: wrap; gap: var(--sp-2); font-size: .72rem; color: var(--text-tertiary); border-top: 1px solid var(--border); padding-top: var(--sp-2); }
    .pl-pop__loading { display: flex; align-items: center; gap: var(--sp-2); font-size: .8rem; color: var(--text-secondary); }
  `],
})
export class PatientLinkComponent {
  @Input({ required: true }) patientId!: string;
  @Input() name = '';

  private svc = inject(PatientsService);
  private router = inject(Router);

  readonly open = signal(false);
  readonly data = signal<PatientOverview | null>(null);
  private closeTimer: any = null;
  private enterTimer: any = null;
  private static cache = new Map<string, PatientOverview>();

  onEnter() {
    this.cancelClose();
    clearTimeout(this.enterTimer);
    this.enterTimer = setTimeout(() => {
      this.open.set(true);
      const cached = PatientLinkComponent.cache.get(this.patientId);
      if (cached) { this.data.set(cached); return; }
      this.data.set(null);
      this.svc.overview(this.patientId).subscribe({
        next: (r) => { PatientLinkComponent.cache.set(this.patientId, r.data); this.data.set(r.data); },
        error: () => {},
      });
    }, 220);
  }
  scheduleClose() {
    clearTimeout(this.enterTimer);
    clearTimeout(this.closeTimer);
    this.closeTimer = setTimeout(() => this.open.set(false), 180);
  }
  cancelClose() { clearTimeout(this.closeTimer); }

  goHistory(ev: Event) {
    ev.stopPropagation();
    this.open.set(false);
    this.router.navigate(['/patients', this.patientId, 'history']);
  }
}
