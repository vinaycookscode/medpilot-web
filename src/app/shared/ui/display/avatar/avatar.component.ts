import { ChangeDetectionStrategy, Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export type GwAvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type GwAvatarShape = 'circle' | 'square';
export type GwAvatarStatus = 'online' | 'busy' | 'away' | 'offline' | null;

@Component({
  selector: 'gw-avatar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'gw-avatar',
    '[class.gw-avatar--xs]': "size === 'xs'",
    '[class.gw-avatar--sm]': "size === 'sm'",
    '[class.gw-avatar--lg]': "size === 'lg'",
    '[class.gw-avatar--xl]': "size === 'xl'",
    '[class.gw-avatar--square]': "shape === 'square'",
  },
})
export class GwAvatarComponent {
  @Input() src: string | null = null;
  @Input() name = '';
  @Input() alt: string | null = null;
  @Input() size: GwAvatarSize = 'md';
  @Input() shape: GwAvatarShape = 'circle';
  @Input() status: GwAvatarStatus = null;

  readonly imgFailed = signal(false);

  readonly initials = computed(() => {
    const parts = this.name.trim().split(/\s+/).slice(0, 2);
    return parts.map(p => p[0]?.toUpperCase() ?? '').join('');
  });

  /** Hue derived from name so two people with the same initials look different. */
  readonly hue = computed(() => {
    let h = 0;
    for (let i = 0; i < this.name.length; i++) h = (h * 31 + this.name.charCodeAt(i)) % 360;
    return h;
  });

  handleImgError() { this.imgFailed.set(true); }
}
