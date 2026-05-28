import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { signal } from '@angular/core';
import { GwDrawerComponent } from './drawer.component';
import { GwButtonComponent } from '../../buttons/button/button.component';
import { GwInputComponent } from '../../forms/input/input.component';
import { GwFormFieldComponent } from '../../forms/form-field/form-field.component';

const meta: Meta<GwDrawerComponent> = {
  title: 'Overlays/Drawer',
  component: GwDrawerComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({
    imports: [GwDrawerComponent, GwButtonComponent, GwInputComponent, GwFormFieldComponent],
  })],
  argTypes: {
    side: { control: 'inline-radio', options: ['left', 'right', 'top', 'bottom'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg', 'xl'] },
  },
};
export default meta;
type Story = StoryObj<GwDrawerComponent>;

export const Right: Story = {
  args: { side: 'right', size: 'md' },
  render: (args) => ({
    props: { ...args, open: signal(true) },
    template: `
      <gw-button (click)="open.set(true)">Open drawer</gw-button>
      <gw-drawer [open]="open()" (openChange)="open.set($event)"
                 [side]="side" [size]="size"
                 title="Filter admissions"
                 description="Narrow the list to what matters right now.">
        <div style="display:grid; gap:14px;">
          <gw-form-field label="Patient name"><gw-input placeholder="Search…" /></gw-form-field>
          <gw-form-field label="Ward"><gw-input placeholder="ICU, General…" /></gw-form-field>
        </div>
        <ng-container gw-drawer-footer>
          <gw-button variant="ghost" (click)="open.set(false)">Clear</gw-button>
          <gw-button variant="primary" (click)="open.set(false)">Apply</gw-button>
        </ng-container>
      </gw-drawer>`,
  }),
};
