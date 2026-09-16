import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.removeDuplicateLines.name', path: '/remove-duplicate-lines',
  description: 'tools.removeDuplicateLines.description', category: 'text',
  tags: ["text"], keywords: ["duplicate","remove","unique","dedup"],
  component: () => import('./RemoveDuplicateLines.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
