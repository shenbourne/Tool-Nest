import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.emailExtractor.name', path: '/email-extractor',
  description: 'tools.emailExtractor.description', category: 'text',
  tags: ["text","extract"], keywords: ["email","extract","regex","mail"],
  component: () => import('./EmailExtractor.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
