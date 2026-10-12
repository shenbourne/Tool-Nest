import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.dateWeekdayCalculator.name', path: '/date-weekday-calculator',
  description: 'tools.dateWeekdayCalculator.description', category: 'datetime',
  tags: ["time","calculator"], keywords: ["date","weekday","day","calendar"],
  component: () => import('./DateWeekdayCalculator.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
