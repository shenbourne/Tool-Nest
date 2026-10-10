/**
 * Helpers for turning design tokens (e.g. `--color-primary`) into concrete
 * values that non-CSS renderers can consume.
 *
 * Canvas/Konva cannot resolve CSS `var()` expressions: `strokeStyle`,
 * `fillStyle` and Konva's `stroke`/`fill` props need an actual color. Token
 * values therefore have to be read back from the DOM before rendering.
 */

/** Reads the computed value of a CSS custom property, e.g. `--color-primary`. */
export type CssCustomPropertyReader = (name: string) => string;

/**
 * Default reader: reads the computed value from `<html>`, where the design
 * tokens are declared (`:root` / `html.dark`). Returns an empty string when no
 * DOM is available (unit tests, SSR) instead of throwing.
 */
export function readCssCustomProperty(name: string): string {
  if (typeof document === 'undefined' || typeof getComputedStyle !== 'function') {
    return '';
  }
  return getComputedStyle(document.documentElement).getPropertyValue(name);
}

/**
 * Resolves a CSS custom property name (e.g. `--color-primary`) to its computed
 * color value. Both the name and the value are trimmed: `getPropertyValue()`
 * returns values with a leading space, which is not a valid color string.
 */
export function resolveCssColorToken(
  token: string,
  read: CssCustomPropertyReader = readCssCustomProperty,
): string {
  return read(token.trim()).trim();
}
