import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { GwTableComponent, GwTableColumn } from './table.component';
import { GwCellDirective } from './cell.directive';
import { GwBadgeComponent } from '../../display/badge/badge.component';
import { GwAvatarComponent } from '../../display/avatar/avatar.component';
import { GwIconButtonComponent } from '../../buttons/icon-button/icon-button.component';

const meta: Meta<GwTableComponent> = {
  title: 'Data/Table',
  component: GwTableComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({
    imports: [
      GwTableComponent, GwCellDirective,
      GwBadgeComponent, GwAvatarComponent, GwIconButtonComponent,
    ],
  })],
  argTypes: {
    density: { control: 'inline-radio', options: ['compact', 'comfortable', 'spacious'] },
  },
};
export default meta;
type Story = StoryObj<GwTableComponent>;

const PATIENTS = [
  { id: 1, mrn: 'MR-1001', name: 'Riya Verma',    age: 34, ward: 'ICU',     status: 'admitted',  consultant: 'Dr. Sharma' },
  { id: 2, mrn: 'MR-1002', name: 'Karan Mehta',   age: 56, ward: 'General', status: 'observation', consultant: 'Dr. Iyer'   },
  { id: 3, mrn: 'MR-1003', name: 'Anjali Singh',  age: 22, ward: 'Maternity', status: 'discharged',  consultant: 'Dr. Rao'   },
  { id: 4, mrn: 'MR-1004', name: 'Vivaan Kapoor', age: 48, ward: 'ICU',     status: 'admitted',  consultant: 'Dr. Sharma' },
  { id: 5, mrn: 'MR-1005', name: 'Asha Pillai',   age: 71, ward: 'General', status: 'admitted',  consultant: 'Dr. Iyer'   },
];

const COLUMNS: GwTableColumn[] = [
  { key: 'mrn',        label: 'MRN',         width: '100px' },
  { key: 'name',       label: 'Patient',     sortable: true },
  { key: 'age',        label: 'Age',         sortable: true, align: 'right', width: '70px' },
  { key: 'ward',       label: 'Ward',        sortable: true },
  { key: 'status',     label: 'Status' },
  { key: 'consultant', label: 'Consultant' },
  { key: '__actions',  label: '',            width: '88px', align: 'right' },
];

export const Basic: Story = {
  render: () => ({
    props: { rows: PATIENTS, cols: COLUMNS },
    template: `
      <gw-table [data]="rows" [columns]="cols" trackBy="id" density="comfortable">
        <ng-template gwCell="name" let-row>
          <div style="display:flex; align-items:center; gap:8px;">
            <gw-avatar [name]="row.name" size="sm" />
            <span>{{ row.name }}</span>
          </div>
        </ng-template>

        <ng-template gwCell="status" let-row>
          <gw-badge [variant]="row.status === 'admitted' ? 'success' : row.status === 'observation' ? 'warning' : 'neutral'"
                    tone="soft" dot>
            {{ row.status }}
          </gw-badge>
        </ng-template>

        <ng-template gwCell="__actions" let-row>
          <div style="display:flex; gap:4px; justify-content:flex-end;">
            <gw-icon-button size="sm" icon="edit"  ariaLabel="Edit" />
            <gw-icon-button size="sm" icon="more-vertical" ariaLabel="More" />
          </div>
        </ng-template>
      </gw-table>`,
  }),
};

export const Loading: Story = {
  render: () => ({
    props: { cols: COLUMNS },
    template: `<gw-table [data]="[]" [columns]="cols" [loading]="true" [skeletonRows]="5" />`,
  }),
};

export const Empty: Story = {
  render: () => ({
    props: { cols: COLUMNS },
    template: `<gw-table [data]="[]" [columns]="cols" emptyText="No patients match your filters." />`,
  }),
};

export const Compact: Story = {
  render: () => ({
    props: { rows: PATIENTS, cols: COLUMNS.slice(0, 5) },
    template: `<gw-table [data]="rows" [columns]="cols" density="compact" />`,
  }),
};
