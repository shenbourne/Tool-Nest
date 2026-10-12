import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.temperature.name', path: '/temperature-converter',
  description: 'tools.temperature.description', category: 'math',
  tags: ['converter', 'calculator'], keywords: ['temperature', 'celsius', 'fahrenheit', 'kelvin', 'convert'],
  component: () => import('./Temperature.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
