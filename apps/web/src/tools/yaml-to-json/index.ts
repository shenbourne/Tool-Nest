import { defineTool } from '@toolnest/shared';

export const tool = defineTool({
  name: 'tools.yamlToJson.name',
  path: '/yaml-to-json',
  description: 'tools.yamlToJson.description',
  category: 'data',
  tags: ['converter', 'yaml', 'json'],
  keywords: ['yaml', 'json', 'convert', 'parse'],
  component: () => import('./YamlToJson.vue'),
  createdAt: '2026-09-18',
});
