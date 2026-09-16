import { defineTool } from '@toolnest/shared';
export { hashText, hashAlgorithms, type HashAlgorithm } from './hash.service';

export const tool = defineTool({
  name: 'tools.hashText.name',
  path: '/hash-text',
  description: 'tools.hashText.description',
  category: 'crypto',
  tags: ['security', 'encoder'],
  keywords: ['hash', 'md5', 'sha1', 'sha256', 'sha512', 'digest', 'crypto'],
  component: () => import('./HashText.vue'),
  createdAt: '2026-09-17',
  runtimeLocation: 'browser',
});
