import { defineTool } from '@toolnest/shared';

export const tool = defineTool({
  name: 'tools.jsonToCsv.name',
  path: '/json-to-csv',
  description: 'tools.jsonToCsv.description',
  category: 'data',
  tags: ['json', 'csv', 'developer', 'converter'],
  keywords: ['json', 'csv', 'convert', 'export'],
  component: () => import('./JsonToCsv.vue'),
  createdAt: '2026-09-18',
});
