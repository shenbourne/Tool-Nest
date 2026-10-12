import { defineTool } from '@toolnest/shared';

export const tool = defineTool({
  name: 'tools.globalLatencyTest.name',
  path: '/global-latency-test',
  description: 'tools.globalLatencyTest.description',
  category: 'network',
  tags: ['network', 'check'],
  keywords: ['latency', 'global', 'dns', 'test', 'speed'],
  component: () => import('./GlobalLatencyTest.vue'),
  createdAt: '2026-09-18',
  runtimeLocation: 'browser',
});
