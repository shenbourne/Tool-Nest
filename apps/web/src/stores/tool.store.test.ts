import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { reactive } from 'vue';
import { useToolStore } from './tool.store';
import { useSearchStore } from './search.store';

const preferenceState = vi.hoisted(() => ({ current: undefined as unknown }));
vi.mock('./preferences.store', () => ({ usePreferencesStore: () => preferenceState.current }));

describe('legacy tool preferences', () => {
  it('unifies image conversion favorites and recents without retaining old search names', () => {
    const state = preferenceState.current as { prefs: { favorites: string[]; recentTools: { path: string; timestamp: number }[] } };
    state.prefs.favorites = ['/jpg-to-png', '/convert-to-jpg', '/convert-to-webp'];
    state.prefs.recentTools = [{ path: '/jpg-to-png', timestamp: 1 }, { path: '/convert-to-webp', timestamp: 2 }];
    const store = useToolStore();
    expect(store.favoriteTools.map(tool => tool.path)).toEqual(['/image-format-converter']);
    expect(store.recentToolsList.map(tool => tool.path)).toEqual(['/image-format-converter']);
    for (const name of ['转换为 JPG', 'JPG to PNG', 'Convert to WebP']) {
      expect(store.searchTools(name)).toEqual([]);
    }
  });
  beforeEach(() => {
    setActivePinia(createPinia());
    const state = reactive({
      prefs: {
        favorites: ['/json-viewer', '/json-stringify', '/math-evaluator', '/unknown'],
        recentTools: [{ path: '/json-viewer', timestamp: 10 }, { path: '/json-prettify', timestamp: 20 }, { path: '/math-evaluator', timestamp: 5 }],
      },
      save: vi.fn(async (updates) => { Object.assign(state.prefs, updates); }),
    });
    preferenceState.current = state;
  });
  it('shows each favorite and recent tool once, without mutating stored data on read', () => {
    const store = useToolStore();
    expect(store.favoritePaths).toEqual(['/json-prettify', '/generic-calculator', '/unknown']);
    expect(store.favoriteTools.map(tool => tool.path)).toEqual(expect.arrayContaining(['/json-prettify', '/generic-calculator']));
    expect(store.favoriteTools).toHaveLength(2);
    expect(store.recentToolsList.map(tool => tool.path)).toEqual(['/json-prettify', '/generic-calculator']);
    expect((preferenceState.current as { prefs: { favorites: string[] } }).prefs.favorites[0]).toBe('/json-viewer');
  });
  it('removes a legacy favorite and records canonical usage when interacting', async () => {
    const store = useToolStore();
    await store.toggleFavorite('/json-prettify');
    expect(store.favoritePaths).toEqual(['/generic-calculator', '/unknown']);
    await store.addRecentTool('/json-stringify');
    expect(store.recentToolsList[0].path).toBe('/json-prettify');
    expect(store.getToolByPath('/token-generator')?.path).toBe('/password-generator');
  });
  it('does not surface removed merge aliases in either search API', () => {
    const store = useToolStore();
    expect(store.searchTools('JSON 查看器')).toEqual([]);
    expect(store.searchTools('Token Generator')).toEqual([]);
    const search = useSearchStore();
    search.setQuery('JSON 查看器');
    expect(search.results).toEqual([]);
    search.setQuery('令牌生成器');
    expect(search.results).toEqual([]);
  });
  it('consolidates all old list tools in favorites and recents without exposing merge aliases', async () => {
    const state = preferenceState.current as { prefs: { favorites: string[]; recentTools: { path: string; timestamp: number }[] } };
    state.prefs.favorites = ['/list-sort', '/list-wrap', '/text-join', '/list-reverse', '/list-group', '/list-truncate', '/list-unwrap', '/list-shuffle', '/list-rotate', '/list-find-popular'];
    state.prefs.recentTools = [{ path: '/list-sort', timestamp: 1 }, { path: '/list-group', timestamp: 2 }, { path: '/list-truncate', timestamp: 3 }];
    const store = useToolStore();
    expect(store.favoriteTools.map(tool => tool.path)).toEqual(['/list-converter']);
    expect(store.recentToolsList.map(tool => tool.path)).toEqual(['/list-converter']);
    expect(store.getToolByPath('/list-wrap')?.path).toBe('/list-converter');
    const search = useSearchStore();
    for (const name of ['列表排序', '列表包装', '文本连接', '列表反转', '列表截断', '列表分组', '列表洗牌', '列表解包', '列表找最频繁']) {
      search.setQuery(name);
      expect(search.results).toEqual([]);
    }
    await store.toggleFavorite('/list-converter');
    expect(store.favoriteTools).toHaveLength(0);
  });
});
