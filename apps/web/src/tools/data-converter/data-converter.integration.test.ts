import { describe, expect, it } from 'vitest';
import { allTools } from '../registry';
import { legacyPaths, legacyConversionQuery } from './formats';
import { canonicalToolPath, normalizeToolPreferences } from '@/utils/tool-paths';
describe('converter integration', () => {
  it('owns every old route without duplicate cards', () => {
    for (const path of legacyPaths) {
      expect(allTools.some(tool => tool.path === path)).toBe(false);
      expect(canonicalToolPath(path, allTools)).toBe('/data-converter');
      const [from,to] = path.slice(1).split('-to-');
      expect(legacyConversionQuery(path)).toEqual({from,to});
    }
    expect(allTools.filter(tool => tool.path === '/data-converter')).toHaveLength(1);
  });
  it('merges persisted favorites and keeps latest recent timestamp', () => {
    expect(normalizeToolPreferences({favorites:['/json-to-yaml','/csv-to-json'],recentTools:[{path:'/json-to-yaml',timestamp:1},{path:'/csv-to-json',timestamp:2}]},allTools)).toEqual({favorites:['/data-converter'],recentTools:[{path:'/data-converter',timestamp:2}]});
  });
});
