import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.timeBetweenDates.name', path: '/time-between-dates',
  description: 'tools.timeBetweenDates.description', category: 'measurement',
  tags: ["time","calculator"], keywords: ["time","between","dates","difference","duration"],
  component: () => import('./TimeBetweenDates.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
