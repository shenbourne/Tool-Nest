import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { TOOL_CATEGORIES } from '@toolnest/shared';
import { allTools } from '@/tools/registry';
import { useSearchStore } from '@/stores/search.store';
import zh from '@/locales/zh.json';
import en from '@/locales/en.json';
import { legacyCategoryLocation } from '@/utils/legacy-category';

vi.mock('@/stores/preferences.store', () => ({ usePreferencesStore: () => ({ prefs: { favorites: [], recentTools: [] } }) }));

describe('object and domain taxonomy', () => {
  beforeEach(() => { setActivePinia(createPinia()); });

  it('groups structured data, secrets and dates consistently', () => {
    for (const path of ['/json-prettify', '/json-validate', '/json-sort', '/data-converter']) {
      expect(allTools.find(tool => tool.path === path || tool.redirectFrom?.includes(path))?.category, path).toBe('data');
    }
    for (const tool of allTools.filter(tool => tool.path.startsWith('/list-'))) {
      expect(tool.category, tool.path).toBe('text');
    }
    for (const path of ['/password-generator', '/otp-generator', '/password-strength-analyser', '/info-masking']) {
      expect(allTools.find(tool => tool.path === path)?.category, path).toBe('crypto');
    }
    expect(allTools.find(tool => tool.path === '/date-time-converter')?.category).toBe('datetime');
    expect(allTools.find(tool => tool.path === '/ping-test')?.category).toBe('network');
  });

  it('has 13 populated, bilingual categories covering every tool once', () => {
    expect(TOOL_CATEGORIES).toHaveLength(13);
    const categories = new Set(TOOL_CATEGORIES.map(category => category.name));
    for (const tool of allTools) {
      expect(categories.has(tool.category), tool.path).toBe(true);
      expect(new Set(tool.tags).size, tool.path).toBe(tool.tags.length);
    }
    for (const category of TOOL_CATEGORIES) {
      expect(allTools.some(tool => tool.category === category.name)).toBe(true);
      for (const locale of [zh, en]) expect((locale.category as Record<string, { name: string }>)[category.name]?.name).toBeTruthy();
    }
  });

  it('retains generators and converters as cross-category filters without runtime tags', () => {
    const store = useSearchStore();
    expect(store.allTags).not.toContain('browser');
    expect(store.allTags).not.toContain('backend');
    expect(store.allTags).not.toContain('lazy-load');
    store.toggleTag('generator');
    expect(store.results.map(tool => tool.path)).toContain('/password-generator');
    expect(store.results.map(tool => tool.path)).toContain('/uuid-generator');
    store.setCategory('crypto');
    expect(store.results.map(tool => tool.path)).toContain('/password-generator');
    expect(store.results.every(tool => tool.category === 'crypto')).toBe(true);
    store.clearFilters();
    store.toggleTag('converter');
    expect(store.results.map(tool => tool.path)).toContain('/data-converter');
    expect(store.results.map(tool => tool.path)).toContain('/base64-encoder');
    expect(store.results.map(tool => tool.path)).toContain('/image-format-converter');
    store.clearFilters();
    store.toggleTag('compressor');
    expect(store.results.map(tool => tool.path)).toEqual(expect.arrayContaining(['/compress-pdf', '/image-compress', '/video-compress']));
  });

  it('keeps old category URLs and anchors usable without changing tool URLs', () => {
    expect(legacyCategoryLocation('converter')).toEqual({ path: '/', query: { tag: 'converter' } });
    expect(legacyCategoryLocation('generator')).toEqual({ path: '/', query: { tag: 'generator' } });
    expect(legacyCategoryLocation('measurement')).toEqual({ path: '/tools/datetime' });
    expect(legacyCategoryLocation('network-test')).toEqual({ path: '/tools/network' });
    expect(legacyCategoryLocation('data')).toBeUndefined();
  });

  it('provides bilingual names for all visible filters', () => {
    const store = useSearchStore();
    for (const tag of store.allTags) {
      for (const locale of [zh, en]) expect((locale.tags.labels as Record<string, string>)[tag], tag).toBeTruthy();
    }
  });
});
