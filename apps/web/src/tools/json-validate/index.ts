import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.jsonValidate.name', path: '/json-validate',
  description: 'tools.jsonValidate.description', category: 'developer',
  tags: ["json","validator"], keywords: ["json","validate","check","error"],
  component: () => import('./JsonValidate.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
