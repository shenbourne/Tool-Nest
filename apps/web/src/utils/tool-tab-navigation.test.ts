import { describe, expect, it } from 'vitest';
import zh from '@/locales/zh.json';
import en from '@/locales/en.json';
import { TOOL_TAB_NAVIGATION, getToolTabNavigation, projectToolTabs, resolveToolTab, type TabToolPath } from './tool-tab-navigation';

const paths = ['/text-tools', '/list-converter', '/image-editor', '/date-time'] as const;
function translation(catalog: unknown, key: string): unknown {
  return key.split('.').reduce<unknown>((value, part) => value && typeof value === 'object' ? (value as Record<string, unknown>)[part] : undefined, catalog);
}

describe('tool tab navigation', () => {
  it('keeps the four ordered tab sets and their existing defaults', () => {
    expect(Object.keys(TOOL_TAB_NAVIGATION)).toEqual(['/json-prettify','/table-tools','/data-converter',...paths]);
    const expected = [
      ['replace','deduplicate','reorder','slice','statistics'],
      ['convert','reorder','slice','group','statistics'],
      ['crop','adjust','annotate'],
      ['duration','weekday','interval','discord','truncate'],
    ];
    paths.forEach((path, index) => {
      const config = getToolTabNavigation(path)!;
      expect(config.tabs.map(tab => tab.name)).toEqual(expected[index]);
      expect(new Set(config.tabs.map(tab => tab.name)).size).toBe(config.tabs.length);
      expect(config.tabs.some(tab => tab.name === config.defaultTab)).toBe(true);
    });
    expect(paths.map(path => TOOL_TAB_NAVIGATION[path].defaultTab)).toEqual(['replace','convert','annotate','duration']);
  });
  it.each(paths)('accepts every homepage target using the page resolver for %s', path => {
    for (const tab of TOOL_TAB_NAVIGATION[path].tabs) expect(resolveToolTab(path, tab.name)).toBe(tab.name);
  });
  it('recognizes only registered paths, including prototype-like paths', () => {
    for (const path of ['/unknown', '__proto__', 'toString', 'constructor']) expect(getToolTabNavigation(path)).toBeUndefined();
  });
  it('preserves the text diff alias and rejects untrusted query shapes', () => {
    expect(resolveToolTab('/text-tools', 'diff')).toBe('statistics');
    for (const path of paths) {
      for (const value of [undefined, null, '', 'missing', ['slice'], ['crop','adjust'], 1, {}, '__proto__', 'toString']) {
        expect(resolveToolTab(path, value)).toBeUndefined();
      }
    }
    expect(resolveToolTab('/image-editor', 'diff')).toBeUndefined();
  });
  it('retains explicit full, short and homepage labels in both languages', () => {
    for (const catalog of [zh, en]) {
      for (const path of paths) {
        for (const tab of getToolTabNavigation(path)!.tabs) {
          for (const key of [tab.labelKey, tab.shortLabelKey, tab.homeLabelKey].filter((key): key is string => !!key)) {
            expect(translation(catalog, key), key).toBeTypeOf('string');
          }
        }
      }
    }
    const weekday = TOOL_TAB_NAVIGATION['/date-time'].tabs[1];
    expect(weekday).toMatchObject({ labelKey: 'tools.dateWeekdayCalculator.name', shortLabelKey: 'tools.dateTime.weekdayShort', homeLabelKey: 'tools.dateTime.weekdayShort' });
    expect(TOOL_TAB_NAVIGATION['/text-tools'].tabs[4].shortLabelKey).toBe('tools.textWorkbench.statsShort');
  });
  it('projects independent display values without changing navigation definitions', () => {
    const path: TabToolPath = '/list-converter';
    const projected = projectToolTabs(path, key => `translated:${key}`);
    expect(projected[0]).toEqual({ name: 'convert', label: 'translated:tools.listWorkbench.convert', shortLabel: 'translated:tools.listWorkbench.convertShort' });
    expect(projected.map(tab => tab.name)).toEqual(TOOL_TAB_NAVIGATION[path].tabs.map(tab => tab.name));
    projected[0].label = 'changed'; expect(projectToolTabs(path, key => key)[0].label).toBe('tools.listWorkbench.convert');
    expect(projectToolTabs('/image-editor', key => key)[0].label).toBe('tools.imageEditor.tabcrop');
  });
});
