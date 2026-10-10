import { defineTool } from '@toolnest/shared';

export const tool = defineTool({
  name: 'tools.ipv4AddressConverter.name',
  path: '/ipv4-address-converter',
  description: 'tools.ipv4AddressConverter.description',
  category: 'network',
  tags: ['network', 'converter'],
  keywords: ['ipv4', 'address', 'converter', 'binary', 'hex', 'octal', 'decimal', 'ip'],
  component: () => import('./Ipv4AddressConverter.vue'),
  createdAt: '2026-09-18',
});
