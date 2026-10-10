import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.textJoin.name', path: '/text-join',
  description: 'tools.textJoin.description', category: 'text',
  tags: ["text"], keywords: ["join","concat","separator","delimiter"],
  component: () => import('./TextJoin.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
