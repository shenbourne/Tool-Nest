import { defineTool } from '@toolnest/shared';

export const tool = defineTool({
  name: 'tools.encryption.name',
  path: '/encryption',
  description: 'tools.encryption.description',
  category: 'crypto',
  tags: ['security', 'encoder'],
  keywords: ['encrypt', 'decrypt', 'aes', 'cipher', 'crypto', 'tripledes', 'rabbit', 'rc4'],
  component: () => import('./EncryptionTool.vue'),
  createdAt: '2026-09-17',
  runtimeLocation: 'browser',
});
