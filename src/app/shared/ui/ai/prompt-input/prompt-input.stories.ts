import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { GwPromptInputComponent } from './prompt-input.component';

const meta: Meta<GwPromptInputComponent> = {
  title: 'AI/Prompt Input',
  component: GwPromptInputComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [GwPromptInputComponent] })],
};
export default meta;
type Story = StoryObj<GwPromptInputComponent>;

export const Default: Story = {
  render: () => ({
    template: `<div style="max-width:640px;"><gw-prompt-input placeholder="Summarise this admission for handover…" /></div>`,
  }),
};

export const Busy: Story = {
  render: () => ({
    template: `<div style="max-width:640px;"><gw-prompt-input [busy]="true" /></div>`,
  }),
};
