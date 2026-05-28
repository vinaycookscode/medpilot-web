import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { GwStatCardComponent } from './stat-card.component';

const meta: Meta<GwStatCardComponent> = {
  title: 'Data/Stat Card',
  component: GwStatCardComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [GwStatCardComponent] })],
};
export default meta;
type Story = StoryObj<GwStatCardComponent>;

export const Single: Story = {
  args: { label: 'Admissions today', value: 42, delta: 12, trendLabel: 'vs yesterday' },
};

export const Grid: Story = {
  render: () => ({
    template: `
      <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:12px;">
        <gw-stat-card label="Admissions today" [value]="42" [delta]="12" trendLabel="vs yesterday"></gw-stat-card>
        <gw-stat-card label="OPD visits" [value]="186" [delta]="-4" trendLabel="vs yesterday"></gw-stat-card>
        <gw-stat-card label="ICU beds free" [value]="3" [delta]="0" trendLabel="capacity stable"></gw-stat-card>
        <gw-stat-card label="Avg. wait time" value="14m" [delta]="-22" [reverseGood]="true" trendLabel="vs last week"></gw-stat-card>
      </div>`,
  }),
};

export const Loading: Story = {
  args: { label: 'Revenue', value: 0, loading: true },
};
