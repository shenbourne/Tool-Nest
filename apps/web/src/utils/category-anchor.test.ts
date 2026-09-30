import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { categoryAnchorHref, categoryAnchorId } from './category-anchor';

// A sidebar category click navigates to a hash that has to resolve to the section
// the home page renders for that category. Both sides read the format from this
// module, so the link and the section id cannot drift apart again: before phase
// 08 the link used `#<category>` while the section was `category-<category>`, and
// every click landed on the top of the home page.
const srcDir = fileURLToPath(new URL('..', import.meta.url));

const PRODUCERS = [
  {
    file: 'layouts/AppLayout.vue',
    calls: ['categoryAnchorHref(', 'categoryAnchorId('],
  },
  { file: 'pages/CategoryPage.vue', calls: ['categoryAnchorHref('] },
  {
    file: 'pages/HomePage.vue',
    calls: ['categoryAnchorId(cat.name)', 'CATEGORY_ANCHOR_OFFSET'],
  },
];

describe('category anchor contract', () => {
  it('names a section after its category', () => {
    expect(categoryAnchorId('developer')).toBe('category-developer');
  });

  it('links to that section on the home page', () => {
    expect(categoryAnchorHref('network-test')).toBe('/#category-network-test');
  });

  it.each(PRODUCERS)(
    '$file builds the anchor through this module',
    ({ file, calls }) => {
      const source = readFileSync(join(srcDir, file), 'utf8');
      for (const call of calls) {
        expect(source, `${file} should reference ${call}`).toContain(call);
      }
    }
  );
});
