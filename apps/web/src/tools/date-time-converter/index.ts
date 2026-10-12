import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.dateTimeConverter.name', path: '/date-time-converter',
  description: 'tools.dateTimeConverter.description', category: 'datetime',
  tags: ['converter', 'time'], keywords: ['date', 'time', 'datetime', 'timestamp', 'unix', 'convert', 'iso8601'],
  component: () => import('./DateTimeConverter.vue'), createdAt: '2026-09-18', runtimeLocation: 'browser',
});
