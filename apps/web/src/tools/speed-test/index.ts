import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.speedTest.name', path: '/speed-test',
  description: 'tools.speedTest.description', category: 'network-test',
  tags: ["browser"], keywords: ["speed","test","bandwidth","download","latency"],
  component: () => import('./SpeedTest.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
