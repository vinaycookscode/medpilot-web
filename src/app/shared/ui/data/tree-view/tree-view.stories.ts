import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { signal } from '@angular/core';
import { GwTreeViewComponent } from './tree-view.component';

const meta: Meta<GwTreeViewComponent> = {
  title: 'Data/Tree View',
  component: GwTreeViewComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [GwTreeViewComponent] })],
};
export default meta;
type Story = StoryObj<GwTreeViewComponent>;

const NODES = [
  { key: 'workspace', label: 'Workspace', icon: 'building', expanded: true, children: [
    { key: 'admissions', label: 'Admissions', icon: 'bed', meta: 42 },
    { key: 'opd',        label: 'OPD',        icon: 'stethoscope', meta: 186 },
    { key: 'ipd',        label: 'IPD',        icon: 'activity', expanded: true, children: [
      { key: 'icu',     label: 'ICU',     meta: 12 },
      { key: 'general', label: 'General', meta: 36 },
      { key: 'private', label: 'Private', meta: 22 },
    ]},
  ]},
  { key: 'admin', label: 'Admin', icon: 'shield', children: [
    { key: 'permissions', label: 'Permissions' },
    { key: 'audit',       label: 'Audit log' },
  ]},
];

export const Default: Story = {
  render: () => ({
    props: { nodes: NODES, selected: signal('icu') },
    template: `<div style="max-width:280px;"><gw-tree-view [nodes]="nodes" [selectedKey]="selected()" (selectionChange)="selected.set($event)" /></div>`,
  }),
};
