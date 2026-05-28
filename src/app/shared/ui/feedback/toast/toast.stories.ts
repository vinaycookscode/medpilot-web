import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata, applicationConfig } from '@storybook/angular';
import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { GwToastOutletComponent } from './toast-outlet.component';
import { GwToastService, GwToastPosition } from './toast.service';
import { GwButtonComponent } from '../../buttons/button/button.component';

@Component({
  selector: 'demo-toast-host',
  standalone: true,
  imports: [GwToastOutletComponent, GwButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <gw-toast-outlet />
    <div style="display:flex; gap:8px; flex-wrap:wrap; padding:24px;">
      <gw-button (click)="info()">Info</gw-button>
      <gw-button variant="secondary" (click)="success()">Success</gw-button>
      <gw-button variant="secondary" (click)="warn()">Warning</gw-button>
      <gw-button variant="danger" (click)="error()">Error</gw-button>
      <gw-button variant="subtle" (click)="withAction()">With action</gw-button>
    </div>
    <div style="display:flex; gap:8px; flex-wrap:wrap; padding:0 24px 24px;">
      <gw-button variant="ghost" size="sm" (click)="setPos('top-right')">top-right</gw-button>
      <gw-button variant="ghost" size="sm" (click)="setPos('top-center')">top-center</gw-button>
      <gw-button variant="ghost" size="sm" (click)="setPos('top-left')">top-left</gw-button>
      <gw-button variant="ghost" size="sm" (click)="setPos('bottom-right')">bottom-right</gw-button>
      <gw-button variant="ghost" size="sm" (click)="setPos('bottom-center')">bottom-center</gw-button>
      <gw-button variant="ghost" size="sm" (click)="setPos('bottom-left')">bottom-left</gw-button>
    </div>
  `,
})
class DemoToastHostComponent {
  private toast = inject(GwToastService);
  info()    { this.toast.info('Saved as draft', { description: "We'll keep this in your queue." }); }
  success() { this.toast.success('Patient discharged', { description: 'Summary emailed to next of kin.' }); }
  warn()    { this.toast.warning('Bed capacity at 85%'); }
  error()   { this.toast.error('Could not save', { description: 'Network error — retry in a moment.' }); }
  withAction() {
    this.toast.info('Undo discharge?', {
      duration: 0,
      action: { label: 'Undo', onClick: () => this.toast.success('Discharge reverted') },
    });
  }
  setPos(p: GwToastPosition) { this.toast.position.set(p); }
}

const meta: Meta<DemoToastHostComponent> = {
  title: 'Feedback/Toast',
  component: DemoToastHostComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({ imports: [DemoToastHostComponent] }),
    applicationConfig({ providers: [GwToastService] }),
  ],
};
export default meta;
type Story = StoryObj<DemoToastHostComponent>;

export const Playground: Story = {
  render: () => ({ template: `<demo-toast-host />` }),
};
