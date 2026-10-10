import { defineTool } from '@toolnest/shared';

export const tool = defineTool({
  name: 'tools.jsonMinify.name',
  path: '/json-minify',
  description: 'tools.jsonMinify.description',
  category: 'developer',
  tags: ['json', 'developer'],
  keywords: ['json', 'minify', 'compress', 'remove', 'whitespace'],
  component: () => import('./JsonMinify.vue'),
  createdAt: '2026-09-18',
});
