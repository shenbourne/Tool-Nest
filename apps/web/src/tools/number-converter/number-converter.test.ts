import { describe, expect, it } from 'vitest';
import { allTools } from '../registry';
import { normalizeToolPreferences } from '@/utils/tool-paths';

describe('number tool consolidation', () => {
  it('registers one converter with both old routes', () => {
    expect(allTools.some(t => ['/number-to-words', '/roman-numeral-converter'].includes(t.path))).toBe(false);
    expect(allTools.find(t => t.path === '/number-converter')?.redirectFrom).toEqual(['/number-to-words', '/roman-numeral-converter']);
  });
  it('retains old favorites and the latest recent visit', () => {
    expect(normalizeToolPreferences({ favorites: ['/number-to-words', '/roman-numeral-converter'], recentTools: [{ path: '/number-to-words', timestamp: 1 }, { path: '/roman-numeral-converter', timestamp: 2 }] }, allTools)).toEqual({ favorites: ['/number-converter'], recentTools: [{ path: '/number-converter', timestamp: 2 }] });
  });
});
