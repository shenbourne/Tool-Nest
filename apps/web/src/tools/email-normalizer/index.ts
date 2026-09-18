import { defineTool } from '@toolnest/shared';

export const tool = defineTool({
  name: 'tools.emailNormalizer.name',
  path: '/email-normalizer',
  description: 'tools.emailNormalizer.description',
  category: 'developer',
  tags: ['developer', 'validator'],
  keywords: ['email', 'normalize', 'gmail', 'alias', 'format'],
  component: () => import('./EmailNormalizer.vue'),
  createdAt: '2026-09-18',
});
