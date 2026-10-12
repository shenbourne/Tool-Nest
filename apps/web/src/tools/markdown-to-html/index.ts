import { defineTool } from '@toolnest/shared';

export const tool = defineTool({
  name: 'tools.markdownToHtml.name',
  path: '/markdown-to-html',
  description: 'tools.markdownToHtml.description',
  category: 'web',
  tags: ['converter', 'text'],
  keywords: ['markdown', 'html', 'convert', 'render', 'preview'],
  component: () => import('./MarkdownToHtml.vue'),
  createdAt: '2026-09-18',
});
