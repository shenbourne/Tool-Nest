import { defineTool } from '@toolnest/shared';

export const tool = defineTool({
  name: 'tools.jsonToXml.name',
  path: '/json-to-xml',
  description: 'tools.jsonToXml.description',
  category: 'data',
  tags: ['converter', 'xml', 'json'],
  keywords: ['json', 'xml', 'convert'],
  component: () => import('./JsonToXml.vue'),
  createdAt: '2026-09-18',
});
