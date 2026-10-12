import { defineTool } from '@toolnest/shared';

export const tool = defineTool({
  name: 'tools.etaCalculator.name',
  path: '/eta-calculator',
  description: 'tools.etaCalculator.description',
  category: 'datetime',
  tags: ['calculator', 'time'],
  keywords: ['eta', 'estimate', 'time', 'completion', 'progress', 'remaining'],
  component: () => import('./EtaCalculator.vue'),
  createdAt: '2026-09-18',
});
