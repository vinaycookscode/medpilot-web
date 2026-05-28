import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { GwSpinnerComponent } from './spinner.component';

const meta: Meta<GwSpinnerComponent> = {
  title: 'Display/Spinner',
  component: GwSpinnerComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [GwSpinnerComponent] })],
  argTypes: { size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg'] } },
};
export default meta;
type Story = StoryObj<GwSpinnerComponent>;

export const Sizes: Story = {
  render: () => ({
    template: `
      <div style="display:flex; gap:18px; align-items:center; color:#007AFF;">
        <gw-spinner size="xs" />
        <gw-spinner size="sm" />
        <gw-spinner size="md" />
        <gw-spinner size="lg" />
      </div>`,
  }),
};

export const InlineWithText: Story = {
  render: () => ({
    template: `
      <p style="display:flex; align-items:center; gap:8px; font-size:13px; color:#1c1c1e;">
        <gw-spinner size="sm" /> Loading admissions…
      </p>`,
  }),
};
