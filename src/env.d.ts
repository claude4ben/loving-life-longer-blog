/// <reference types="astro/client" />

// Settings and services available to the server routes (see wrangler.toml).
interface Env {
  DB: import('./lib/db').D1Database;
  COMMENTS_NEED_APPROVAL?: string;
  ADMIN_PASSWORD?: string; // Cloudflare secret, set in the dashboard (never in GitHub)
  GITHUB_TOKEN?: string; // Cloudflare secret: lets the crop editor save into this repository
  GITHUB_REPO?: string;
  GITHUB_BRANCH?: string;
  GITHUB_API_URL?: string; // tests only: points at a pretend GitHub
}

declare namespace App {
  interface Locals {
    runtime: { env: Env };
  }
}
