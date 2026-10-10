import { defineTool } from '@toolnest/shared';

export const tool = defineTool({
  name: 'tools.keycodeInfo.name',
  path: '/keycode-info',
  description: 'tools.keycodeInfo.description',
  category: 'web',
  tags: ['developer', 'debug'],
  keywords: ['keyboard', 'key', 'code', 'keycode', 'event', 'keydown', 'keypress'],
  component: () => import('./KeycodeInfo.vue'),
  createdAt: '2026-09-18',
});
