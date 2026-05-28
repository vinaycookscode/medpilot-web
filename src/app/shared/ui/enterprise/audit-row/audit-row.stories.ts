import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { GwAuditRowComponent, GwAuditEvent } from './audit-row.component';
import { GwCardComponent } from '../../display/card/card.component';

const meta: Meta<GwAuditRowComponent> = {
  title: 'Enterprise/Audit Row',
  component: GwAuditRowComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [GwAuditRowComponent, GwCardComponent] })],
};
export default meta;
type Story = StoryObj<GwAuditRowComponent>;

const EVENTS: GwAuditEvent[] = [
  { id: 1, actor: 'Anjali Sharma', action: 'updated role for', resource: 'karan@clinic.com',  ip: '10.0.4.12', time: '12:42 PM', status: 'success' },
  { id: 2, actor: 'system',        action: 'revoked session for', resource: 'asha@clinic.com',  ip: '10.0.4.55', time: '12:38 PM', status: 'warning', severity: 'warning' },
  { id: 3, actor: 'Dr. Sharma',    action: 'deleted patient record', resource: 'MR-1098',     ip: '10.0.4.21', time: '11:55 AM', status: 'danger',  severity: 'danger', detail: 'Reason: created in error' },
  { id: 4, actor: 'Riya Verma',    action: 'signed in',                                        ip: '203.0.113.5', time: '11:21 AM', status: 'success' },
];

export const Default: Story = {
  render: () => ({
    props: { events: EVENTS },
    template: `
      <gw-card padding="none" style="width:100%; max-width:760px;">
        @for (e of events; track e.id) {
          <gw-audit-row [event]="e" />
        }
      </gw-card>`,
  }),
};
