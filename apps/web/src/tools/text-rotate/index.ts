import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.textRotate.name', path: '/text-rotate',
  description: 'tools.textRotate.description', category: 'text',
  tags: ["text"], keywords: ["rotate","shift","lines"],
  component: () => import('./TextRotate.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
