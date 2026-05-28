import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { GwSuggestionChipsComponent } from './suggestion-chips.component';

const meta: Meta<GwSuggestionChipsComponent> = {
  title: 'AI/Suggestion Chips',
  component: GwSuggestionChipsComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [GwSuggestionChipsComponent] })],
};
export default meta;
type Story = StoryObj<GwSuggestionChipsComponent>;

export const Default: Story = {
  args: {
    items: [
      { label: 'Summarise admission', icon: 'file-text' },
      { label: 'Draft discharge note', icon: 'edit' },
      { label: 'Compute drug dose',    icon: 'pill' },
      { label: 'Find similar cases',    icon: 'search' },
    ],
  },
};
