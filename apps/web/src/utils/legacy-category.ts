import type { RouteLocationRaw } from 'vue-router';

// Retired operation categories remain accessible as cross-category filters.
export function legacyCategoryLocation(category: string): RouteLocationRaw | undefined {
  if (category === 'converter' || category === 'generator') {
    return { path: '/', query: { tag: category } };
  }
  if (category === 'measurement') return { path: '/tools/datetime' };
  if (category === 'network-test') return { path: '/tools/network' };
  if (category === 'platform') return { path: '/' };
  return undefined;
}
