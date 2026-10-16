import { defineTool } from '@toolnest/shared';
import { legacyPaths } from './formats';
export const tool = defineTool({
  name: 'tools.dataConverter.name', path: '/data-converter', description: 'tools.dataConverter.description', category: 'data',
  tags: ['converter','json','yaml','toml','xml','csv','tsv'], keywords: ['convert','parse','数据','格式','转换'],
  redirectFrom: legacyPaths,
  component: () => import('./DataConverter.vue'), createdAt: '2026-10-14', runtimeLocation: 'browser',
});

