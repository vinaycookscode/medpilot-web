import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { signal } from '@angular/core';
import { GwPopoverComponent } from './popover.component';
import { GwButtonComponent } from '../../buttons/button/button.component';

const meta: Meta<GwPopoverComponent> = {
  title: 'Overlays/Popover',
  component: GwPopoverComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [GwPopoverComponent, GwButtonComponent] })],
};
export default meta;
type Story = StoryObj<GwPopoverComponent>;

export const Default: Story = {
  render: () => ({
    props: { open: signal(false) },
    template: `
      <div style="padding:80px;">
        <gw-button #trig (click)="open.set(!open())">Open popover</gw-button>
        <gw-popover [anchor]="trig" [open]="open()" placement="bottom" align="start"
                    (openChange)="open.set($event)">
          <div style="min-width:240px;">
            <p style="margin:0 0 8px;font-weight:600;font-size:13px;">Notifications</p>
            <p style="margin:0;font-size:12px;color:#6c6c70;">You have 3 unread updates.</p>
            <hr style="margin:12px -8px;border:0;border-top:1px solid var(--border);" />
            <gw-button variant="ghost" size="sm" [block]="true">Mark all as read</gw-button>
          </div>
        </gw-popover>
      </div>`,
  }),
};
