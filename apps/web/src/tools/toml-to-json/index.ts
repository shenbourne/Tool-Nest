import { defineTool } from '@toolnest/shared';

export const tool = defineTool({
  name: 'tools.tomlToJson.name',
  path: '/toml-to-json',
  description: 'tools.tomlToJson.description',
  category: 'data',
  tags: ['converter', 'toml', 'json'],
  keywords: ['toml', 'json', 'convert', 'parse'],
  component: () => import('./TomlToJson.vue'),
  createdAt: '2026-09-18',
});
