import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.timeToSeconds.name', path: '/time-to-seconds',
  description: 'tools.timeToSeconds.description', category: 'datetime',
  tags: ["time","converter"], keywords: ["time","seconds","convert"],
  component: () => import('./TimeToSeconds.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
