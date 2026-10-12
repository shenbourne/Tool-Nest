import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.numberGenerator.name', path: '/number-generator',
  description: 'tools.numberGenerator.description', category: 'math',
  tags: ['generator', 'number'], keywords: ["number","sequence","generate","fibonacci","prime"],
  component: () => import('./NumberGenerator.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
