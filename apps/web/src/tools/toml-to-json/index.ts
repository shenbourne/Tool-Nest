import { defineTool } from '@toolnest/shared';

export const tool = defineTool({
  name: 'tools.tomlToJson.name',
  path: '/toml-to-json',
  description: 'tools.tomlToJson.description',
  category: 'converter',
  tags: ['converter', 'toml'],
  keywords: ['toml', 'json', 'convert', 'parse'],
  component: () => import('./TomlToJson.vue'),
  createdAt: '2026-09-18',
});
