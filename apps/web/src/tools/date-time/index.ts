import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.dateTime.name', path: '/date-time', description: 'tools.dateTime.description',
  category: 'measurement', tags: ['time', 'converter', 'calculator', 'discord'],
  keywords: ['days', 'hours', 'seconds', 'weekday', 'duration', 'decimal', 'timestamp', '日期', '星期', '秒', '小时', '截断'],
  redirectFrom: ["/date-weekday-calculator","/days-to-hours","/discord-timestamp","/hours-to-days","/seconds-to-time","/time-between-dates","/time-to-decimal","/time-to-seconds","/truncate-clock-time"],
  component: () => import('./DateTime.vue'), createdAt: '2026-10-10', runtimeLocation: 'browser',
});
