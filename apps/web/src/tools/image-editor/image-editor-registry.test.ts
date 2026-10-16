import { describe, expect, it } from 'vitest';
import { allTools } from '../registry';
import { normalizeToolPreferences } from '@/utils/tool-paths';
const oldPaths = ['/image-change-colors','/image-change-opacity','/image-create-transparent','/image-crop','/image-flip','/image-remove-background','/image-resize','/image-rotate','/image-watermark'];
describe('image editor consolidation', () => {
  it('owns all nine legacy URLs with one catalog entry', () => {
    expect(allTools.some(tool => oldPaths.includes(tool.path))).toBe(false);
    expect(allTools.find(tool => tool.path === '/image-editor')?.redirectFrom).toEqual(oldPaths);
  });
  it('merges favorites and keeps the latest legacy recent visit', () => {
    expect(normalizeToolPreferences({ favorites: oldPaths, recentTools: oldPaths.map((path, timestamp) => ({path, timestamp})) }, allTools)).toEqual({favorites:['/image-editor'],recentTools:[{path:'/image-editor',timestamp:8}]});
  });
});
