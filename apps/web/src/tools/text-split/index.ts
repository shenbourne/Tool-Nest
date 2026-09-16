import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.textSplit.name', path: '/text-split',
  description: 'tools.textSplit.description', category: 'text',
  tags: ["text"], keywords: ["split","delimiter","separate"],
  component: () => import('./TextSplit.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
