import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.listConverter.name', path: '/list-converter',
  description: 'tools.listConverter.description', category: 'data',
  redirectFrom: ['/list-sort', '/list-wrap', '/text-join'],
  aliases: ['列表排序', '列表包装', '文本连接', 'List Sort', 'List Wrap', 'Text Join'],
  tags: ['converter', 'text', 'list'], keywords: ['list', 'convert', 'sort', 'wrap', 'join', 'deduplicate', 'separator', 'csv'],
  component: () => import('./ListConverter.vue'), createdAt: '2026-09-18', runtimeLocation: 'browser',
});
