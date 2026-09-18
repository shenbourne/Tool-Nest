import { defineTool } from '@toolnest/shared';

export const tool = defineTool({
  name: 'tools.jsonViewer.name',
  path: '/json-viewer',
  description: 'tools.jsonViewer.description',
  category: 'developer',
  tags: ['json', 'developer'],
  keywords: ['json', 'format', 'prettify', 'validate', 'viewer'],
  component: () => import('./JsonViewer.vue'),
  createdAt: '2026-09-18',
});
