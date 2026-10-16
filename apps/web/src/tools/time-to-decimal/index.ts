import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.timeToDecimal.name', path: '/time-to-decimal',
  description: 'tools.timeToDecimal.description', category: 'datetime',
  tags: ["time","converter"], keywords: ["time","decimal","convert","hours"],
  component: () => import('./TimeToDecimal.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
