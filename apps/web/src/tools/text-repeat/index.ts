import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.textRepeat.name', path: '/text-repeat',
  description: 'tools.textRepeat.description', category: 'text',
  tags: ["text"], keywords: ["repeat","duplicate","multiply"],
  component: () => import('./TextRepeat.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
