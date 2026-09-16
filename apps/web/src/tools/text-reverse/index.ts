import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.textReverse.name', path: '/text-reverse',
  description: 'tools.textReverse.description', category: 'text',
  tags: ["text"], keywords: ["reverse","flip","invert"],
  component: () => import('./TextReverse.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
