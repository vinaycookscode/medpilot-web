import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { GwToggleComponent } from './toggle.component';

const meta: Meta<GwToggleComponent> = {
  title: 'Forms/Toggle',
  component: GwToggleComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({ imports: [FormsModule, ReactiveFormsModule, GwToggleComponent] }),
  ],
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md'] },
  },
};
export default meta;

type Story = StoryObj<GwToggleComponent>;

export const Basic: Story = {
  args: { label: 'Notifications enabled', size: 'md' },
};

export const Checked: Story = {
  render: () => ({
    props: { ctrl: new FormControl(true) },
    template: `<gw-toggle label="Daily summary email" [formControl]="ctrl" />`,
  }),
};

export const Disabled: Story = {
  render: () => ({
    props: { ctrl: new FormControl({ value: false, disabled: true }) },
    template: `<gw-toggle label="Beta features (locked)" [formControl]="ctrl" />`,
  }),
};

export const Sizes: Story = {
  render: () => ({
    template: `
      <div style="display:flex; flex-direction:column; gap:14px;">
        <gw-toggle label="Small" size="sm" />
        <gw-toggle label="Medium (default)" size="md" />
      </div>
    `,
  }),
};
