import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GwInputComponent } from '../forms/input/input.component';
import { GwPasswordInputComponent } from '../forms/password-input/password-input.component';
import { GwPhoneInputComponent } from '../forms/phone-input/phone-input.component';
import { GwFormFieldComponent } from '../forms/form-field/form-field.component';
import { GwCheckboxComponent } from '../forms/checkbox/checkbox.component';
import { GwButtonComponent } from '../buttons/button/button.component';
import { GwStepperComponent } from '../navigation/stepper/stepper.component';

@Component({
  selector: 'demo-sign-up',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    GwInputComponent, GwPasswordInputComponent, GwPhoneInputComponent,
    GwFormFieldComponent, GwCheckboxComponent, GwButtonComponent, GwStepperComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ex">
      <div class="ex__card">
        <div class="ex__brand">GotWell</div>
        <h1>Create your workspace</h1>
        <p class="ex__sub">Set up your hospital's GotWell tenant in under 2 minutes.</p>

        <div style="margin: 24px 0 32px;">
          <gw-stepper [steps]="steps" [active]="1" />
        </div>

        <form [formGroup]="form" class="ex__fields">
          <div class="ex__row2">
            <gw-form-field label="First name" [required]="true">
              <gw-input formControlName="firstName" autocomplete="given-name" />
            </gw-form-field>
            <gw-form-field label="Last name" [required]="true">
              <gw-input formControlName="lastName" autocomplete="family-name" />
            </gw-form-field>
          </div>

          <gw-form-field label="Work email" [required]="true">
            <gw-input formControlName="email" type="email" autocomplete="email" placeholder="you@clinic.com" />
          </gw-form-field>

          <gw-form-field label="Mobile" [required]="true">
            <gw-phone-input formControlName="phone" />
          </gw-form-field>

          <gw-form-field label="Password" hint="At least 8 characters with mixed case + numbers." [required]="true">
            <gw-password-input formControlName="password" autocomplete="new-password" [showStrength]="true" />
          </gw-form-field>

          <gw-checkbox formControlName="terms" label="I agree to the Terms of Service and Privacy Policy" />

          <gw-button variant="primary" size="lg" [block]="true" type="submit" [disabled]="form.invalid">
            Continue
          </gw-button>

          <p class="ex__foot">Already have an account? <a class="ex__link" href="#">Sign in</a></p>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .ex { min-height: 100vh; padding: 48px 24px; background: var(--surface-page); display: flex; align-items: flex-start; justify-content: center; font-family: var(--font-family); }
    .ex__card { width: 100%; max-width: 480px; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); padding: 40px; }
    .ex__brand { font-weight: 600; font-size: 15px; letter-spacing: -0.01em; margin-bottom: 16px; }
    h1 { margin: 0; font-size: 24px; font-weight: 600; letter-spacing: -0.02em; }
    .ex__sub { margin: 6px 0 0; font-size: 13px; color: var(--text-secondary); }
    .ex__fields { display: flex; flex-direction: column; gap: 14px; }
    .ex__row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .ex__foot { text-align: center; font-size: 13px; color: var(--text-secondary); margin: 8px 0 0; }
    .ex__link { color: var(--color-primary); text-decoration: none; font-weight: 500; }
    .ex__link:hover { text-decoration: underline; }
  `],
})
class DemoSignUpComponent {
  steps = [
    { label: 'Account' },
    { label: 'Profile' },
    { label: 'Workspace' },
    { label: 'Invite team' },
  ];
  private fb = inject(FormBuilder);
  form: FormGroup = this.fb.group({
    firstName: ['', Validators.required],
    lastName:  ['', Validators.required],
    email:     ['', [Validators.required, Validators.email]],
    phone:     ['', Validators.required],
    password:  ['', [Validators.required, Validators.minLength(8)]],
    terms:     [false, Validators.requiredTrue],
  });
}

const meta: Meta = {
  title: 'Examples/Sign Up',
  component: DemoSignUpComponent,
  parameters: { layout: 'fullscreen' },
  decorators: [moduleMetadata({ imports: [DemoSignUpComponent] })],
};
export default meta;
type Story = StoryObj<DemoSignUpComponent>;

export const Default: Story = { render: () => ({ template: `<demo-sign-up />` }) };
