import { defineTool } from '@toolnest/shared';

export const tool = defineTool({
  name: 'tools.ipv6UlaGenerator.name',
  path: '/ipv6-ula-generator',
  description: 'tools.ipv6UlaGenerator.description',
  category: 'network',
  tags: ['network', 'generator'],
  keywords: ['ipv6', 'ula', 'unique local address', 'rfc4193', 'generator'],
  component: () => import('./Ipv6UlaGenerator.vue'),
  createdAt: '2026-09-18',
});
