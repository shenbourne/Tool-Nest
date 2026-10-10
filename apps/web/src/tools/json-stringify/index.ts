import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.jsonStringify.name', path: '/json-stringify',
  description: 'tools.jsonStringify.description', category: 'developer',
  tags: ["json","developer"], keywords: ["json","stringify","format","serialize"],
  component: () => import('./JsonStringify.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
