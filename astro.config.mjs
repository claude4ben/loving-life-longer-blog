import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';

// Pages are pre-built (static). Only routes marked `prerender = false` (the /api/* endpoints)
// run on Cloudflare as Pages Functions, with access to the D1 database.
export default defineConfig({
  // The site's main web address, used for canonical links, share previews, the sitemap and llms.txt.
  // Change it when the site moves to www.lovinglifelonger.com.
  site: 'https://loving-life-longer-blog.pages.dev',
  output: 'static',
  integrations: [react(), keystatic()],
  // Tests build from a frozen sample of the content (see src/lib/content-root.ts).
  // They also get their own cache, so a test build can never leak into a normal build.
  cacheDir: process.env.LLL_CONTENT ? './node_modules/.astro-test-cache' : './node_modules/.astro',
  vite: { define: { __LLL_CONTENT__: JSON.stringify(process.env.LLL_CONTENT || 'src/content') } },
  adapter: cloudflare({ platformProxy: { enabled: true }, imageService: 'compile' }),
});
