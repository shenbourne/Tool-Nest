import { defineTool } from '@toolnest/shared';

export const tool = defineTool({
  name: 'tools.crontabGenerator.name',
  path: '/crontab-generator',
  description: 'tools.crontabGenerator.description',
  category: 'developer',
  tags: ['developer', 'time', 'generator'],
  keywords: ['cron', 'crontab', 'schedule', 'cronjob', 'expression', 'timer', 'periodic'],
  component: () => import('./CrontabGenerator.vue'),
  createdAt: '2026-09-18',
});
