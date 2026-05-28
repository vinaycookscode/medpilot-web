import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { GwMessageBubbleComponent } from './message-bubble.component';

const meta: Meta<GwMessageBubbleComponent> = {
  title: 'AI/Message Bubble',
  component: GwMessageBubbleComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [GwMessageBubbleComponent] })],
  argTypes: {
    role: { control: 'inline-radio', options: ['user', 'assistant', 'system'] },
  },
};
export default meta;
type Story = StoryObj<GwMessageBubbleComponent>;

export const Conversation: Story = {
  render: () => ({
    template: `
      <div style="max-width:560px; display:flex; flex-direction:column; gap:8px;">
        <gw-message-bubble role="user" author="You" time="just now">
          Summarise the last 6 hours for Riya Verma in ICU-3.
        </gw-message-bubble>
        <gw-message-bubble role="assistant" author="Co-pilot" time="just now">
          Riya's vitals have been trending stable since 04:00. BP 132/85, HR 78 bpm,
          SpO₂ 97%. One critical lab result at 11:48 — Troponin-I elevated, cardiology
          notified. No further events overnight.
        </gw-message-bubble>
        <gw-message-bubble role="assistant" [streaming]="true" />
        <gw-message-bubble role="system">Connection re-established.</gw-message-bubble>
      </div>`,
  }),
};
