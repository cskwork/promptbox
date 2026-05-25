import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

const SITE = process.env.SITE_URL || 'https://cskwork.github.io';
const BASE = process.env.BASE_PATH || '/promptbox';

export default defineConfig({
  site: SITE,
  base: BASE,
  trailingSlash: 'ignore',
  integrations: [tailwind({ applyBaseStyles: false }), mdx(), sitemap()],
  markdown: {
    shikiConfig: {
      theme: 'github-dark-dimmed',
      wrap: true,
    },
  },
});
