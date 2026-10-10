import { defineTool } from '@toolnest/shared';

export const tool = defineTool({
  name: 'tools.ipv4SubnetCalculator.name',
  path: '/ipv4-subnet-calculator',
  description: 'tools.ipv4SubnetCalculator.description',
  category: 'network',
  tags: ['network', 'calculator'],
  keywords: ['ipv4', 'subnet', 'cidr', 'network', 'mask', 'broadcast', 'ip'],
  component: () => import('./Ipv4SubnetCalculator.vue'),
  createdAt: '2026-09-18',
});
