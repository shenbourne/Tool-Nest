import { describe, it, expect } from 'vitest';
import { TOOL_CATEGORIES } from '@toolnest/shared';
import { allTools } from '@/tools/registry';

const validCategories = new Set(TOOL_CATEGORIES.map((c) => c.name));

describe('tool registry', () => {
  it('excludes the removed list duplicate tool', () => {
    expect(allTools.some(tool => tool.path === '/list-duplicate' || tool.redirectFrom?.includes('/list-duplicate'))).toBe(false);
  });
  it('consolidates duplicate CSV, JSON, dedup and secret tools with legacy URLs', () => {
    const groups: Record<string, string[]> = {
      '/list-converter': ['/list-sort', '/list-wrap', '/text-join'],
      '/csv-rows-to-columns': ['/csv-transpose'],
      '/json-prettify': ['/json-stringify', '/json-viewer'],
      '/remove-duplicate-lines': ['/list-find-unique'],
      '/password-generator': ['/token-generator'],
    };
    for (const [canonical, legacy] of Object.entries(groups)) {
      const retained = allTools.filter(tool => tool.path === canonical);
      expect(retained).toHaveLength(1);
      for (const path of legacy) {
        expect(allTools.some(tool => tool.path === path)).toBe(false);
        expect(retained[0].redirectFrom).toContain(path);
      }
    }
    const paths = allTools.flatMap(tool => [tool.path, ...(tool.redirectFrom ?? [])]);
    expect(new Set(paths).size).toBe(paths.length);
  });
  it('consolidates nine time cards and retains every old URL', () => {
    const merged = allTools.filter(tool => tool.path === '/date-time');
    expect(merged).toHaveLength(1);
    const legacy = ['/date-weekday-calculator', '/days-to-hours', '/discord-timestamp', '/hours-to-days', '/seconds-to-time', '/time-between-dates', '/time-to-decimal', '/time-to-seconds', '/truncate-clock-time'];
    for (const path of legacy) {
      expect(allTools.some(tool => tool.path === path)).toBe(false);
      expect(merged[0].redirectFrom).toContain(path);
    }
  });
  it('consolidates calculator discovery and preserves the legacy URL', () => {
    expect(allTools.filter(tool => tool.path === '/generic-calculator')).toHaveLength(1);
    expect(allTools.some(tool => tool.path === '/math-evaluator')).toBe(false);
    expect(allTools.find(tool => tool.path === '/generic-calculator')?.redirectFrom).toContain('/math-evaluator');
  });
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
