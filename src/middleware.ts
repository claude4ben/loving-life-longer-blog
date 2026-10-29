import { defineMiddleware } from 'astro:middleware';
import { headersFor } from './lib/security-headers.mjs';

// Adds the security headers to pages made on request (admin photo editor, Keystatic, /api). Pre-built
// pages get the same headers from the _headers file written at build time.
export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next();
  if (context.isPrerendered) return response;
  const extra = headersFor(context.url.pathname);
  try {
    for (const [k, v] of Object.entries(extra)) response.headers.set(k, v);
    return response;
  } catch {
    // Some responses (e.g. redirects) have fixed headers: copy them into a new response first.
    const copy = new Response(response.body, response);
    for (const [k, v] of Object.entries(extra)) copy.headers.set(k, v);
    return copy;
  }
});
