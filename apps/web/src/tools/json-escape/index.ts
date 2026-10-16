import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.jsonEscape.name', path: '/json-escape',
  description: 'tools.jsonEscape.description', category: 'data',
  tags: ["json","developer"], keywords: ["json","escape","unescape","string"],
  component: () => import('./JsonEscape.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
