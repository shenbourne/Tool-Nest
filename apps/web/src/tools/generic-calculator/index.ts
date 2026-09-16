import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.genericCalculator.name', path: '/generic-calculator',
  description: 'tools.genericCalculator.description', category: 'math',
  tags: ["math"], keywords: ["calculator","math","compute","arithmetic"],
  component: () => import('./GenericCalculator.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
