import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://test.pkv-angestellt.de',
  trailingSlash: 'always',
  build: {
    format: 'directory'
  },
  integrations: [tailwind({ applyBaseStyles: false })]
});
