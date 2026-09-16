import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.chronometer.name', path: '/chronometer',
  description: 'tools.chronometer.description', category: 'measurement',
  tags: ['calculator'], keywords: ['stopwatch', 'timer', 'chronometer', 'time', 'measure'],
  component: () => import('./Chronometer.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
