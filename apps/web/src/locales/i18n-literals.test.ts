import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const localeDir = fileURLToPath(new URL('./', import.meta.url));
const en = JSON.parse(readFileSync(`${localeDir}en.json`, 'utf8'));
const zh = JSON.parse(readFileSync(`${localeDir}zh.json`, 'utf8'));

describe('locale literal syntax', () => {
  it.each([en, zh])('escapes literal @ characters in rendered messages', (locale) => {
    const messages = locale.tools.metaTagGenerator;
    expect(messages.twitterSitePlaceholder).not.toMatch(/(?<!\{')@(?!'\})/);
    expect(messages.twitterCreatorPlaceholder).not.toMatch(/(?<!\{')@(?!'\})/);
    expect(locale.tools.emailNormalizer.errorMissingAt).not.toMatch(/(?<!\{')@(?!'\})/);
  });
});
