import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { GwInputComponent } from '../forms/input/input.component';
import { GwPasswordInputComponent } from '../forms/password-input/password-input.component';
import { GwFormFieldComponent } from '../forms/form-field/form-field.component';
import { GwButtonComponent } from '../buttons/button/button.component';
import { GwCheckboxComponent } from '../forms/checkbox/checkbox.component';
import { GwAlertComponent } from '../feedback/alert/alert.component';

@Component({
  selector: 'demo-sign-in',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    GwInputComponent, GwPasswordInputComponent, GwFormFieldComponent,
    GwButtonComponent, GwCheckboxComponent, GwAlertComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ex">
      <aside class="ex__hero">
        <div class="ex__hero-card">
          <div class="ex__hero-glyph">
            <svg viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="#fff" stroke-width="1.6"><circle cx="16" cy="16" r="14"/><path d="M10 16h12M16 10v12"/></svg>
          </div>
          <h2>Run the floor, not the spreadsheet.</h2>
          <p>GotWell turns shift handover, charge capture, and audit trails into a single sober pane of glass.</p>
          <div class="ex__hero-stats">
            <div><strong>42</strong><span>admissions today</span></div>
            <div><strong>97.2%</strong><span>chart compliance</span></div>
            <div><strong>14m</strong><span>avg. discharge</span></div>
          </div>
        </div>
      </aside>

      <main class="ex__form">
        <div class="ex__brand">GotWell</div>
        <h1 class="ex__title">Welcome back</h1>
        <p class="ex__sub">Sign in to your workspace to continue.</p>

        <form [formGroup]="form" class="ex__fields" (ngSubmit)="submit()">
          <gw-form-field label="Email address" [required]="true">
            <gw-input formControlName="email" type="email" autocomplete="email" placeholder="you@clinic.com" />
          </gw-form-field>
          <gw-form-field label="Password" [required]="true">
            <gw-password-input formControlName="password" autocomplete="current-password" />
          </gw-form-field>

          <div class="ex__row">
            <gw-checkbox formControlName="remember" label="Keep me signed in" />
            <a class="ex__link" href="#">Forgot password?</a>
          </div>

          <gw-button variant="primary" size="lg" [block]="true" type="submit" [disabled]="form.invalid">
            Sign in
          </gw-button>
          <gw-button variant="secondary" size="lg" [block]="true" type="button">
            Continue with SSO
          </gw-button>

          <p class="ex__foot">
            Don't have an account? <a class="ex__link" href="#">Request access</a>
          </p>
        </form>
      </main>
    </div>
  `,
  styles: [`
    .ex { display: grid; grid-template-columns: 1fr 1fr; min-height: 720px; background: var(--surface-page); font-family: var(--font-family); }
    .ex__hero { background: #09090B; color: #fff; display: flex; align-items: center; justify-content: center; padding: 48px; }
    .ex__hero-card { max-width: 380px; }
    .ex__hero-glyph { width: 48px; height: 48px; border-radius: 12px; background: rgba(37,99,235,0.18); border: 1px solid rgba(255,255,255,0.08); display: inline-flex; align-items: center; justify-content: center; margin-bottom: 32px; }
    .ex__hero h2 { font-size: 28px; font-weight: 600; letter-spacing: -0.025em; margin: 0 0 12px; line-height: 1.2; }
    .ex__hero p { font-size: 14px; color: rgba(255,255,255,0.6); margin: 0 0 32px; line-height: 1.6; }
    .ex__hero-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; padding-top: 32px; border-top: 1px solid rgba(255,255,255,0.08); }
    .ex__hero-stats > div { display: flex; flex-direction: column; }
    .ex__hero-stats strong { font-size: 22px; font-weight: 600; letter-spacing: -0.02em; }
    .ex__hero-stats span { font-size: 11px; color: rgba(255,255,255,0.5); margin-top: 2px; }

    .ex__form { display: flex; flex-direction: column; justify-content: center; padding: 48px; max-width: 440px; margin: 0 auto; width: 100%; }
    .ex__brand { font-weight: 600; font-size: 15px; letter-spacing: -0.01em; color: var(--text-primary); margin-bottom: 32px; }
    .ex__title { font-size: 28px; font-weight: 600; letter-spacing: -0.025em; margin: 0; color: var(--text-primary); }
    .ex__sub { font-size: 14px; color: var(--text-secondary); margin: 4px 0 32px; }
    .ex__fields { display: flex; flex-direction: column; gap: 14px; }
    .ex__row { display: flex; align-items: center; justify-content: space-between; margin: 4px 0; }
    .ex__link { color: var(--color-primary); text-decoration: none; font-size: 13px; font-weight: 500; }
    .ex__link:hover { text-decoration: underline; }
    .ex__foot { text-align: center; font-size: 13px; color: var(--text-secondary); margin-top: 8px; }

    @media (max-width: 880px) {
      .ex { grid-template-columns: 1fr; min-height: auto; }
      .ex__hero { display: none; }
    }
  `],
})
class DemoSignInComponent {
  private fb = inject(FormBuilder);
  form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    remember: [true],
  });
  submit() { /* demo */ }
}

const meta: Meta = {
  title: 'Examples/Sign In',
  component: DemoSignInComponent,
  parameters: { layout: 'fullscreen' },
  decorators: [moduleMetadata({ imports: [DemoSignInComponent] })],
};
export default meta;
type Story = StoryObj<DemoSignInComponent>;

export const Default: Story = { render: () => ({ template: `<demo-sign-in />` }) };
