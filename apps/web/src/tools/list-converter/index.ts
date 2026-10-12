import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.listConverter.name', path: '/list-converter',
  description: 'tools.listConverter.description', category: 'data',
  tags: ['converter', 'text', 'list'], keywords: ['list', 'convert', 'sort', 'deduplicate', 'separator', 'csv'],
  component: () => import('./ListConverter.vue'), createdAt: '2026-09-18', runtimeLocation: 'browser',
});
