// Where the site's content lives. Normally src/content (what Ben edits in Keystatic). Automated tests
// build the site from a frozen sample copy instead (tests/fixtures/content), so Ben's edits never break them.
declare const __LLL_CONTENT__: string | undefined;
export const CONTENT_ROOT: string = typeof __LLL_CONTENT__ !== 'undefined' && __LLL_CONTENT__ ? __LLL_CONTENT__ : 'src/content';
export const IS_TEST_CONTENT = CONTENT_ROOT === 'tests/fixtures/content';
