import { defineTool } from '@toolnest/shared';

export const tool = defineTool({
  name: 'tools.mtrTest.name',
  path: '/mtr-test',
  description: 'tools.mtrTest.description',
  category: 'network-test',
  tags: ['network', 'check'],
  keywords: ['mtr', 'traceroute', 'route', 'network', 'path'],
  component: () => import('./MtrTest.vue'),
  createdAt: '2026-09-18',
  runtimeLocation: 'browser',
});
