import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { GwActivityFeedComponent } from './activity-feed.component';

const meta: Meta<GwActivityFeedComponent> = {
  title: 'Data/Activity Feed',
  component: GwActivityFeedComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [GwActivityFeedComponent] })],
};
export default meta;
type Story = StoryObj<GwActivityFeedComponent>;

export const Default: Story = {
  args: {
    items: [
      { id: 1, actor: 'Dr. Sharma',  action: 'discharged',           target: 'Riya Verma',    time: '5m ago' },
      { id: 2, actor: 'Anjali Nurse', action: 'recorded vitals for', target: 'Karan Mehta',   time: '12m ago', detail: 'BP 138/92, HR 84' },
      { id: 3, actor: 'Lab',          action: 'flagged critical result for', target: 'Vivaan Kapoor', time: '20m ago', detail: 'Troponin-I elevated' },
      { id: 4, actor: 'Dr. Iyer',    action: 'admitted',             target: 'Asha Pillai',   time: '1h ago' },
    ],
  },
  render: (args) => ({
    props: args,
    template: `<div style="max-width:520px;"><gw-activity-feed [items]="items" /></div>`,
  }),
};
