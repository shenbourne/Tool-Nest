import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.byteConverter.name', path: '/byte-converter',
  description: 'tools.byteConverter.description', category: 'converter',
  tags: ["converter","number"], keywords: ["byte","kb","mb","gb","convert"],
  component: () => import('./ByteConverter.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
