import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.quoteGenerator.name', path: '/quote-generator',
  description: 'tools.quoteGenerator.description', category: 'text',
  tags: ["text","generator"], keywords: ["quote","inspiration","programming"],
  component: () => import('./QuoteGenerator.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
