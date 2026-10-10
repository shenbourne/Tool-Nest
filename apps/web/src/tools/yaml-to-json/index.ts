import { defineTool } from '@toolnest/shared';

export const tool = defineTool({
  name: 'tools.yamlToJson.name',
  path: '/yaml-to-json',
  description: 'tools.yamlToJson.description',
  category: 'converter',
  tags: ['converter', 'yaml'],
  keywords: ['yaml', 'json', 'convert', 'parse'],
  component: () => import('./YamlToJson.vue'),
  createdAt: '2026-09-18',
});
