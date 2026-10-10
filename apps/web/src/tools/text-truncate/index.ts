import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.textTruncate.name', path: '/text-truncate',
  description: 'tools.textTruncate.description', category: 'text',
  tags: ["text"], keywords: ["truncate","cut","shorten","limit"],
  component: () => import('./TextTruncate.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
