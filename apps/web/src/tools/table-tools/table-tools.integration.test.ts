import { describe, expect, it } from 'vitest';
import { allTools } from '../registry';
import { legacyTableTabs } from './operations';
import { canonicalToolPath, normalizeToolPreferences } from '@/utils/tool-paths';
describe('table tool consolidation', () => {
  it('owns all five tool paths and the older transpose alias', () => {
    expect(allTools.filter(tool => tool.path === '/table-tools')).toHaveLength(1);
    for (const path of Object.keys(legacyTableTabs)) {
      expect(allTools.some(tool => tool.path === path)).toBe(false);
      expect(canonicalToolPath(path,allTools)).toBe('/table-tools');
    }
    expect(legacyTableTabs['/csv-transpose']).toBe('transpose');
  });
  it('merges saved favorites and retains latest recents', () => {
    expect(normalizeToolPreferences({favorites:['/csv-transpose','/csv-swap-columns'],recentTools:[{path:'/csv-transpose',timestamp:1},{path:'/csv-swap-columns',timestamp:2}]},allTools)).toEqual({favorites:['/table-tools'],recentTools:[{path:'/table-tools',timestamp:2}]});
  });
});
