import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { GwTopNavComponent } from './top-nav.component';
import { GwIconButtonComponent } from '../../buttons/icon-button/icon-button.component';
import { GwAvatarComponent } from '../../display/avatar/avatar.component';
import { GwSearchInputComponent } from '../../forms/search-input/search-input.component';

const meta: Meta<GwTopNavComponent> = {
  title: 'Navigation/Top Nav',
  component: GwTopNavComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [GwTopNavComponent, GwIconButtonComponent, GwAvatarComponent, GwSearchInputComponent] })],
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj<GwTopNavComponent>;

export const Default: Story = {
  render: () => ({
    template: `
      <gw-top-nav>
        <div gw-top-nav-brand style="display:flex; align-items:center; gap:8px;">
          <div style="width:22px;height:22px;border-radius:6px;background:linear-gradient(135deg,#2563EB,#1E3A8A);"></div>
          <strong style="font-size:14px;">GotWell</strong>
        </div>
        <div gw-top-nav-center style="width:320px;">
          <gw-search-input placeholder="Search…" />
        </div>
        <div gw-top-nav-right>
          <gw-icon-button icon="bell" ariaLabel="Notifications" />
          <gw-avatar name="Anjali Sharma" size="sm" status="online" />
        </div>
      </gw-top-nav>`,
  }),
};
