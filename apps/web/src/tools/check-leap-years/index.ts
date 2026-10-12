import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.checkLeapYears.name', path: '/check-leap-years',
  description: 'tools.checkLeapYears.description', category: 'datetime',
  tags: ["time","check"], keywords: ["leap","year","calendar"],
  component: () => import('./CheckLeapYears.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
