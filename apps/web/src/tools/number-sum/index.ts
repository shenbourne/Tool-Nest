import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.numberSum.name', path: '/number-sum',
  description: 'tools.numberSum.description', category: 'math',
  tags: ["math","statistics"], keywords: ["sum","average","min","max","median","statistics"],
  component: () => import('./NumberSum.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
