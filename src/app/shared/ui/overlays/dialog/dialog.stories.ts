import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { signal } from '@angular/core';
import { GwDialogComponent } from './dialog.component';
import { GwButtonComponent } from '../../buttons/button/button.component';
import { GwInputComponent } from '../../forms/input/input.component';
import { GwFormFieldComponent } from '../../forms/form-field/form-field.component';

const meta: Meta<GwDialogComponent> = {
  title: 'Overlays/Dialog',
  component: GwDialogComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({
    imports: [GwDialogComponent, GwButtonComponent, GwInputComponent, GwFormFieldComponent],
  })],
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg', 'xl', 'full'] },
  },
};
export default meta;
type Story = StoryObj<GwDialogComponent>;

export const Confirm: Story = {
  args: { size: 'sm' },
  render: (args) => ({
    props: { ...args, open: signal(true) },
    template: `
      <gw-button (click)="open.set(true)">Open dialog</gw-button>
      <gw-dialog [open]="open()" (openChange)="open.set($event)"
                 [size]="size"
                 title="Delete patient record?"
                 description="This will permanently remove all clinical history. This action cannot be undone.">
        <p style="font-size:13px;color:#6c6c70;margin:0;">
          Type <strong>DELETE</strong> in the next step to confirm.
        </p>
        <ng-container gw-dialog-footer>
          <gw-button variant="ghost" (click)="open.set(false)">Cancel</gw-button>
          <gw-button variant="danger" (click)="open.set(false)">Delete</gw-button>
        </ng-container>
      </gw-dialog>`,
  }),
};

export const FormDialog: Story = {
  render: () => ({
    props: { open: signal(true) },
    template: `
      <gw-button (click)="open.set(true)">Edit patient</gw-button>
      <gw-dialog [open]="open()" (openChange)="open.set($event)" size="md"
                 title="Edit patient details">
        <div style="display:grid; gap:16px;">
          <gw-form-field label="Full name"><gw-input placeholder="Jane Doe" /></gw-form-field>
          <gw-form-field label="Mobile number"><gw-input type="tel" placeholder="+91 99999 99999" /></gw-form-field>
        </div>
        <ng-container gw-dialog-footer>
          <gw-button variant="ghost" (click)="open.set(false)">Cancel</gw-button>
          <gw-button variant="primary" (click)="open.set(false)">Save changes</gw-button>
        </ng-container>
      </gw-dialog>`,
  }),
};

export const Sizes: Story = {
  args: { size: 'lg' },
  render: (args) => ({
    props: { ...args, open: signal(true) },
    template: `
      <gw-button (click)="open.set(true)">Open ({{ size }})</gw-button>
      <gw-dialog [open]="open()" (openChange)="open.set($event)" [size]="size"
                 title="Dialog at size {{ size }}"
                 description="Adjust the size knob in the Storybook controls.">
        <p style="font-size:13px;color:#6c6c70;margin:0;">Lorem ipsum dolor sit amet.</p>
        <ng-container gw-dialog-footer>
          <gw-button variant="primary" (click)="open.set(false)">Close</gw-button>
        </ng-container>
      </gw-dialog>`,
  }),
};
