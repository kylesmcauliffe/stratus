import fs from 'node:fs';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';
import tailwindcss from '@tailwindcss/vite';

/** Align config `site` with `.env` SITE (Astro loads .env after config is evaluated). */
function resolveSiteOrigin() {
  if (process.env.SITE) return process.env.SITE.replace(/\/$/, '');
  try {
    const envPath = new URL('.env', import.meta.url);
    const line = fs.readFileSync(envPath, 'utf8').match(/^SITE=(.+)$/m);
    if (line?.[1]) return line[1].trim().replace(/\/$/, '');
  } catch {
    /* no .env */
  }
  return 'https://rainfall-aeo.netlify.app';
}

const site = resolveSiteOrigin();

export default defineConfig({
  site,
  devToolbar: { enabled: false },
  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'hover',
  },
  integrations: [
    sitemap({
      customPages: [`${site}/llms.txt`],
      filter: (page) => !page.includes('/404') && !page.includes('/og/'),
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      serialize(item) {
        const pathname = new URL(item.url).pathname.replace(/\/$/, '') || '/';
        if (pathname === '/') {
          item.priority = 1.0;
          item.changefreq = 'weekly';
        } else if (pathname === '/llms.txt') {
          item.priority = 0.5;
          item.changefreq = 'monthly';
        } else if (pathname.startsWith('/hospitals/')) {
          item.priority = 0.6;
          item.changefreq = 'monthly';
        }
        return item;
      },
    }),
    icon(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
