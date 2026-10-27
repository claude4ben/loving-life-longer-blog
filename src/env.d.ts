/// <reference types="astro/client" />

// Settings and services available to the server routes (see wrangler.toml).
interface Env {
  DB: import('./lib/db').D1Database;
  COMMENTS_NEED_APPROVAL?: string;
  ADMIN_PASSWORD?: string; // Cloudflare secret, set in the dashboard (never in GitHub)
}

declare namespace App {
  interface Locals {
    runtime: { env: Env };
  }
}
