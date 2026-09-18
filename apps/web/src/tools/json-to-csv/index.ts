import { defineTool } from '@toolnest/shared';

export const tool = defineTool({
  name: 'tools.jsonToCsv.name',
  path: '/json-to-csv',
  description: 'tools.jsonToCsv.description',
  category: 'developer',
  tags: ['json', 'csv', 'developer'],
  keywords: ['json', 'csv', 'convert', 'export'],
  component: () => import('./JsonToCsv.vue'),
  createdAt: '2026-09-18',
});
