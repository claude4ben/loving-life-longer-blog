// Lighthouse (Google's page-speed and quality checker), run by CI on the real content before it goes live.
// Phone settings (Google ranks the phone version of pages), 3 runs per page.
// Google's "good" Core Web Vitals: LCP (main content shown) under 2.5s, CLS (layout jumping) under 0.1;
// TBT (page busy, can't respond) stands in for INP in lab tests.
const { readFileSync } = require('node:fs');

// While the site is hidden from search (src/data/site.ts), the overall SEO score is always low on purpose,
// so the individual SEO checks are asserted instead.
const hidden = /HIDE_FROM_SEARCH\s*=\s*true/.test(readFileSync('src/data/site.ts', 'utf8'));

module.exports = {
  ci: {
    collect: {
      staticDistDir: './dist',
      url: ['/', '/blog/blindfolded-with-50-strangers/', '/about/', '/policy/'],
      numberOfRuns: 3,
      settings: { chromeFlags: '--no-sandbox --headless=new' },
    },
    assert: {
      aggregationMethod: 'median-run',
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        ...(hidden
          ? {
              'document-title': 'error',
              'meta-description': 'error',
              'http-status-code': 'error',
              'link-text': 'error',
              'crawlable-anchors': 'error',
              'image-alt': 'error',
            }
          : { 'categories:seo': ['error', { minScore: 0.9 }] }),
        // Warn above Google's 2.5s; fail above 3s (lab phone timings vary run to run).
        'largest-contentful-paint': ['error', { maxNumericValue: 3000 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 200 }],
        // Not meaningful on the test server: the canonical address is the live site's, and the
        // likes/comments API isn't running, so the browser logs those failed requests.
        canonical: 'off',
        'errors-in-console': 'off',
      },
    },
    upload: { target: 'filesystem', outputDir: './lighthouse-report' },
  },
};
