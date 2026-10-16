import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.hoursToDays.name', path: '/hours-to-days',
  description: 'tools.hoursToDays.description', category: 'datetime',
  tags: ["time","converter"], keywords: ["hours","days","convert","time"],
  component: () => import('./HoursToDays.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
