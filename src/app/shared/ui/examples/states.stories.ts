import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { GwEmptyStateComponent } from '../display/empty-state/empty-state.component';
import { GwButtonComponent } from '../buttons/button/button.component';
import { GwSkeletonComponent } from '../display/skeleton/skeleton.component';
import { GwCardComponent } from '../display/card/card.component';
import { GwSpinnerComponent } from '../display/spinner/spinner.component';

@Component({
  selector: 'demo-state-page',
  standalone: true,
  imports: [GwEmptyStateComponent, GwButtonComponent, GwSkeletonComponent, GwCardComponent, GwSpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content></ng-content>`,
})
class StatePage {}

const meta: Meta = {
  title: 'Examples/States',
  parameters: { layout: 'fullscreen' },
  decorators: [moduleMetadata({ imports: [StatePage, GwEmptyStateComponent, GwButtonComponent, GwSkeletonComponent, GwCardComponent, GwSpinnerComponent] })],
};
export default meta;
type Story = StoryObj;

const wrap = (inner: string) => `
  <div style="background: var(--surface-page); min-height: 100vh; font-family: var(--font-family); display: flex; align-items: center; justify-content: center; padding: 32px;">
    ${inner}
  </div>`;

export const NotFound: Story = {
  render: () => ({
    template: wrap(`
      <div style="text-align: center; max-width: 460px;">
        <div style="font-size: 96px; font-weight: 700; letter-spacing: -0.04em; line-height: 1; color: var(--text-primary); background: linear-gradient(180deg, #09090B 0%, rgba(9,9,11,0.4) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">404</div>
        <h1 style="margin: 16px 0 6px; font-size: 24px; font-weight: 600; letter-spacing: -0.02em;">Page not found</h1>
        <p style="margin: 0; font-size: 14px; color: var(--text-secondary); line-height: 1.55;">
          The page you're looking for doesn't exist, or it's been moved.
          Try one of the links below.
        </p>
        <div style="display: flex; gap: 8px; justify-content: center; margin-top: 24px;">
          <gw-button variant="ghost">Go back</gw-button>
          <gw-button variant="primary">Open dashboard →</gw-button>
        </div>
      </div>
    `),
  }),
};

export const Empty: Story = {
  render: () => ({
    template: wrap(`
      <gw-card style="width: 100%; max-width: 720px;" elevation="flat">
        <gw-empty-state
          icon="inbox"
          title="No admissions yet today"
          description="When new patients are admitted, they'll appear here. Check the admissions queue in the meantime.">
          <gw-button variant="ghost">Open queue</gw-button>
          <gw-button variant="primary">Admit a patient</gw-button>
        </gw-empty-state>
      </gw-card>
    `),
  }),
};

export const Loading: Story = {
  render: () => ({
    template: wrap(`
      <gw-card style="width: 100%; max-width: 720px;">
        <div gw-card-header style="display:flex; align-items:center; gap:8px;">
          <gw-spinner size="sm" />
          <span style="font-size:13px; color:var(--text-secondary);">Loading admissions…</span>
        </div>
        <div style="display:flex; flex-direction:column; gap:14px;">
          ${[1,2,3,4].map(() => `
            <div style="display:flex; gap:12px; align-items:center;">
              <gw-skeleton shape="avatar"></gw-skeleton>
              <div style="flex:1; display:flex; flex-direction:column; gap:6px;">
                <gw-skeleton style="width:46%; height:10px;"></gw-skeleton>
                <gw-skeleton style="width:64%; height:8px;"></gw-skeleton>
              </div>
              <gw-skeleton style="width:72px; height:18px;"></gw-skeleton>
            </div>
          `).join('')}
        </div>
      </gw-card>
    `),
  }),
};

export const Errored: Story = {
  render: () => ({
    template: wrap(`
      <gw-card style="width: 100%; max-width: 520px;" elevation="sm">
        <gw-empty-state
          icon="server-crash"
          title="Could not reach the server"
          description="We tried 3 times but couldn't connect. Check your network or try again in a minute.">
          <gw-button variant="ghost">Report issue</gw-button>
          <gw-button variant="primary">Retry</gw-button>
        </gw-empty-state>
      </gw-card>
    `),
  }),
};
