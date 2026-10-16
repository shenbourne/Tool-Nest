export type TabToolPath = '/text-tools' | '/list-converter' | '/image-editor' | '/date-time' | '/data-converter' | '/table-tools' | '/json-prettify';
export interface TabDefinition {
  name: string;
  labelKey: string;
  shortLabelKey?: string;
  homeLabelKey: string;
  query?: Record<string,string>;
}
export interface ToolTabNavigation {
  defaultTab: string;
  tabs: readonly TabDefinition[];
  queryAliases?: Readonly<Record<string, string>>;
}

/** Navigation facts only: no page implementations, router or localization runtime. */
export const TOOL_TAB_NAVIGATION = {
  '/json-prettify': { defaultTab:'format', tabs:['format','minify','sort','escape','validate'].map(name=>({name,labelKey:`tools.jsonTools.${name}`,homeLabelKey:`tools.jsonTools.${name}`,query:{operation:name==='validate' ? 'format' : name}})) },
  '/table-tools': { defaultTab:'separator', tabs:['separator','transpose','insert','swap','check'].map(name => ({name,labelKey:`tools.tableTools.${name}`,homeLabelKey:`tools.tableTools.${name}`})) },
  '/data-converter': { defaultTab:'json-to-yaml', tabs:['json-to-yaml','yaml-to-json','json-to-csv','csv-to-json','xml-to-json'].map(name => { const [from,to]=name.split('-to-'); return {name,labelKey:`tools.dataConverter.${name}`,homeLabelKey:`tools.dataConverter.${name}`,query:{from,to}}; }) },
  '/text-tools': {
    defaultTab: 'replace',
    queryAliases: { diff: 'statistics' },
    tabs: [
      { name: 'replace', labelKey: 'tools.textWorkbench.replace', shortLabelKey: 'tools.textWorkbench.replace', homeLabelKey: 'tools.textWorkbench.replace' },
      { name: 'deduplicate', labelKey: 'tools.textWorkbench.deduplicate', shortLabelKey: 'tools.textWorkbench.deduplicate', homeLabelKey: 'tools.textWorkbench.deduplicate' },
      { name: 'reorder', labelKey: 'tools.textWorkbench.reorder', shortLabelKey: 'tools.textWorkbench.reorder', homeLabelKey: 'tools.textWorkbench.reorder' },
      { name: 'slice', labelKey: 'tools.textWorkbench.slice', shortLabelKey: 'tools.textWorkbench.slice', homeLabelKey: 'tools.textWorkbench.slice' },
      { name: 'statistics', labelKey: 'tools.textWorkbench.statistics', shortLabelKey: 'tools.textWorkbench.statsShort', homeLabelKey: 'tools.textWorkbench.statistics' },
    ],
  },
  '/list-converter': {
    defaultTab: 'convert',
    tabs: [
      { name: 'convert', labelKey: 'tools.listWorkbench.convert', shortLabelKey: 'tools.listWorkbench.convertShort', homeLabelKey: 'tools.listWorkbench.convert' },
      { name: 'reorder', labelKey: 'tools.listWorkbench.reorder', shortLabelKey: 'tools.listWorkbench.reorderShort', homeLabelKey: 'tools.listWorkbench.reorder' },
      { name: 'slice', labelKey: 'tools.listWorkbench.slice', shortLabelKey: 'tools.listWorkbench.sliceShort', homeLabelKey: 'tools.listWorkbench.slice' },
      { name: 'group', labelKey: 'tools.listWorkbench.group', shortLabelKey: 'tools.listWorkbench.groupShort', homeLabelKey: 'tools.listWorkbench.group' },
      { name: 'statistics', labelKey: 'tools.listWorkbench.statistics', shortLabelKey: 'tools.listWorkbench.statisticsShort', homeLabelKey: 'tools.listWorkbench.statistics' },
    ],
  },
  '/image-editor': {
    defaultTab: 'annotate',
    tabs: [
      { name: 'crop', labelKey: 'tools.imageEditor.tabcrop', homeLabelKey: 'tools.imageEditor.tabcrop' },
      { name: 'adjust', labelKey: 'tools.imageEditor.tabadjust', homeLabelKey: 'tools.imageEditor.tabadjust' },
      { name: 'annotate', labelKey: 'tools.imageEditor.tabannotate', homeLabelKey: 'tools.imageEditor.tabannotate' },
    ],
  },
  '/date-time': {
    defaultTab: 'duration',
    tabs: [
      { name: 'duration', labelKey: 'tools.dateTime.duration', shortLabelKey: 'tools.dateTime.durationShort', homeLabelKey: 'tools.dateTime.durationShort' },
      { name: 'weekday', labelKey: 'tools.dateWeekdayCalculator.name', shortLabelKey: 'tools.dateTime.weekdayShort', homeLabelKey: 'tools.dateTime.weekdayShort' },
      { name: 'interval', labelKey: 'tools.timeBetweenDates.name', shortLabelKey: 'tools.dateTime.intervalShort', homeLabelKey: 'tools.dateTime.intervalShort' },
      { name: 'discord', labelKey: 'tools.discordTimestamp.name', shortLabelKey: 'tools.dateTime.discordShort', homeLabelKey: 'tools.dateTime.discordShort' },
      { name: 'truncate', labelKey: 'tools.truncateClockTime.name', shortLabelKey: 'tools.dateTime.truncateShort', homeLabelKey: 'tools.dateTime.truncateShort' },
    ],
  },
} as const satisfies Record<TabToolPath, ToolTabNavigation>;

export type TabName<P extends TabToolPath> = typeof TOOL_TAB_NAVIGATION[P]['tabs'][number]['name'];

export function getToolTabNavigation(path: string): ToolTabNavigation | undefined {
  return Object.hasOwn(TOOL_TAB_NAVIGATION, path) ? TOOL_TAB_NAVIGATION[path as TabToolPath] : undefined;
}

export function projectToolTabs<P extends TabToolPath>(path: P, translate: (key: string) => string) {
  const navigation: ToolTabNavigation = TOOL_TAB_NAVIGATION[path];
  return navigation.tabs.map(tab => ({
    name: tab.name as TabName<P>,
    label: translate(tab.labelKey),
    ...(tab.shortLabelKey ? { shortLabel: translate(tab.shortLabelKey) } : {}),
  }));
}

/** Undefined means keep the caller's current tab; defaults apply only at initialization. */
export function resolveToolTab<P extends TabToolPath>(path: P, query: unknown): TabName<P> | undefined {
  if (typeof query !== 'string') return undefined;
  const navigation: ToolTabNavigation = TOOL_TAB_NAVIGATION[path];
  const aliases = navigation.queryAliases;
  const target = aliases && Object.hasOwn(aliases, query) ? aliases[query] : query;
  return navigation.tabs.find(tab => tab.name === target)?.name as TabName<P> | undefined;
}
