import { defineTool } from '@toolnest/shared';

export const tool = defineTool({
  name: 'tools.xmlToJson.name',
  path: '/xml-to-json',
  description: 'tools.xmlToJson.description',
  category: 'converter',
  tags: ['converter', 'xml'],
  keywords: ['xml', 'json', 'convert', 'parse'],
  component: () => import('./XmlToJson.vue'),
  createdAt: '2026-09-18',
});
