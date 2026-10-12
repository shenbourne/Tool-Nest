import { defineTool } from '@toolnest/shared';

export const tool = defineTool({
  name: 'tools.benchmarkBuilder.name',
  path: '/benchmark-builder',
  description: 'tools.benchmarkBuilder.description',
  category: 'developer',
  tags: ['developer', 'calculator'],
  keywords: ['benchmark', 'performance', 'measure', 'javascript', 'speed', 'test'],
  component: () => import('./BenchmarkBuilder.vue'),
  createdAt: '2026-09-18',
});
