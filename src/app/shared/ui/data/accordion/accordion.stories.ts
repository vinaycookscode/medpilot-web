import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { GwAccordionComponent } from './accordion.component';
import { GwAccordionItemComponent } from './accordion-item.component';

const meta: Meta<GwAccordionComponent> = {
  title: 'Data/Accordion',
  component: GwAccordionComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [GwAccordionComponent, GwAccordionItemComponent] })],
};
export default meta;
type Story = StoryObj<GwAccordionComponent>;

export const Single: Story = {
  render: () => ({
    template: `
      <div style="max-width:560px;">
        <gw-accordion>
          <gw-accordion-item title="Demographics" description="Name, DOB, contact" [open]="true">
            <p style="margin:0;">Riya Verma · DOB 1990-04-12 · +91 99999 99999</p>
          </gw-accordion-item>
          <gw-accordion-item title="Allergies" description="3 recorded">
            <p style="margin:0;">Penicillin, Sulfa drugs, Latex</p>
          </gw-accordion-item>
          <gw-accordion-item title="Insurance" description="Star Health · policy active">
            <p style="margin:0;">Policy expires 2026-12-31. Coverage ₹5,00,000.</p>
          </gw-accordion-item>
        </gw-accordion>
      </div>`,
  }),
};

export const Multi: Story = {
  render: () => ({
    template: `
      <div style="max-width:560px;">
        <gw-accordion [multi]="true">
          <gw-accordion-item title="Tab 1" [open]="true"><p>Two can be open at once.</p></gw-accordion-item>
          <gw-accordion-item title="Tab 2" [open]="true"><p>Like this.</p></gw-accordion-item>
          <gw-accordion-item title="Tab 3"><p>And expand independently.</p></gw-accordion-item>
        </gw-accordion>
      </div>`,
  }),
};

export const Separated: Story = {
  render: () => ({
    template: `
      <div style="max-width:560px;">
        <gw-accordion [separated]="true">
          <gw-accordion-item title="Card 1" description="Each item is its own card">
            <p style="margin:0;">Visually distinct sections.</p>
          </gw-accordion-item>
          <gw-accordion-item title="Card 2">
            <p style="margin:0;">No shared borders.</p>
          </gw-accordion-item>
        </gw-accordion>
      </div>`,
  }),
};
