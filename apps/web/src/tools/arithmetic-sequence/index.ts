import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.arithmeticSequence.name', path: '/arithmetic-sequence',
  description: 'tools.arithmeticSequence.description', category: 'math',
  tags: ["math","generator"], keywords: ["arithmetic","sequence","series","progression"],
  component: () => import('./ArithmeticSequence.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
