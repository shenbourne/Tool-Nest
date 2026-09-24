import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { naiveDarkThemeOverrides, naiveLightThemeOverrides } from '@/styles/naive-theme';

const tokensCss = readFileSync(new URL('../styles/tokens.css', import.meta.url), 'utf8');

const lightTokens = tokensCss.split('html.dark')[0];
const darkTokens = tokensCss.slice(tokensCss.indexOf('html.dark'));

const readToken = (block: string, name: string) =>
  block.match(new RegExp(`--${name}:\\s*([^;]+);`))?.[1].trim();

describe('naive theme overrides stay in sync with tokens.css', () => {
  it('primary colors match tokens', () => {
    const light = naiveLightThemeOverrides.common;
    expect(light?.primaryColor).toBe(readToken(lightTokens, 'color-primary'));
    expect(light?.primaryColorHover).toBe(readToken(lightTokens, 'color-primary-hover'));
    expect(light?.primaryColorPressed).toBe(readToken(lightTokens, 'color-primary-pressed'));
    expect(light?.borderRadius).toBe(readToken(lightTokens, 'radius-lg'));
  });

  // Naive UI's GlobalThemeOverrides only accepts literal values, so
  // `naive-theme.ts` duplicates the palette by necessity. Assert the duplication
  // is faithful: a stale v1 literal left behind during the migration fails here.
  describe.each([
    ['light', naiveLightThemeOverrides, lightTokens],
    ['dark', naiveDarkThemeOverrides, darkTokens],
  ] as const)('%s theme literals mirror their tokens', (_name, overrides, block) => {
    it.each(['success', 'warning', 'error', 'info'])('%sColor', (status) => {
      expect(overrides.common?.[`${status}Color` as 'successColor']).toBe(
        readToken(block, `color-${status}`),
      );
    });

    it.each([
      ['primaryColor', 'color-primary'],
      ['primaryColorHover', 'color-primary-hover'],
      ['primaryColorPressed', 'color-primary-pressed'],
      ['textColorBase', 'color-ink'],
      ['cardColor', 'color-surface'],
    ] as const)('%s mirrors %s', (naiveKey, tokenName) => {
      expect(overrides.common?.[naiveKey as 'primaryColor']).toBe(readToken(block, tokenName));
    });
  });
});
