import { defineTool } from '@toolnest/shared';

export const tool = defineTool({
  name: 'tools.macAddressGenerator.name',
  path: '/mac-address-generator',
  description: 'tools.macAddressGenerator.description',
  category: 'network',
  tags: ['network', 'generator', 'random'],
  keywords: ['mac', 'address', 'generator', 'oui', 'random', 'network'],
  component: () => import('./MacAddressGenerator.vue'),
  createdAt: '2026-09-18',
});
