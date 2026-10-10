import { defineTool } from '@toolnest/shared';

export const tool = defineTool({
  name: 'tools.safelinkDecoder.name',
  path: '/safelink-decoder',
  description: 'tools.safelinkDecoder.description',
  category: 'web',
  tags: ['parser', 'developer'],
  keywords: ['safelink', 'outlook', 'decoder', 'url', 'decode', 'email', 'protection'],
  component: () => import('./SafelinkDecoder.vue'),
  createdAt: '2026-09-18',
});
