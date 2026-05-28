import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { GwEmptyStateComponent } from './empty-state.component';
import { GwButtonComponent } from '../../buttons/button/button.component';

const meta: Meta<GwEmptyStateComponent> = {
  title: 'Display/Empty State',
  component: GwEmptyStateComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [GwEmptyStateComponent, GwButtonComponent] })],
};
export default meta;
type Story = StoryObj<GwEmptyStateComponent>;

export const Default: Story = {
  args: {
    icon: 'inbox',
    title: 'No admissions yet',
    description: "When new patients are admitted they'll appear here.",
    size: 'md',
  },
  render: (args) => ({
    props: args,
    template: `
      <gw-empty-state [icon]="icon" [title]="title" [description]="description" [size]="size">
        <gw-button variant="primary">Admit a patient</gw-button>
      </gw-empty-state>`,
  }),
};

export const Errored: Story = {
  render: () => ({
    template: `
      <gw-empty-state icon="server-crash"
                      title="Couldn't load the dashboard"
                      description="There was a network error. Please try again.">
        <gw-button variant="ghost">Go back</gw-button>
        <gw-button variant="primary">Retry</gw-button>
      </gw-empty-state>`,
  }),
};
