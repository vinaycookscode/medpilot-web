import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { GwTimelineComponent } from './timeline.component';
import { GwTimelineItemComponent } from './timeline-item.component';

const meta: Meta<GwTimelineComponent> = {
  title: 'Data/Timeline',
  component: GwTimelineComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [GwTimelineComponent, GwTimelineItemComponent] })],
};
export default meta;
type Story = StoryObj<GwTimelineComponent>;

export const Default: Story = {
  render: () => ({
    template: `
      <div style="max-width:480px;">
        <gw-timeline>
          <gw-timeline-item title="Patient admitted" time="08:14 AM" tone="primary" icon="hospital">
            Bed allocated in ICU-3 by Dr. Sharma.
          </gw-timeline-item>
          <gw-timeline-item title="Vitals recorded" time="09:02 AM" tone="success" icon="activity">
            BP 132/85, HR 78 bpm, SpO₂ 97%.
          </gw-timeline-item>
          <gw-timeline-item title="Labs ordered" time="10:20 AM" icon="flask-conical">
            CBC, RFT, Troponin-I (urgent).
          </gw-timeline-item>
          <gw-timeline-item title="Critical lab value" time="11:48 AM" tone="danger" icon="triangle-alert">
            Troponin-I elevated. Cardiology notified.
          </gw-timeline-item>
          <gw-timeline-item title="Cardiology consult" time="12:35 PM" tone="warning">
            Dr. Iyer reviewing. ECG ordered.
          </gw-timeline-item>
        </gw-timeline>
      </div>`,
  }),
};
