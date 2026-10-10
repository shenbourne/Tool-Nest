import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.listUnwrap.name', path: '/list-unwrap',
  description: 'tools.listUnwrap.description', category: 'data',
  tags: ["list"], keywords: ["list","unwrap","remove","strip"],
  component: () => import('./ListUnwrap.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
