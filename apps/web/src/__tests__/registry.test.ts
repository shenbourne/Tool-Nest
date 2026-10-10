import { describe, it, expect } from 'vitest';
import { TOOL_CATEGORIES } from '@toolnest/shared';
import { allTools } from '@/tools/registry';

const validCategories = new Set(TOOL_CATEGORIES.map((c) => c.name));

describe('tool registry', () => {
  it('loads tool modules from the filesystem', () => {
    expect(allTools.length).toBeGreaterThan(0);
  });

  it('registers every tool with valid metadata', () => {
    for (const tool of allTools) {
      expect(tool.path, tool.path).toMatch(/^\/\S+$/);
      expect(tool.name.length).toBeGreaterThan(0);
      expect(tool.description.length).toBeGreaterThan(0);
      expect(validCategories.has(tool.category)).toBe(true);
      expect(Array.isArray(tool.keywords)).toBe(true);
      expect(typeof tool.component).toBe('function');
    }
  });

  it('registers unique tool paths', () => {
    const paths = allTools.map((t) => t.path);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it('includes the tools touched by this change set', () => {
    const paths = new Set(allTools.map((t) => t.path));
    expect(paths.has('/base64-encoder')).toBe(true);
    expect(paths.has('/json-prettify')).toBe(true);
    expect(paths.has('/hello-world')).toBe(true);
  });
});
