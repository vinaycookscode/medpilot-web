import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GwFileInputComponent } from './file-input.component';
import { GwFormFieldComponent } from '../form-field/form-field.component';

const meta: Meta<GwFileInputComponent> = {
  title: 'Forms/File Input',
  component: GwFileInputComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [FormsModule, ReactiveFormsModule, GwFileInputComponent, GwFormFieldComponent] })],
};
export default meta;
type Story = StoryObj<GwFileInputComponent>;

export const Single: Story = {
  render: () => ({
    template: `
      <div style="width:480px;">
        <gw-form-field label="Patient ID proof" hint="JPG, PNG or PDF — up to 5 MB.">
          <gw-file-input accept=".jpg,.png,.pdf" [maxMb]="5" />
        </gw-form-field>
      </div>`,
  }),
};

export const Multiple: Story = {
  render: () => ({
    template: `
      <div style="width:480px;">
        <gw-form-field label="Lab reports" hint="Upload up to 10 PDFs.">
          <gw-file-input [multiple]="true" accept=".pdf" [maxMb]="10" hint="Drop PDF reports here, or click to browse." />
        </gw-form-field>
      </div>`,
  }),
};
