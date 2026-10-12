import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.secondsToTime.name', path: '/seconds-to-time',
  description: 'tools.secondsToTime.description', category: 'datetime',
  tags: ["time","converter"], keywords: ["seconds","time","convert","hh:mm:ss"],
  component: () => import('./SecondsToTime.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
