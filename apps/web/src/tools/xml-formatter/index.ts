import { defineTool } from '@toolnest/shared';

export const tool = defineTool({
  name: 'tools.xmlFormatter.name',
  path: '/xml-formatter',
  description: 'tools.xmlFormatter.description',
  category: 'developer',
  tags: ['xml', 'developer'],
  keywords: ['xml', 'format', 'beautify', 'minify', 'indent'],
  component: () => import('./XmlFormatter.vue'),
  createdAt: '2026-09-18',
});
