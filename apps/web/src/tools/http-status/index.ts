import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.httpStatus.name', path: '/http-status-codes',
  description: 'tools.httpStatus.description', category: 'web',
  tags: ['parser'], keywords: ['http', 'status', 'code', 'response', '200', '404', '500'],
  component: () => import('./HttpStatus.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
