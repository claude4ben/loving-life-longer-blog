import AxeBuilder from '@axe-core/playwright';
import { test, expect, ARTICLE } from './fixtures';

// Automated accessibility scan (WCAG 2.1 A and AA rules) on every page.
for (const path of ['/', ARTICLE, '/about/', '/policy/', '/move/', '/think/', '/admin/', '/admin/photos/']) {
  test(`${path} has no accessibility violations`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      // The faint "Placeholder copy — pending" notes are temporary and go when real copy arrives.
      .exclude('.placeholder-note')
      .analyze();
    const summary = results.violations.map((v) => `${v.id}: ${v.help} → ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`);
    expect(summary).toEqual([]);
  });
}
