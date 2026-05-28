import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { GwChatPanelComponent } from './chat-panel.component';
import { GwPromptInputComponent } from '../prompt-input/prompt-input.component';
import { GwMessageBubbleComponent } from '../message-bubble/message-bubble.component';
import { GwSuggestionChipsComponent } from '../suggestion-chips/suggestion-chips.component';
import { GwIconButtonComponent } from '../../buttons/icon-button/icon-button.component';
import { GwAvatarComponent } from '../../display/avatar/avatar.component';

const meta: Meta<GwChatPanelComponent> = {
  title: 'AI/Chat Panel',
  component: GwChatPanelComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({
    imports: [
      GwChatPanelComponent, GwPromptInputComponent, GwMessageBubbleComponent,
      GwSuggestionChipsComponent, GwIconButtonComponent, GwAvatarComponent,
    ],
  })],
};
export default meta;
type Story = StoryObj<GwChatPanelComponent>;

export const Default: Story = {
  render: () => ({
    props: {
      chips: [
        { label: 'Summarise admission', icon: 'file-text' },
        { label: 'Draft discharge note',  icon: 'edit' },
        { label: 'Find similar cases',    icon: 'search' },
      ],
    },
    template: `
      <div style="max-width: 640px; height: 600px;">
        <gw-chat-panel>
          <div gw-chat-head style="display:flex; align-items:center; justify-content:space-between;">
            <div style="display:flex; align-items:center; gap:8px;">
              <div style="width:24px;height:24px;border-radius:6px;background:linear-gradient(135deg,#2563EB,#7C3AED); display:flex;align-items:center;justify-content:center;">
                <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="#fff" stroke-width="1.6"><path d="M8 1l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/></svg>
              </div>
              <strong style="font-size:14px;">Co-pilot</strong>
            </div>
            <gw-icon-button icon="more-vertical" ariaLabel="More" size="sm" />
          </div>

          <gw-message-bubble role="assistant" author="Co-pilot" time="just now">
            Hi Anjali. I've pulled the last 6 hours of vitals for Riya Verma in ICU-3.
            Anything specific you'd like to know?
          </gw-message-bubble>
          <gw-suggestion-chips [items]="chips" />
          <gw-message-bubble role="user" author="You" time="just now">
            Summarise overnight events and flag anything unusual.
          </gw-message-bubble>
          <gw-message-bubble role="assistant" author="Co-pilot" [streaming]="true" />

          <div gw-chat-foot>
            <gw-prompt-input placeholder="Ask Co-pilot a clinical question…" />
          </div>
        </gw-chat-panel>
      </div>`,
  }),
};
