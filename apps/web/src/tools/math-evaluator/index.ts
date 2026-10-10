import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.mathEvaluator.name', path: '/math-evaluator',
  description: 'tools.mathEvaluator.description', category: 'math',
  tags: ['calculator'], keywords: ['math', 'expression', 'evaluate', 'calculate', 'formula'],
  component: () => import('./MathEvaluator.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
