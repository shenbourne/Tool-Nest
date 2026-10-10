import { defineTool } from '@toolnest/shared';

export const tool = defineTool({
  name: 'tools.bip39Generator.name',
  path: '/bip39-generator',
  description: 'tools.bip39Generator.description',
  category: 'crypto',
  tags: ['generator', 'security'],
  keywords: ['bip39', 'mnemonic', 'seed', 'wallet', 'crypto', 'passphrase'],
  component: () => import('./Bip39Generator.vue'),
  createdAt: '2026-09-17',
  runtimeLocation: 'browser',
});
