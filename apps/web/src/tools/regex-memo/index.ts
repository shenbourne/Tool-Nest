import { defineTool } from '@toolnest/shared';

export const tool = defineTool({
  name: 'tools.regexMemo.name',
  path: '/regex-memo',
  description: 'tools.regexMemo.description',
  category: 'developer',
  tags: ['developer'],
  keywords: ['regex', 'regular', 'expression', 'javascript', 'memo', 'cheatsheet', 'pattern'],
  component: () => import('./RegexMemo.vue'),
  createdAt: '2026-09-18',
});
