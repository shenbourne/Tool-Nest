import { defineTool } from '@toolnest/shared';

export const tool = defineTool({
  name: 'tools.ipv4RangeExpander.name',
  path: '/ipv4-range-expander',
  description: 'tools.ipv4RangeExpander.description',
  category: 'network',
  tags: ['network', 'calculator'],
  keywords: ['ipv4', 'range', 'expander', 'cidr', 'subnet', 'ip'],
  component: () => import('./Ipv4RangeExpander.vue'),
  createdAt: '2026-09-18',
});
