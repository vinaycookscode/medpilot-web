import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { GwProgressComponent } from './progress.component';

const meta: Meta<GwProgressComponent> = {
  title: 'Display/Progress',
  component: GwProgressComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [GwProgressComponent] })],
  argTypes: {
    mode: { control: 'inline-radio', options: ['linear', 'circular'] },
    variant: { control: 'inline-radio', options: ['primary', 'success', 'warning', 'danger'] },
  },
};
export default meta;
type Story = StoryObj<GwProgressComponent>;

export const Linear: Story = {
  args: { mode: 'linear', value: 68, variant: 'primary', showLabel: true },
  render: (args) => ({
    props: args,
    template: `<div style="width:320px;"><gw-progress [mode]="mode" [value]="value" [variant]="variant" [showLabel]="showLabel" /></div>`,
  }),
};

export const Variants: Story = {
  render: () => ({
    template: `
      <div style="display:flex; flex-direction:column; gap:14px; width:320px;">
        <gw-progress mode="linear" [value]="20" variant="primary" />
        <gw-progress mode="linear" [value]="55" variant="success" />
        <gw-progress mode="linear" [value]="80" variant="warning" />
        <gw-progress mode="linear" [value]="95" variant="danger" />
      </div>`,
  }),
};

export const LinearIndeterminate: Story = {
  render: () => ({
    template: `<div style="width:320px;"><gw-progress mode="linear" [value]="null" /></div>`,
  }),
};

export const Circular: Story = {
  render: () => ({
    template: `
      <div style="display:flex; gap:24px; align-items:center;">
        <gw-progress mode="circular" [value]="32" variant="primary" [showLabel]="true" />
        <gw-progress mode="circular" [value]="68" variant="success" [showLabel]="true" />
        <gw-progress mode="circular" [value]="90" variant="warning" [showLabel]="true" [size]="80" [stroke]="6" />
        <gw-progress mode="circular" [value]="null" variant="primary" [size]="40" />
      </div>`,
  }),
};
