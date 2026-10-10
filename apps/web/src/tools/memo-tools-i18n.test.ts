import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

// The two memo tools render their whole cheat sheet from locale keys
// (git-memo: section titles + command notes; regex-memo: section titles +
// entry meanings + column headers). A missing key silently falls back to
// English — exactly the mixed-language leak this pins down.
const localeDir = fileURLToPath(new URL('../locales/', import.meta.url));
const en = JSON.parse(readFileSync(`${localeDir}en.json`, 'utf8'));
const zh = JSON.parse(readFileSync(`${localeDir}zh.json`, 'utf8'));

const vue = {
  gitMemo: readFileSync(fileURLToPath(new URL('./git-memo/GitMemo.vue', import.meta.url)), 'utf8'),
  regexMemo: readFileSync(fileURLToPath(new URL('./regex-memo/RegexMemo.vue', import.meta.url)), 'utf8'),
};

const TOOLS = ['gitMemo', 'regexMemo'] as const;
// Keys that carry tool metadata or are section titles / column headers,
// i.e. the leaves the cheat-sheet data must reference.
const META_KEYS = ['name', 'description', 'sections', 'syntaxColumn', 'meaningColumn'];

const CJK = /[一-鿿]/;

function collectKeys(value: unknown, prefix = ''): string[] {
  return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
    child && typeof child === 'object'
      ? collectKeys(child, `${prefix}${key}.`)
      : [`${prefix}${key}`],
  );
}

function getLeaf(value: unknown, dotted: string): unknown {
  return dotted.split('.').reduce<unknown>((acc, key) =>
    acc && typeof acc === 'object' ? (acc as Record<string, unknown>)[key] : undefined,
    value,
  );
}

function walkLeaves(value: unknown, visit: (path: string, leaf: string) => void, prefix = ''): void {
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    const path = `${prefix}${key}`;
    if (child && typeof child === 'object') walkLeaves(child, visit, `${path}.`);
    else visit(path, String(child));
  }
}

function referencedKeys(source: string): string[] {
  const re = /\$?t\(\s*(['"])([A-Za-z0-9_.-]+)\1\s*\)/g;
  const keys: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = re.exec(source)) !== null) keys.push(match[2]);
  return keys;
}

describe('memo tools locale coverage', () => {
  it.each(TOOLS)('%s: en and zh key trees are identical', (tool) => {
    expect(collectKeys(zh.tools[tool]).sort()).toEqual(collectKeys(en.tools[tool]).sort());
  });

  it.each(TOOLS)('%s: every static key used in the component resolves in both locales', (tool) => {
    for (const key of referencedKeys(vue[tool])) {
      expect(getLeaf(en, key), `en missing ${key}`).toBeDefined();
      expect(getLeaf(zh, key), `zh missing ${key}`).toBeDefined();
    }
  });

  it.each(TOOLS)('%s: every cheat-sheet key defined in the locale is referenced by the component', (tool) => {
    const used = referencedKeys(vue[tool]);
    for (const key of collectKeys(en.tools[tool])) {
      if (META_KEYS.includes(key.split('.')[0])) continue;
      expect(used, `${key} is defined but never rendered`).toContain(`tools.${tool}.${key}`);
    }
  });

  it.each(TOOLS)('%s: zh leaves are translated and en leaves stay English', (tool) => {
    walkLeaves(zh.tools[tool], (path, leaf) => {
      expect(leaf, `zh ${tool}.${path} is not translated`).toMatch(CJK);
    });
    walkLeaves(en.tools[tool], (path, leaf) => {
      expect(leaf, `en ${tool}.${path} leaked Chinese`).not.toMatch(CJK);
    });
  });

  it.each(TOOLS)('%s: zh section titles append the Chinese translation after the English title', (tool) => {
    const zhSections = zh.tools[tool].sections as Record<string, string>;
    for (const [key, enTitle] of Object.entries(en.tools[tool].sections as Record<string, string>)) {
      expect(enTitle, `${tool}.sections.${key} english title should stay pure`).not.toMatch(CJK);
      const escaped = enTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      expect(zhSections[key], `${tool}.sections.${key} should be "<English> · <中文>"`)
        .toMatch(new RegExp(`^${escaped} · .`));
    }
  });

  it.each(TOOLS)('%s: locale values contain no unescaped braces', (tool) => {
    // vue-i18n compiles every value as a message; a raw `{`/`}` aborts the
    // whole route render (observed on /regex-memo). Literal braces need the
    // intlify escape tokens {'{'} / {'}'}.
    for (const locale of [en, zh]) {
      walkLeaves(locale.tools[tool], (path, leaf) => {
        const withoutEscapes = leaf.replace(/\{'\{'\}|\{'\}'\}/g, '');
        expect(withoutEscapes, `${path} has an unescaped brace`).not.toMatch(/[{}]/);
      });
    }
  });
});
