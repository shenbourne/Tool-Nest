import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.removeDuplicateLines.name', path: '/remove-duplicate-lines',
  description: 'tools.removeDuplicateLines.description', category: 'text',
  redirectFrom: ['/list-find-unique'],
  aliases: ['列表去重', 'List Unique', 'List Find Unique', 'Find Unique List Items'],
  tags: ["text"], keywords: ["duplicate","remove","unique","dedup"],
  component: () => import('./RemoveDuplicateLines.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
