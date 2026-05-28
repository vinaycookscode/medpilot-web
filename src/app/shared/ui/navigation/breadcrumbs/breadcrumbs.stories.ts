import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { GwBreadcrumbsComponent } from './breadcrumbs.component';

const meta: Meta<GwBreadcrumbsComponent> = {
  title: 'Navigation/Breadcrumbs',
  component: GwBreadcrumbsComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [GwBreadcrumbsComponent] })],
  argTypes: {
    separator: { control: 'inline-radio', options: ['chevron', 'slash', 'arrow'] },
  },
};
export default meta;
type Story = StoryObj<GwBreadcrumbsComponent>;

const PATH = [
  { label: 'Patients',    link: '/patients' },
  { label: 'Admissions',  link: '/patients/admissions' },
  { label: 'Riya Verma' },
];

export const Default: Story = {
  args: { items: PATH, separator: 'chevron' },
};

export const WithIcons: Story = {
  args: {
    items: [
      { label: 'Home',     link: '/',          icon: 'home' },
      { label: 'Patients', link: '/patients',  icon: 'users' },
      { label: 'Riya Verma' },
    ],
  },
};

export const Collapsed: Story = {
  args: {
    items: [
      { label: 'Workspace', link: '/' },
      { label: 'Patients',  link: '/p' },
      { label: 'Admissions', link: '/p/a' },
      { label: 'ICU',       link: '/p/a/icu' },
      { label: 'Bed 12',    link: '/p/a/icu/bed-12' },
      { label: 'Riya Verma' },
    ],
    collapseAfter: 4,
  },
};
