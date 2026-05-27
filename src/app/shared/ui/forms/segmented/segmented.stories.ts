import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { GwSegmentedComponent } from './segmented.component';

const meta: Meta<GwSegmentedComponent> = {
  title: 'Forms/Segmented',
  component: GwSegmentedComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [FormsModule, ReactiveFormsModule, GwSegmentedComponent] })],
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] } },
};
export default meta;
type Story = StoryObj<GwSegmentedComponent>;

const ADMIT = [
  { value: 'opd', label: 'OPD' },
  { value: 'ipd', label: 'IPD' },
  { value: 'er',  label: 'Emergency' },
];

export const Basic: Story = { args: { options: ADMIT, size: 'md' } };

export const WithSelection: Story = {
  render: () => ({
    props: { options: ADMIT, ctrl: new FormControl('ipd') },
    template: `
      <gw-segmented [options]="options" [formControl]="ctrl" />
      <p style="margin-top:12px;font-size:12px;color:#6c6c70;">Selected: <strong>{{ ctrl.value }}</strong></p>`,
  }),
};

export const Block: Story = {
  render: () => ({
    props: { options: ADMIT },
    template: `<div style="width:480px;"><gw-segmented [options]="options" [block]="true" /></div>`,
  }),
};
