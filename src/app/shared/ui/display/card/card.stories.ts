import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { GwCardComponent } from './card.component';
import { GwButtonComponent } from '../../buttons/button/button.component';
import { GwBadgeComponent } from '../badge/badge.component';

const meta: Meta<GwCardComponent> = {
  title: 'Display/Card',
  component: GwCardComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [GwCardComponent, GwButtonComponent, GwBadgeComponent] })],
  argTypes: {
    elevation: { control: 'inline-radio', options: ['flat', 'sm', 'md', 'lg'] },
    padding: { control: 'inline-radio', options: ['none', 'sm', 'md', 'lg'] },
  },
};
export default meta;
type Story = StoryObj<GwCardComponent>;

export const Basic: Story = {
  render: () => ({
    template: `
      <gw-card style="max-width:380px;">
        <div gw-card-header style="display:flex; align-items:center; justify-content:space-between;">
          <h3 style="margin:0; font-size:15px; font-weight:600;">Admissions today</h3>
          <gw-badge variant="success" tone="soft" dot>Live</gw-badge>
        </div>
        <p style="margin:0; font-size:32px; font-weight:600; letter-spacing:-0.02em;">42</p>
        <p style="margin:4px 0 0; font-size:13px; color:#6c6c70;">Up 12% versus yesterday.</p>
        <div gw-card-footer style="display:flex; justify-content:flex-end;">
          <gw-button variant="ghost" size="sm">View report →</gw-button>
        </div>
      </gw-card>`,
  }),
};

export const Elevations: Story = {
  render: () => ({
    template: `
      <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:16px;">
        <gw-card elevation="flat"><p style="margin:0;font-size:13px;">Flat</p></gw-card>
        <gw-card elevation="sm"><p style="margin:0;font-size:13px;">Small</p></gw-card>
        <gw-card elevation="md"><p style="margin:0;font-size:13px;">Medium</p></gw-card>
        <gw-card elevation="lg"><p style="margin:0;font-size:13px;">Large</p></gw-card>
      </div>`,
  }),
};

export const Interactive: Story = {
  render: () => ({
    template: `
      <gw-card [hoverable]="true" [interactive]="true" style="max-width:320px;">
        <p style="margin:0; font-weight:600;">Click anywhere on me</p>
        <p style="margin:4px 0 0; font-size:13px; color:#6c6c70;">Whole-card click target with hover lift + focus ring.</p>
      </gw-card>`,
  }),
};
