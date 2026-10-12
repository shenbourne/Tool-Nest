import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.rot13.name', path: '/rot13',
  description: 'tools.rot13.description', category: 'encoding',
  tags: ['text', 'converter', 'encoder'], keywords: ["rot13","cipher","caesar"],
  component: () => import('./Rot13.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
