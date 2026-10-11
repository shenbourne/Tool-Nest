import { defineTool } from '@toolnest/shared';

export const tool = defineTool({
  name: 'tools.pingTest.name',
  path: '/ping-test',
  description: 'tools.pingTest.description',
  category: 'network-test',
  tags: ['network', 'check'],
  keywords: ['ping', 'latency', 'test', 'network', 'icmp'],
  component: () => import('./PingTest.vue'),
  createdAt: '2026-09-18',
  runtimeLocation: 'backend',
});
