import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { GwDescriptionListComponent, GwDescriptionItem } from './description-list.component';

const meta: Meta<GwDescriptionListComponent> = {
  title: 'Data/Description List',
  component: GwDescriptionListComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [GwDescriptionListComponent] })],
  argTypes: {
    layout: { control: 'inline-radio', options: ['stacked', 'inline', 'grid'] },
  },
};
export default meta;
type Story = StoryObj<GwDescriptionListComponent>;

const ITEMS: GwDescriptionItem[] = [
  { label: 'MRN', value: 'MR-1001' },
  { label: 'Full name', value: 'Riya Verma' },
  { label: 'Date of birth', value: '1990-04-12', hint: '34 years' },
  { label: 'Sex', value: 'Female' },
  { label: 'Blood group', value: 'O+' },
  { label: 'Phone', value: '+91 99999 99999' },
  { label: 'Email', value: 'riya.verma@example.com' },
  { label: 'Insurance', value: 'Star Health · Family Floater' },
];

export const Inline: Story = {
  args: { items: ITEMS, layout: 'inline', bordered: true },
  render: (args) => ({
    props: args,
    template: `<div style="max-width:560px;"><gw-description-list [items]="items" [layout]="layout" [bordered]="bordered" /></div>`,
  }),
};

export const Grid: Story = {
  args: { items: ITEMS, layout: 'grid', columns: 2 },
  render: (args) => ({
    props: args,
    template: `<div style="max-width:560px;"><gw-description-list [items]="items" [layout]="layout" [columns]="columns" /></div>`,
  }),
};

export const Stacked: Story = {
  args: { items: ITEMS.slice(0, 4), layout: 'stacked' },
  render: (args) => ({
    props: args,
    template: `<div style="max-width:320px;"><gw-description-list [items]="items" [layout]="layout" /></div>`,
  }),
};

export const Empty: Story = {
  render: () => ({
    props: { items: [
      { label: 'Allergies', value: null },
      { label: 'Surgical history', value: '' },
      { label: 'Family history', value: 'Diabetes (paternal)' },
    ]},
    template: `<div style="max-width:480px;"><gw-description-list [items]="items" layout="inline" [bordered]="true" /></div>`,
  }),
};
