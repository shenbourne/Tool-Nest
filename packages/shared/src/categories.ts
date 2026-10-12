import type { ToolCategoryDefinition } from './tool-types';

export const TOOL_CATEGORIES: ToolCategoryDefinition[] = [
  { name: 'text', label: 'category.text.name', icon: 'TypeIcon', description: 'category.text.desc', order: 1 },
  { name: 'data', label: 'category.data.name', icon: 'DatabaseIcon', description: 'category.data.desc', order: 2 },
  { name: 'encoding', label: 'category.encoding.name', icon: 'ArrowRightLeftIcon', description: 'category.encoding.desc', order: 3 },
  { name: 'crypto', label: 'category.crypto.name', icon: 'LockClosedIcon', description: 'category.crypto.desc', order: 4 },
  { name: 'web', label: 'category.web.name', icon: 'GlobeIcon', description: 'category.web.desc', order: 5 },
  { name: 'developer', label: 'category.developer.name', icon: 'CodeIcon', description: 'category.developer.desc', order: 6 },
  { name: 'network', label: 'category.network.name', icon: 'NetworkIcon', description: 'category.network.desc', order: 7 },
  { name: 'math', label: 'category.math.name', icon: 'CalculatorIcon', description: 'category.math.desc', order: 8 },
  { name: 'datetime', label: 'category.datetime.name', icon: 'CalendarIcon', description: 'category.datetime.desc', order: 9 },
  { name: 'image', label: 'category.image.name', icon: 'ImageIcon', description: 'category.image.desc', order: 10 },
  { name: 'video', label: 'category.video.name', icon: 'VideoIcon', description: 'category.video.desc', order: 11 },
  { name: 'audio', label: 'category.audio.name', icon: 'Volume2Icon', description: 'category.audio.desc', order: 12 },
  { name: 'pdf', label: 'category.pdf.name', icon: 'FileTextIcon', description: 'category.pdf.desc', order: 13 },
];
