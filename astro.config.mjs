// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://ciaranfontein.com',
  integrations: [sitemap()],
  vite: {
    // Keep Vite's generated cache inside this checkout so concurrent
    // worktrees never contend over a shared node_modules cache.
    cacheDir: '.astro/vite-cache',
  },
});
