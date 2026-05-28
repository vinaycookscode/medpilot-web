import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { GwSidebarComponent } from './sidebar.component';
import { GwAvatarComponent } from '../../display/avatar/avatar.component';

const meta: Meta<GwSidebarComponent> = {
  title: 'Navigation/Sidebar',
  component: GwSidebarComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [GwSidebarComponent, GwAvatarComponent] })],
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj<GwSidebarComponent>;

const SECTIONS = [
  { label: 'Workspace', items: [
    { key: 'home',       label: 'Dashboard',  icon: 'layout-dashboard' },
    { key: 'admissions', label: 'Admissions', icon: 'bed', badge: 42 },
    { key: 'opd',        label: 'OPD',        icon: 'stethoscope' },
  ]},
  { label: 'Admin', items: [
    { key: 'settings',   label: 'Settings',   icon: 'settings' },
    { key: 'audit',      label: 'Audit log',  icon: 'history' },
  ]},
];

export const Default: Story = {
  args: { sections: SECTIONS, activeKey: 'admissions' },
  render: (args) => ({
    props: args,
    template: `<div style="height:600px; display:flex; background:var(--surface-page);">
      <gw-sidebar [sections]="sections" [activeKey]="activeKey" [collapsed]="collapsed" />
    </div>`,
  }),
};

export const Collapsed: Story = {
  args: { sections: SECTIONS, activeKey: 'admissions', collapsed: true },
  render: (args) => ({
    props: args,
    template: `<div style="height:600px; display:flex; background:var(--surface-page);">
      <gw-sidebar [sections]="sections" [activeKey]="activeKey" [collapsed]="collapsed" />
    </div>`,
  }),
};
