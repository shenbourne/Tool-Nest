import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.hiddenCharDetector.name', path: '/hidden-char-detector',
  description: 'tools.hiddenCharDetector.description', category: 'text',
  tags: ["text","debug"], keywords: ["hidden","unicode","invisible","character"],
  component: () => import('./HiddenCharDetector.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
