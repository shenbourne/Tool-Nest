import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { reactive } from 'vue';
import { useToolStore } from './tool.store';
import { useSearchStore } from './search.store';

const preferenceState = vi.hoisted(() => ({ current: undefined as unknown }));
vi.mock('./preferences.store', () => ({ usePreferencesStore: () => preferenceState.current }));

describe('legacy tool preferences', () => {
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
  it('finds retained tools through their former Chinese and English names', () => {
    const store = useToolStore();
    expect(store.searchTools('JSON 查看器').map(tool => tool.path)).toEqual(['/json-prettify']);
    expect(store.searchTools('Token Generator').map(tool => tool.path)).toEqual(['/password-generator']);
    const search = useSearchStore();
    search.setQuery('JSON 查看器');
    expect(search.results.map(tool => tool.path)).toContain('/json-prettify');
    search.setQuery('令牌生成器');
    expect(search.results.map(tool => tool.path)).toContain('/password-generator');
  });
});
