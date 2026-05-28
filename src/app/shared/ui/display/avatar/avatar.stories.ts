import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { GwAvatarComponent } from './avatar.component';

const meta: Meta<GwAvatarComponent> = {
  title: 'Display/Avatar',
  component: GwAvatarComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [GwAvatarComponent] })],
  argTypes: {
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    shape: { control: 'inline-radio', options: ['circle', 'square'] },
    status: { control: 'inline-radio', options: [null, 'online', 'busy', 'away', 'offline'] as any },
  },
};
export default meta;
type Story = StoryObj<GwAvatarComponent>;

export const FromInitials: Story = {
  args: { name: 'Anjali Sharma', size: 'md', status: 'online' },
};

export const Sizes: Story = {
  render: () => ({
    template: `
      <div style="display:flex; gap:12px; align-items:center;">
        <gw-avatar size="xs" name="Anjali Sharma" />
        <gw-avatar size="sm" name="Anjali Sharma" />
        <gw-avatar size="md" name="Anjali Sharma" />
        <gw-avatar size="lg" name="Anjali Sharma" />
        <gw-avatar size="xl" name="Anjali Sharma" />
      </div>`,
  }),
};

export const Statuses: Story = {
  render: () => ({
    template: `
      <div style="display:flex; gap:12px; align-items:center;">
        <gw-avatar name="Riya"   status="online" />
        <gw-avatar name="Karan"  status="busy" />
        <gw-avatar name="Asha"   status="away" />
        <gw-avatar name="Vivaan" status="offline" />
      </div>`,
  }),
};

export const Group: Story = {
  render: () => ({
    template: `
      <div style="display:flex; align-items:center;">
        <gw-avatar name="Anjali Sharma"  style="margin-right:-8px; border:2px solid #fff;" />
        <gw-avatar name="Karan Mehta"    style="margin-right:-8px; border:2px solid #fff;" />
        <gw-avatar name="Riya Verma"     style="margin-right:-8px; border:2px solid #fff;" />
        <gw-avatar name="+ 4 more"       style="border:2px solid #fff;" />
      </div>`,
  }),
};
