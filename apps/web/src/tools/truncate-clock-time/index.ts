import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.truncateClockTime.name', path: '/truncate-clock-time',
  description: 'tools.truncateClockTime.description', category: 'measurement',
  tags: ["time"], keywords: ["time","truncate","round","clock"],
  component: () => import('./TruncateClockTime.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
