import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { GwBadgeComponent } from './badge.component';

const meta: Meta<GwBadgeComponent> = {
  title: 'Display/Badge',
  component: GwBadgeComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [GwBadgeComponent] })],
  argTypes: {
    variant: { control: 'select', options: ['neutral', 'primary', 'success', 'warning', 'danger', 'info', 'purple'] },
    tone: { control: 'inline-radio', options: ['solid', 'soft', 'outline'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
};
export default meta;
type Story = StoryObj<GwBadgeComponent>;

export const Basic: Story = {
  args: { variant: 'success', tone: 'soft', dot: true, size: 'md' },
  render: (args) => ({ props: args, template: `<gw-badge [variant]="variant" [tone]="tone" [size]="size" [dot]="dot">Active</gw-badge>` }),
};

export const Matrix: Story = {
  render: () => ({
    template: `
      <div style="display:grid; gap:12px;">
        <div style="display:flex; gap:6px; flex-wrap:wrap; align-items:center;">
          <gw-badge variant="primary" tone="soft" dot>Primary</gw-badge>
          <gw-badge variant="success" tone="soft" dot>Active</gw-badge>
          <gw-badge variant="warning" tone="soft" dot>Pending</gw-badge>
          <gw-badge variant="danger"  tone="soft" dot>Failed</gw-badge>
          <gw-badge variant="info"    tone="soft" dot>Info</gw-badge>
          <gw-badge variant="purple"  tone="soft" dot>Beta</gw-badge>
          <gw-badge variant="neutral" tone="soft">Draft</gw-badge>
        </div>
        <div style="display:flex; gap:6px; flex-wrap:wrap; align-items:center;">
          <gw-badge variant="primary" tone="solid">Primary</gw-badge>
          <gw-badge variant="success" tone="solid">Active</gw-badge>
          <gw-badge variant="warning" tone="solid">Pending</gw-badge>
          <gw-badge variant="danger"  tone="solid">Failed</gw-badge>
          <gw-badge variant="neutral" tone="solid">Default</gw-badge>
        </div>
        <div style="display:flex; gap:6px; flex-wrap:wrap; align-items:center;">
          <gw-badge variant="primary" tone="outline">Primary</gw-badge>
          <gw-badge variant="success" tone="outline">Active</gw-badge>
          <gw-badge variant="warning" tone="outline">Pending</gw-badge>
          <gw-badge variant="danger"  tone="outline">Failed</gw-badge>
          <gw-badge variant="neutral" tone="outline">Default</gw-badge>
        </div>
      </div>`,
  }),
};
