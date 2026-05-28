import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { GwBannerComponent } from './banner.component';
import { GwButtonComponent } from '../../buttons/button/button.component';

const meta: Meta<GwBannerComponent> = {
  title: 'Display/Banner',
  component: GwBannerComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [GwBannerComponent, GwButtonComponent] })],
  argTypes: {
    variant: { control: 'inline-radio', options: ['announce', 'info', 'success', 'warning', 'danger'] },
  },
};
export default meta;
type Story = StoryObj<GwBannerComponent>;

export const Announce: Story = {
  args: { variant: 'announce', dismissible: true },
  render: (args) => ({
    props: args,
    template: `
      <gw-banner [variant]="variant" [dismissible]="dismissible">
        🎉 New: clinical hierarchy workbench now supports attendant routing.
        <div gw-banner-actions>
          <gw-button variant="ghost" size="sm" style="color:#fff;">Learn more</gw-button>
        </div>
      </gw-banner>`,
  }),
};

export const Variants: Story = {
  render: () => ({
    template: `
      <div style="display:flex; flex-direction:column; gap:8px;">
        <gw-banner variant="info">Maintenance window: 02:00–02:30 IST tonight.</gw-banner>
        <gw-banner variant="success">Backup completed successfully.</gw-banner>
        <gw-banner variant="warning">Bed capacity is at 85% — consider deferring electives.</gw-banner>
        <gw-banner variant="danger">3 lab results are overdue by more than 4 hours.</gw-banner>
      </div>`,
  }),
};
