import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

// Pages are pre-built (static). Only routes marked `prerender = false` (the /api/* endpoints)
// run on Cloudflare as Pages Functions, with access to the D1 database.
export default defineConfig({
  output: 'static',
  adapter: cloudflare({ platformProxy: { enabled: true }, imageService: 'compile' }),
});
