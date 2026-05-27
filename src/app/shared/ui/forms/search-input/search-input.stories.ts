import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GwSearchInputComponent } from './search-input.component';

const meta: Meta<GwSearchInputComponent> = {
  title: 'Forms/Search Input',
  component: GwSearchInputComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({ imports: [FormsModule, ReactiveFormsModule, GwSearchInputComponent] }),
  ],
};
export default meta;
type Story = StoryObj<GwSearchInputComponent>;

export const Basic: Story = {
  args: { placeholder: 'Search patients…' },
};

export const Debounced: Story = {
  render: () => ({
    props: { lastEmit: '' },
    template: `
      <div style="display:flex; flex-direction:column; gap:12px; width:360px;">
        <gw-search-input placeholder="Type to search…" [debounceMs]="300"
                         (debouncedChange)="lastEmit = $event" />
        <p style="margin:0;font-size:12px;color:#6c6c70;">Debounced value: <strong>{{ lastEmit }}</strong></p>
      </div>`,
  }),
};
