import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.percentageCalc.name', path: '/percentage-calculator',
  description: 'tools.percentageCalc.description', category: 'math',
  tags: ['calculator'], keywords: ['percentage', 'percent', 'calculate', 'proportion'],
  component: () => import('./PercentageCalc.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
