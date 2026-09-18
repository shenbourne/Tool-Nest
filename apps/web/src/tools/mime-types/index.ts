import { defineTool } from '@toolnest/shared';

export const tool = defineTool({
  name: 'tools.mimeTypes.name',
  path: '/mime-types',
  description: 'tools.mimeTypes.description',
  category: 'web',
  tags: ['developer', 'parser'],
  keywords: ['mime', 'type', 'extension', 'content-type', 'media', 'file'],
  component: () => import('./MimeTypes.vue'),
  createdAt: '2026-09-18',
});
