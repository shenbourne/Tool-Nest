import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.daysToHours.name', path: '/days-to-hours',
  description: 'tools.daysToHours.description', category: 'measurement',
  tags: ["time","converter"], keywords: ["days","hours","convert","time"],
  component: () => import('./DaysToHours.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
