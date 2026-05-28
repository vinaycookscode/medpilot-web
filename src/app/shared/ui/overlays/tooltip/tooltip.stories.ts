import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { GwTooltipDirective } from './tooltip.directive';
import { GwButtonComponent } from '../../buttons/button/button.component';
import { GwIconButtonComponent } from '../../buttons/icon-button/icon-button.component';

const meta: Meta<GwTooltipDirective> = {
  title: 'Overlays/Tooltip',
  component: GwTooltipDirective,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [GwTooltipDirective, GwButtonComponent, GwIconButtonComponent] })],
};
export default meta;
type Story = StoryObj<GwTooltipDirective>;

export const Positions: Story = {
  render: () => ({
    template: `
      <div style="display:grid; grid-template-columns: repeat(4, auto); gap:24px; padding: 80px 40px;">
        <gw-button [gwTooltip]="'Tooltip on top'"    gwTooltipPosition="top">Top</gw-button>
        <gw-button [gwTooltip]="'Tooltip on bottom'" gwTooltipPosition="bottom">Bottom</gw-button>
        <gw-button [gwTooltip]="'Tooltip on left'"   gwTooltipPosition="left">Left</gw-button>
        <gw-button [gwTooltip]="'Tooltip on right'"  gwTooltipPosition="right">Right</gw-button>
      </div>`,
  }),
};

export const OnIconButton: Story = {
  render: () => ({
    template: `
      <div style="display:flex; gap:8px; padding: 60px 40px;">
        <gw-icon-button icon="edit" ariaLabel="Edit"
                        [gwTooltip]="'Edit patient record'" gwTooltipPosition="bottom" />
        <gw-icon-button icon="trash" ariaLabel="Delete" variant="danger"
                        [gwTooltip]="'Delete (cannot be undone)'" gwTooltipPosition="bottom" />
        <gw-icon-button icon="settings" ariaLabel="Settings"
                        [gwTooltip]="'Open settings'" gwTooltipPosition="bottom" />
      </div>`,
  }),
};

export const LongText: Story = {
  render: () => ({
    template: `
      <div style="padding: 80px 40px;">
        <gw-button [gwTooltip]="'A longer tooltip that wraps onto multiple lines so you can see how max-width clamps the layout cleanly.'" gwTooltipPosition="top">Hover me</gw-button>
      </div>`,
  }),
};
