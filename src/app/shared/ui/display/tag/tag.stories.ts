import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { GwTagComponent } from './tag.component';

const meta: Meta<GwTagComponent> = {
  title: 'Display/Tag',
  component: GwTagComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [GwTagComponent] })],
};
export default meta;
type Story = StoryObj<GwTagComponent>;

export const Variants: Story = {
  render: () => ({
    template: `
      <div style="display:flex; gap:6px; flex-wrap:wrap;">
        <gw-tag variant="neutral">Diabetic</gw-tag>
        <gw-tag variant="primary">VIP</gw-tag>
        <gw-tag variant="success">Cleared</gw-tag>
        <gw-tag variant="warning">Allergic</gw-tag>
        <gw-tag variant="danger">High risk</gw-tag>
        <gw-tag variant="info">Reviewed</gw-tag>
        <gw-tag variant="purple">Research</gw-tag>
      </div>`,
  }),
};

export const Removable: Story = {
  render: () => ({
    template: `
      <div style="display:flex; gap:6px; flex-wrap:wrap;">
        <gw-tag variant="primary" [removable]="true">Cardiology</gw-tag>
        <gw-tag variant="warning" [removable]="true">Follow-up</gw-tag>
        <gw-tag variant="neutral" [removable]="true">Tag</gw-tag>
      </div>`,
  }),
};
