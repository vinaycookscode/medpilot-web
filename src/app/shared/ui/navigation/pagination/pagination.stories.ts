import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { signal } from '@angular/core';
import { GwPaginationComponent } from './pagination.component';

const meta: Meta<GwPaginationComponent> = {
  title: 'Navigation/Pagination',
  component: GwPaginationComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [GwPaginationComponent] })],
  argTypes: {
    size: { control: 'inline-radio', options: ['comfortable', 'compact'] },
  },
};
export default meta;
type Story = StoryObj<GwPaginationComponent>;

export const Default: Story = {
  render: () => ({
    props: { page: signal(1), pageSize: signal(20) },
    template: `
      <gw-pagination [total]="248" [page]="page()" [pageSize]="pageSize()"
                     (pageChange)="page.set($event)"
                     (pageSizeChange)="pageSize.set($event)" />`,
  }),
};

export const Compact: Story = {
  render: () => ({
    props: { page: signal(7), pageSize: signal(10) },
    template: `
      <gw-pagination size="compact" [showTotal]="false" [total]="248" [page]="page()" [pageSize]="pageSize()"
                     (pageChange)="page.set($event)" />`,
  }),
};

export const ManyPages: Story = {
  render: () => ({
    props: { page: signal(34) },
    template: `
      <gw-pagination [total]="2000" [page]="page()" [pageSize]="20"
                     (pageChange)="page.set($event)" />`,
  }),
};
