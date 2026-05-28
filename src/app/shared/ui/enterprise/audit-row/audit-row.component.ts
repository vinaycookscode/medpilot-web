import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GwAvatarComponent } from '../../display/avatar/avatar.component';
import { GwBadgeComponent, GwBadgeVariant } from '../../display/badge/badge.component';

export type GwAuditSeverity = 'info' | 'warning' | 'danger';

export interface GwAuditEvent {
  id: string | number;
  actor: string;
  actorAvatar?: string;
  action: string;
  resource?: string;
  ip?: string;
  time: string;
  severity?: GwAuditSeverity;
  status?: string;
  detail?: string;
}

@Component({
  selector: 'gw-audit-row',
  standalone: true,
  imports: [CommonModule, GwAvatarComponent, GwBadgeComponent],
  templateUrl: './audit-row.component.html',
  styleUrl: './audit-row.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'gw-ar-host',
    '[attr.data-severity]': "event?.severity || 'info'",
  },
})
export class GwAuditRowComponent {
  @Input({ required: true }) event!: GwAuditEvent;

  get badgeVariant(): GwBadgeVariant {
    if (!this.event?.severity) return 'neutral';
    if (this.event.severity === 'warning') return 'warning';
    if (this.event.severity === 'danger') return 'danger';
    return 'info';
  }
}
