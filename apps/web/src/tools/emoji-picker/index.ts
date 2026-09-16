import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.emojiPicker.name', path: '/emoji-picker',
  description: 'tools.emojiPicker.description', category: 'text',
  tags: ['generator'], keywords: ['emoji', 'emoticon', 'smiley', 'symbol', 'unicode'],
  component: () => import('./EmojiPicker.vue'), createdAt: '2026-09-17', runtimeLocation: 'browser',
});
