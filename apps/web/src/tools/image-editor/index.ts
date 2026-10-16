import { defineTool } from '@toolnest/shared';
export const tool = defineTool({
  name: 'tools.imageEditor.name', path: '/image-editor',
  description: 'tools.imageEditor.description', category: 'image',
  redirectFrom: ['/image-change-colors', '/image-change-opacity', '/image-create-transparent', '/image-crop', '/image-flip', '/image-remove-background', '/image-resize', '/image-rotate', '/image-watermark'],
  tags: ['media', 'file-upload', 'lazy-load'], keywords: ['image', 'editor', 'draw', 'annotate', 'text', 'crop', 'flip', 'rotate', 'resize', 'watermark', 'opacity', 'background', 'colors', '²Ã¼ô', '·­×ª', 'Ðý×ª', 'Ë®Ó¡', 'Í¸Ã÷', 'È¥±³¾°', '³ß´ç', 'ÑÕÉ«'],
  component: () => import('./ImageEditor.vue'), createdAt: '2026-09-18', runtimeLocation: 'browser',
});
