import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { naiveLightThemeOverrides } from '@/styles/naive-theme';

const tokensCss = readFileSync(new URL('../styles/tokens.css', import.meta.url), 'utf8');
const readToken = (name: string) =>
  tokensCss.match(new RegExp(`--${name}:\\s*([^;]+);`))?.[1].trim();

describe('naive theme overrides stay in sync with tokens.css', () => {
  it('primary colors match tokens', () => {
    expect(naiveLightThemeOverrides.common?.primaryColor).toBe(readToken('color-primary'));
    expect(naiveLightThemeOverrides.common?.primaryColorHover).toBe(readToken('color-primary-hover'));
    expect(naiveLightThemeOverrides.common?.primaryColorPressed).toBe(readToken('color-primary-pressed'));
    expect(naiveLightThemeOverrides.common?.borderRadius).toBe(readToken('radius-lg'));
  });
});
