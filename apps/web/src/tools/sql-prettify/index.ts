import { defineTool } from '@toolnest/shared';

export const tool = defineTool({
  name: 'tools.sqlPrettify.name',
  path: '/sql-prettify',
  description: 'tools.sqlPrettify.description',
  category: 'developer',
  tags: ['developer', 'parser'],
  keywords: ['sql', 'format', 'prettify', 'query'],
  component: () => import('./SqlPrettify.vue'),
  createdAt: '2026-09-18',
});
