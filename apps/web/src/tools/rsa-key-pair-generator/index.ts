import { defineTool } from '@toolnest/shared';

export const tool = defineTool({
  name: 'tools.rsaKeyPair.name',
  path: '/rsa-key-pair-generator',
  description: 'tools.rsaKeyPair.description',
  category: 'crypto',
  tags: ['generator', 'security'],
  keywords: ['rsa', 'key', 'pair', 'public', 'private', 'pem'],
  component: () => import('./RsaKeyPair.vue'),
  createdAt: '2026-09-17',
  runtimeLocation: 'browser',
});
