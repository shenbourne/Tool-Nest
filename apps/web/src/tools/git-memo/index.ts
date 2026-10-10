import { defineTool } from '@toolnest/shared';

export const tool = defineTool({
  name: 'tools.gitMemo.name',
  path: '/git-memo',
  description: 'tools.gitMemo.description',
  category: 'developer',
  tags: ['developer'],
  keywords: ['git', 'commands', 'cheatsheet', 'reference', 'push', 'pull', 'commit', 'rebase', 'merge'],
  component: () => import('./GitMemo.vue'),
  createdAt: '2026-09-18',
});
