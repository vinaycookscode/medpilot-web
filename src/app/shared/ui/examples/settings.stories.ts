import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GwTabsComponent } from '../navigation/tabs/tabs.component';
import { GwTabComponent } from '../navigation/tabs/tab.component';
import { GwFormSectionComponent } from '../forms/form-section/form-section.component';
import { GwFormFieldComponent } from '../forms/form-field/form-field.component';
import { GwInputComponent } from '../forms/input/input.component';
import { GwSelectComponent } from '../forms/select/select.component';
import { GwToggleComponent } from '../forms/toggle/toggle.component';
import { GwTextareaComponent } from '../forms/textarea/textarea.component';
import { GwButtonComponent } from '../buttons/button/button.component';
import { GwBreadcrumbsComponent } from '../navigation/breadcrumbs/breadcrumbs.component';
import { GwFormActionsComponent } from '../forms/form-actions/form-actions.component';

@Component({
  selector: 'demo-settings',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    GwTabsComponent, GwTabComponent,
    GwFormSectionComponent, GwFormFieldComponent, GwInputComponent,
    GwSelectComponent, GwToggleComponent, GwTextareaComponent,
    GwButtonComponent, GwBreadcrumbsComponent, GwFormActionsComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="settings">
      <div class="settings__container">
        <gw-breadcrumbs [items]="[{label: 'Workspace', link:'/'}, {label: 'Settings'}]" />
        <h1 class="settings__title">Settings</h1>
        <p class="settings__sub">Manage your workspace, clinical defaults, and integrations.</p>

        <gw-tabs activeKey="profile" variant="line" style="margin-top: 16px;">
          <gw-tab key="profile"  label="Profile">
            <form [formGroup]="profile" style="max-width: 640px; margin-top: 8px;">
              <gw-form-section title="Personal details" description="Visible to your team across handovers and audit logs.">
                <gw-form-field label="Display name" [required]="true">
                  <gw-input formControlName="name" />
                </gw-form-field>
                <gw-form-field label="Title">
                  <gw-input formControlName="title" placeholder="e.g. RMO, Cardiology" />
                </gw-form-field>
                <gw-form-field label="Bio" hint="Optional — shown on your provider profile.">
                  <gw-textarea formControlName="bio" [rows]="3" />
                </gw-form-field>
              </gw-form-section>

              <gw-form-section title="Locale" description="Affects date, time, and currency formatting.">
                <gw-form-field label="Timezone" [required]="true">
                  <gw-select [options]="timezones" formControlName="timezone" />
                </gw-form-field>
                <gw-form-field label="Language">
                  <gw-select [options]="languages" formControlName="language" />
                </gw-form-field>
              </gw-form-section>

              <gw-form-section title="Notifications" description="Choose how we reach you about clinical events.">
                <gw-form-field label="Critical lab results" [inline]="true">
                  <gw-toggle formControlName="notifyCritical" />
                </gw-form-field>
                <gw-form-field label="Pending handovers" [inline]="true">
                  <gw-toggle formControlName="notifyHandover" />
                </gw-form-field>
                <gw-form-field label="Daily summary email" [inline]="true">
                  <gw-toggle formControlName="notifyDigest" />
                </gw-form-field>
              </gw-form-section>

              <gw-form-actions align="right">
                <gw-button variant="ghost">Discard</gw-button>
                <gw-button variant="primary">Save changes</gw-button>
              </gw-form-actions>
            </form>
          </gw-tab>

          <gw-tab key="security"     label="Security"></gw-tab>
          <gw-tab key="integrations" label="Integrations"></gw-tab>
          <gw-tab key="billing"      label="Billing"></gw-tab>
          <gw-tab key="api"          label="API keys"></gw-tab>
        </gw-tabs>
      </div>
    </div>
  `,
  styles: [`
    .settings { background: var(--surface-page); min-height: 100vh; padding: 32px 48px; font-family: var(--font-family); }
    .settings__container { max-width: 1040px; margin: 0 auto; }
    .settings__title { margin: 12px 0 4px; font-size: 26px; font-weight: 600; letter-spacing: -0.025em; }
    .settings__sub   { margin: 0; font-size: 13px; color: var(--text-secondary); }
  `],
})
class DemoSettingsComponent {
  private fb = inject(FormBuilder);
  timezones = [
    { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)' },
    { value: 'America/New_York', label: 'America/New_York (EST/EDT)' },
    { value: 'Europe/London', label: 'Europe/London (GMT/BST)' },
  ];
  languages = [
    { value: 'en', label: 'English' },
    { value: 'hi', label: 'हिन्दी' },
    { value: 'mr', label: 'मराठी' },
  ];
  profile: FormGroup = this.fb.group({
    name: ['Anjali Sharma', Validators.required],
    title: ['RMO, Cardiology'],
    bio: [''],
    timezone: ['Asia/Kolkata', Validators.required],
    language: ['en'],
    notifyCritical: [true],
    notifyHandover: [true],
    notifyDigest: [false],
  });
}

const meta: Meta = {
  title: 'Examples/Settings',
  component: DemoSettingsComponent,
  parameters: { layout: 'fullscreen' },
  decorators: [moduleMetadata({ imports: [DemoSettingsComponent] })],
};
export default meta;
type Story = StoryObj<DemoSettingsComponent>;

export const Default: Story = { render: () => ({ template: `<demo-settings />` }) };
