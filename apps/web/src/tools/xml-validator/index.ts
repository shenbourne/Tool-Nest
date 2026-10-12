import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.xmlValidator.name', path: '/xml-validator',
  description: 'tools.xmlValidator.description', category: 'data',
  tags: ["xml","validator"], keywords: ["xml","validate","check","parse"],
  component: () => import('./XmlValidator.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
