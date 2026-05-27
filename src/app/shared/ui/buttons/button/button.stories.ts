import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { GwButtonComponent } from './button.component';

const meta: Meta<GwButtonComponent> = {
  title: 'Buttons/Button',
  component: GwButtonComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [GwButtonComponent] })],
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'ghost', 'danger', 'subtle'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
};
export default meta;
type Story = StoryObj<GwButtonComponent>;

export const Primary: Story = {
  render: (args) => ({ props: args, template: `<gw-button [variant]="variant" [size]="size" [loading]="loading">Save changes</gw-button>` }),
  args: { variant: 'primary', size: 'md', loading: false },
};

export const Variants: Story = {
  render: () => ({
    template: `
      <div style="display:flex; gap:8px; flex-wrap: wrap;">
        <gw-button variant="primary">Primary</gw-button>
        <gw-button variant="secondary">Secondary</gw-button>
        <gw-button variant="subtle">Subtle</gw-button>
        <gw-button variant="ghost">Ghost</gw-button>
        <gw-button variant="danger">Delete</gw-button>
      </div>`,
  }),
};

export const Sizes: Story = {
  render: () => ({
    template: `
      <div style="display:flex; gap:8px; align-items:center;">
        <gw-button size="sm">Small</gw-button>
        <gw-button size="md">Medium</gw-button>
        <gw-button size="lg">Large</gw-button>
      </div>`,
  }),
};

export const Loading: Story = {
  args: { variant: 'primary', loading: true },
  render: (args) => ({ props: args, template: `<gw-button [variant]="variant" [loading]="loading">Submitting…</gw-button>` }),
};

export const Block: Story = {
  render: () => ({
    template: `<div style="width:320px;"><gw-button variant="primary" [block]="true">Sign in</gw-button></div>`,
  }),
};
