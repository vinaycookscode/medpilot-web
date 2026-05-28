import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { GwKpiGridComponent } from './kpi-grid.component';

const meta: Meta<GwKpiGridComponent> = {
  title: 'Enterprise/KPI Grid',
  component: GwKpiGridComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [GwKpiGridComponent] })],
};
export default meta;
type Story = StoryObj<GwKpiGridComponent>;

export const Default: Story = {
  args: {
    items: [
      { label: 'Admissions today',  value: 42,   icon: 'bed',         delta: 12,  trendLabel: 'vs yesterday' },
      { label: 'OPD visits',        value: 186,  icon: 'stethoscope', delta: -4,  trendLabel: 'vs yesterday' },
      { label: 'ICU beds free',     value: 3,    icon: 'activity',    delta: 0,   trendLabel: 'capacity stable' },
      { label: 'Avg. wait time',    value: '14m', icon: 'timer',      delta: -22, reverseGood: true, trendLabel: 'vs last week' },
    ],
  },
};
