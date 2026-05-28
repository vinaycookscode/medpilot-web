import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { GwSkeletonComponent } from './skeleton.component';
import { GwCardComponent } from '../card/card.component';

const meta: Meta<GwSkeletonComponent> = {
  title: 'Display/Skeleton',
  component: GwSkeletonComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [GwSkeletonComponent, GwCardComponent] })],
};
export default meta;
type Story = StoryObj<GwSkeletonComponent>;

export const Shapes: Story = {
  render: () => ({
    template: `
      <div style="display:flex; gap:24px; align-items:flex-start;">
        <gw-skeleton style="width:160px; height:14px;"></gw-skeleton>
        <gw-skeleton shape="circle" style="width:36px; height:36px;"></gw-skeleton>
        <gw-skeleton shape="avatar"></gw-skeleton>
      </div>`,
  }),
};

export const CardSkeleton: Story = {
  render: () => ({
    template: `
      <gw-card style="max-width:340px;">
        <div style="display:flex; gap:12px; align-items:center;">
          <gw-skeleton shape="avatar"></gw-skeleton>
          <div style="flex:1; display:flex; flex-direction:column; gap:8px;">
            <gw-skeleton style="width:60%; height:12px;"></gw-skeleton>
            <gw-skeleton style="width:40%; height:10px;"></gw-skeleton>
          </div>
        </div>
        <div style="margin-top:16px; display:flex; flex-direction:column; gap:8px;">
          <gw-skeleton style="width:100%; height:10px;"></gw-skeleton>
          <gw-skeleton style="width:90%; height:10px;"></gw-skeleton>
          <gw-skeleton style="width:75%; height:10px;"></gw-skeleton>
        </div>
      </gw-card>`,
  }),
};
