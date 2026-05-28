import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { signal } from '@angular/core';
import { GwTabsComponent } from './tabs.component';
import { GwTabComponent } from './tab.component';

const meta: Meta<GwTabsComponent> = {
  title: 'Navigation/Tabs',
  component: GwTabsComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [GwTabsComponent, GwTabComponent] })],
  argTypes: {
    variant: { control: 'inline-radio', options: ['line', 'pill', 'segmented'] },
    size: { control: 'inline-radio', options: ['sm', 'md'] },
  },
};
export default meta;
type Story = StoryObj<GwTabsComponent>;

export const Line: Story = {
  render: () => ({
    props: { active: signal('admissions') },
    template: `
      <div style="max-width:680px;">
        <gw-tabs [activeKey]="active()" (activeKeyChange)="active.set($event)" variant="line">
          <gw-tab key="admissions" label="Admissions" [badge]="42">
            <p style="margin:0;">42 patients currently admitted across ICU and General wards.</p>
          </gw-tab>
          <gw-tab key="opd" label="OPD" [badge]="186">
            <p style="margin:0;">186 OPD visits today. Cardio and Ortho seeing the most volume.</p>
          </gw-tab>
          <gw-tab key="discharged" label="Discharged">
            <p style="margin:0;">5 patients discharged this morning.</p>
          </gw-tab>
          <gw-tab key="locked" label="Archived" [disabled]="true">
            <p>Hidden — disabled tab.</p>
          </gw-tab>
        </gw-tabs>
      </div>`,
  }),
};

export const Pill: Story = {
  render: () => ({
    props: { active: signal('today') },
    template: `
      <gw-tabs [activeKey]="active()" (activeKeyChange)="active.set($event)" variant="pill">
        <gw-tab key="today"     label="Today"></gw-tab>
        <gw-tab key="week"      label="This week"></gw-tab>
        <gw-tab key="month"     label="This month"></gw-tab>
        <gw-tab key="quarter"   label="Quarter"></gw-tab>
      </gw-tabs>`,
  }),
};

export const Segmented: Story = {
  render: () => ({
    props: { active: signal('list') },
    template: `
      <gw-tabs [activeKey]="active()" (activeKeyChange)="active.set($event)" variant="segmented">
        <gw-tab key="list"  label="List"  icon="list"></gw-tab>
        <gw-tab key="grid"  label="Grid"  icon="grid-2x2"></gw-tab>
        <gw-tab key="board" label="Board" icon="kanban"></gw-tab>
      </gw-tabs>`,
  }),
};
