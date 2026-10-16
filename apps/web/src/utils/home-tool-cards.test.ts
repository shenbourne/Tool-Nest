import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { allTools } from '@/tools/registry';
import { isLargeHomeTool, largeHomeToolsFirst } from './home-tool-cards';
import { TOOL_TAB_NAVIGATION, resolveToolTab, type TabToolPath } from './tool-tab-navigation';

describe('homepage tool cards', () => {
  it('opens each JSON shortcut with its accepted operation query',()=>{
    expect(TOOL_TAB_NAVIGATION['/json-prettify'].tabs.map(tab=>tab.query)).toEqual(['format','minify','sort','escape','format'].map(operation=>({operation})));
  });
  it('preserves conversion source/target queries after shared navigation integration',()=>{
    for(const tab of TOOL_TAB_NAVIGATION['/data-converter'].tabs) {
      const [from,to]=tab.name.split('-to-');
      expect(tab.query).toEqual({from,to});
    }
  });
  it('places large cards first while retaining order and the original collection', () => {
    const ordinary = allTools.filter(tool => !isLargeHomeTool(tool)).slice(0, 2);
    const large = allTools.filter(isLargeHomeTool);
    const input = [ordinary[0], large[0], ordinary[1], ...large.slice(1)];
    const original = [...input];
    expect(largeHomeToolsFirst(input)).toEqual([...large, ...ordinary]);
    expect(input).toEqual(original);
  });

  it('keeps all tools when no cards expand', () => {
    const input = allTools.filter(tool => !isLargeHomeTool(tool));
    expect(largeHomeToolsFirst(input)).toEqual(input);
    expect(largeHomeToolsFirst([])).toEqual([]);
  });

  it('provides page-accepted targets for each registered homepage workbench', () => {
    for (const path of Object.keys(TOOL_TAB_NAVIGATION) as TabToolPath[]) {
      const tool = allTools.find(tool => tool.path === path);
      expect(tool).toBeDefined();
      expect(isLargeHomeTool(tool!)).toBe(true);
      for (const tab of TOOL_TAB_NAVIGATION[path].tabs) expect(resolveToolTab(path, tab.name)).toBe(tab.name);
    }
  });

  it('binds homepage and all four pages to shared navigation facts', () => {
    const callers = [
      ['/text-tools', 'text-workbench/TextWorkbench.vue'],
      ['/list-converter', 'list-converter/ListConverter.vue'],
      ['/image-editor', 'image-editor/ImageEditor.vue'],
      ['/date-time', 'date-time/DateTime.vue'],
    ];
    for (const [path, file] of callers) {
      const source = readFileSync(new URL(`../tools/${file}`, import.meta.url), 'utf8');
      expect(source, file).toContain(`projectToolTabs('${path}', t)`);
      expect(source, file).toContain(`resolveToolTab('${path}',`);
      expect(source, file).toContain(`TOOL_TAB_NAVIGATION['${path}'].defaultTab`);
    }
    const card = readFileSync(new URL('../components/ToolCard.vue', import.meta.url), 'utf8');
    expect(card).toContain('getToolTabNavigation(props.tool.path)');
    expect(card).toContain('t(tab.homeLabelKey)');
    expect(card).not.toContain('labelPrefix');
  });
});
