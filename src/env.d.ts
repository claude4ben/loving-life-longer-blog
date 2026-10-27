/// <reference types="astro/client" />

// Settings and services available to the server routes (see wrangler.toml).
interface Env {
  DB: import('./lib/db').D1Database;
  COMMENTS_NEED_APPROVAL?: string;
  ADMIN_EMAILS?: string;
  ACCESS_TEAM_DOMAIN?: string;
  ACCESS_AUD?: string;
  ADMIN_DEV_BYPASS?: string; // local testing only; never set on Cloudflare
}

declare namespace App {
  interface Locals {
    runtime: { env: Env };
  }
}
