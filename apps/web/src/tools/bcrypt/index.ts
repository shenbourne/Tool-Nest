import { defineTool } from '@toolnest/shared';

export const tool = defineTool({
  name: 'tools.bcrypt.name',
  path: '/bcrypt',
  description: 'tools.bcrypt.description',
  category: 'crypto',
  tags: ['security'],
  keywords: ['bcrypt', 'hash', 'password', 'salt', 'compare'],
  component: () => import('./BcryptTool.vue'),
  createdAt: '2026-09-17',
  runtimeLocation: 'browser',
});
