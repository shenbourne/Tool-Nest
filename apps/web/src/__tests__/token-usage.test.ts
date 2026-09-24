import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Source audit for the design-token migration (Task 7 of the Notion UI reskin).
 *
 * Tool components used to hardcode theme colors and to read v1 variables with
 * hex fallbacks, e.g. `var(--primary-color, #2080f0)`. Those values do not
 * react to the dark mode toggle, so the migration replaced them with the v2
 * tokens declared in `styles/tokens.css`.
 *
 * This test keeps the migration from regressing: the `grep` audits the migration
 * used are encoded here, generalised so that an `rgb()`/`rgba()` spelling of a
 * banned color is caught as well as its hex spelling — the alpha tint
 * `rgba(24, 160, 88, 0.08)` is the v1 primary green and a hex-only `grep` misses
 * it entirely.
 *
 * Functional colors that are intentionally *not* themed (camera viewfinder
 * `#000`, QR module `#000000`/`#ffffff`, diff and regex highlight backgrounds,
 * transparent-image checkerboards, user-editable default colors such as
 * `#ff0000`, SVG preview refs) are not in the banned set, so no allowlist is
 * needed.
 */

const SRC_DIR = fileURLToPath(new URL('..', import.meta.url));

/**
 * The palette definition layer. `tokens.css` declares every color and
 * `naive-theme.ts` mirrors them as literals because Naive UI's
 * `GlobalThemeOverrides` rejects CSS variables. Colors belong here; every other
 * module must consume them through a token. Their agreement is asserted by
 * `tokens.test.ts`, so exempting them here does not lose coverage.
 */
const PALETTE_MODULES = new Set(['styles/tokens.css', 'styles/naive-theme.ts']);

/** Colors from the superseded v1 palette. */
const BANNED_HEX = new Set([
  '18a058', // success / primary
  '36ad6a', // success hover
  '0c7a43', // success pressed
  'd03050', // error
  'f0a020', // warning (v1 value; the v2 dark warning reuses this literal)
  '2080f0', // primary (blue)
  '00c853', // primary (green, image-crop)
]);

function collectSources(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      // Test files are excluded: they carry the forbidden patterns verbatim.
      return entry.name === '__tests__' ? [] : collectSources(path);
    }
    if (!/\.(vue|ts|css)$/.test(entry.name) || /\.test\.ts$/.test(entry.name)) {
      return [];
    }
    return [path];
  });
}

const sources = collectSources(SRC_DIR)
  .map((path) => ({
    path: path.slice(SRC_DIR.length).replace(/\\/g, '/'),
    content: readFileSync(path, 'utf8'),
  }))
  .filter(({ path }) => !PALETTE_MODULES.has(path));

/** Every `#rrggbb` in `text`, lowercased and without the hash. */
const hexColorsIn = (text: string) => text.match(/#[0-9a-f]{6}\b/gi)?.map((c) => c.slice(1).toLowerCase()) ?? [];

/** Every `rgb()`/`rgba()` in `text` rewritten as a plain `#rrggbb`. */
const rgbColorsIn = (text: string) =>
  (text.match(/rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*[,)]/gi) ?? []).map((call) => {
    const [r, g, b] = call.match(/\d{1,3}/g)!.map(Number);
    return [r, g, b].map((channel) => channel.toString(16).padStart(2, '0')).join('');
  });

/** Every banned color literal in the sources, as `path:line` + the offending text. */
const bannedColorUses = sources.flatMap(({ path, content }) =>
  content
    .split('\n')
    .flatMap((text, index) =>
      [...hexColorsIn(text), ...rgbColorsIn(text)]
        .filter((color) => BANNED_HEX.has(color))
        .map(() => ({ path, line: index + 1, text: text.trim() })),
    ),
);

/** Every source line matching `pattern`, as `path:line` + the offending text. */
const matches = (pattern: RegExp) =>
  sources.flatMap(({ path, content }) =>
    content
      .split('\n')
      .map((text, index) => ({ path, line: index + 1, text: text.trim() }))
      .filter(({ text }) => pattern.test(text)),
  );

describe('sources use design tokens instead of hardcoded theme colors', () => {
  it('has source files to audit', () => {
    expect(sources.length).toBeGreaterThan(50);
  });

  it('contains no v1 semantic color, in hex or rgb form', () => {
    expect(bannedColorUses).toEqual([]);
  });

  it('contains no v1 variable read with a hex fallback', () => {
    const pattern = /var\(--(primary-color|n-border-color|n-color-hover|text-color-[0-9])\s*,/;

    expect(matches(pattern)).toEqual([]);
  });

  it('reads design tokens rather than Naive UI internal variables', () => {
    // `--n-*` is only defined inside a Naive component subtree, so reading it
    // from plain markup yields an unresolved value and does not follow the
    // theme when the palette changes. Declaring one (e.g. `--n-font-size: 13px`)
    // to style Naive children is fine; reading one is not.
    expect(matches(/var\(\s*--n-/)).toEqual([]);
  });
});
