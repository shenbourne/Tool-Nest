import { defineTool } from '@toolnest/shared';

export const tool = defineTool({
  name: 'tools.jsonToToml.name',
  path: '/json-to-toml',
  description: 'tools.jsonToToml.description',
  category: 'data',
  tags: ['converter', 'toml', 'json'],
  keywords: ['json', 'toml', 'convert'],
  component: () => import('./JsonToToml.vue'),
  createdAt: '2026-09-18',
});
