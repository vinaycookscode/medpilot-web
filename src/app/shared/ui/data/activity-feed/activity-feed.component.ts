import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GwAvatarComponent } from '../../display/avatar/avatar.component';

export interface GwActivityItem {
  id: string | number;
  actor: string;       // person/system name
  actorAvatar?: string;
  action: string;      // verb phrase: "discharged", "admitted", "commented on"
  target?: string;     // e.g. "Riya Verma" or "patient #1024"
  time: string;        // human readable: "2 minutes ago"
  detail?: string;     // optional second-line description
  icon?: string;       // optional icon if no avatar
}

@Component({
  selector: 'gw-activity-feed',
  standalone: true,
  imports: [CommonModule, GwAvatarComponent],
  templateUrl: './activity-feed.component.html',
  styleUrl: './activity-feed.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'class': 'gw-af-host' },
})
export class GwActivityFeedComponent {
  @Input({ required: true }) items: GwActivityItem[] = [];
  @Input() emptyText = 'No recent activity';
}
