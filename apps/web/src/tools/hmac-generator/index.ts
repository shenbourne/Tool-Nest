import { defineTool } from '@toolnest/shared';

export const tool = defineTool({
  name: 'tools.hmacGenerator.name',
  path: '/hmac-generator',
  description: 'tools.hmacGenerator.description',
  category: 'crypto',
  tags: ['security', 'encoder'],
  keywords: ['hmac', 'hash', 'mac', 'md5', 'sha', 'secret'],
  component: () => import('./HmacGenerator.vue'),
  createdAt: '2026-09-17',
  runtimeLocation: 'browser',
});
