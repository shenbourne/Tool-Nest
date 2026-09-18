import { defineTool } from '@toolnest/shared';

export const tool = defineTool({
  name: 'tools.htmlWysiwygEditor.name',
  path: '/html-wysiwyg-editor',
  description: 'tools.htmlWysiwygEditor.description',
  category: 'web',
  tags: ['text', 'developer'],
  keywords: ['html', 'wysiwyg', 'editor', 'rich-text', 'format'],
  component: () => import('./HtmlWysiwygEditor.vue'),
  createdAt: '2026-09-18',
});
