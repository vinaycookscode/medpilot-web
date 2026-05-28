import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { GwStepperComponent, GwStep } from './stepper.component';

const meta: Meta<GwStepperComponent> = {
  title: 'Navigation/Stepper',
  component: GwStepperComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [GwStepperComponent] })],
  argTypes: {
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
  },
};
export default meta;
type Story = StoryObj<GwStepperComponent>;

const ADMIT_STEPS: GwStep[] = [
  { label: 'Patient', description: 'Identity + demographics' },
  { label: 'Insurance', description: 'Policy + pre-auth' },
  { label: 'Ward', description: 'Bed assignment' },
  { label: 'Confirm', description: 'Review + admit' },
];

export const Horizontal: Story = {
  args: { steps: ADMIT_STEPS, active: 1, orientation: 'horizontal' },
};

export const Vertical: Story = {
  args: { steps: ADMIT_STEPS, active: 2, orientation: 'vertical' },
  render: (args) => ({
    props: args,
    template: `<div style="max-width:320px;"><gw-stepper [steps]="steps" [active]="active" [orientation]="orientation" /></div>`,
  }),
};

export const WithError: Story = {
  args: {
    orientation: 'horizontal',
    active: 2,
    steps: [
      { label: 'Patient' },
      { label: 'Insurance', status: 'error', description: 'Pre-auth failed' },
      { label: 'Ward' },
      { label: 'Confirm' },
    ] as GwStep[],
  },
};
