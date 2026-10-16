import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.listConverter.name', path: '/list-converter',
  description: 'tools.listConverter.description', category: 'text',
  redirectFrom: ['/list-sort', '/list-wrap', '/text-join', '/list-find-popular', '/list-group', '/list-reverse', '/list-rotate', '/list-shuffle', '/list-truncate', '/list-unwrap'],
  tags: ['converter', 'text', 'list', 'statistics', 'random'], keywords: ['list', 'convert', 'sort', 'wrap', 'join', 'deduplicate', 'separator', 'csv', 'reverse', 'rotate', 'shuffle', 'truncate', 'unwrap', 'group', 'frequency', 'popular'],
  component: () => import('./ListConverter.vue'), createdAt: '2026-09-18', runtimeLocation: 'browser',
});
