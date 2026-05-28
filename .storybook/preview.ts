import type { Preview } from '@storybook/angular'
import { setCompodocJson } from "@storybook/addon-docs/angular";
import docJson from "../documentation.json";
setCompodocJson(docJson);

// Inject Inter + JetBrains Mono into the Storybook iframe so component
// previews use the same typography stack the app does.
if (typeof document !== 'undefined' && !document.getElementById('gw-sb-fonts')) {
  const link = document.createElement('link');
  link.id = 'gw-sb-fonts';
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap';
  document.head.appendChild(link);
}

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'page',
      values: [
        { name: 'page', value: '#FAFAFA' },
        { name: 'card', value: '#FFFFFF' },
        { name: 'dark', value: '#09090B' },
      ],
    },
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
  },
};

export default preview;
