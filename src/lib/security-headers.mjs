// Security headers: instructions sent with every page telling browsers what the site is allowed to do.
// One list, used twice: written into dist/_headers at build (for the pre-built pages; see astro.config.mjs)
// and added by src/middleware.ts to pages made on request (admin photo editor, Keystatic, /api).
// Plain JavaScript so astro.config.mjs can read it too.

// Content Security Policy for the public site: only this site's own scripts, fonts and connections.
// Inline styles stay allowed (pillar colours and brand tiles use them); pictures may come from any https
// address (article link icons can be web links).
const SITE_CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self'",
  "connect-src 'self'",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  'upgrade-insecure-requests',
].join('; ');

// The Keystatic editor (behind GitHub sign-in) is a larger app: it talks to GitHub, shows uploaded
// photos before saving, and loads its own font from Google, so it gets a slightly wider policy.
// Only the site owner uses it, so readers' data never goes to Google.
const EDITOR_CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' https://api.github.com https://*.githubusercontent.com",
  "worker-src 'self' blob:",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://github.com",
  "frame-ancestors 'none'",
].join('; ');

const COMMON = {
  // Only ever use the secure (https) version of the site.
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  // Don't guess file types (stops a file being run as something it isn't).
  'X-Content-Type-Options': 'nosniff',
  // Other sites can't show these pages inside a frame (stops "clickjacking"). Older browsers read this one.
  'X-Frame-Options': 'DENY',
  // When a reader clicks away, other sites see only "loving-life-longer-blog.pages.dev", not the full page address.
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  // The site never needs the camera, microphone, location or payments, so they're switched off.
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()',
  // Pages opened from here (e.g. share links) can't reach back into this page.
  'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
};

export const isEditorPath = (path) => path === '/keystatic' || path.startsWith('/keystatic/') || path.startsWith('/api/keystatic');

export function headersFor(path) {
  return { ...COMMON, 'Content-Security-Policy': isEditorPath(path) ? EDITOR_CSP : SITE_CSP };
}

// The _headers file Cloudflare Pages reads for the pre-built pages. It also sets how long browsers keep
// files: everything in /_astro/ has a fingerprint in its name (it changes whenever the file does), so
// browsers keep it for a year and don't re-check it on every page change.
export function headersFile() {
  const lines = Object.entries(headersFor('/')).map(([k, v]) => `  ${k}: ${v}`);
  return [
    "# Written by astro.config.mjs from src/lib/security-headers.mjs. Don't edit by hand.",
    '/*',
    ...lines,
    '',
    '/_astro/*',
    '  Cache-Control: public, max-age=31536000, immutable',
    '',
    '/fonts/*',
    '  Cache-Control: public, max-age=2592000',
    '',
  ].join('\n');
}
