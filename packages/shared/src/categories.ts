import type { ToolCategoryDefinition } from './tool-types';

export const TOOL_CATEGORIES: ToolCategoryDefinition[] = [
  { name: 'crypto', label: 'category.crypto', icon: 'LockClosedIcon', description: 'category.crypto.desc', order: 1 },
  { name: 'converter', label: 'category.converter', icon: 'ArrowRightLeftIcon', description: 'category.converter.desc', order: 2 },
  { name: 'web', label: 'category.web', icon: 'GlobeIcon', description: 'category.web.desc', order: 3 },
  { name: 'developer', label: 'category.developer', icon: 'CodeIcon', description: 'category.developer.desc', order: 4 },
  { name: 'network', label: 'category.network', icon: 'NetworkIcon', description: 'category.network.desc', order: 5 },
  { name: 'text', label: 'category.text', icon: 'TypeIcon', description: 'category.text.desc', order: 6 },
  { name: 'data', label: 'category.data', icon: 'DatabaseIcon', description: 'category.data.desc', order: 7 },
  { name: 'image', label: 'category.image', icon: 'ImageIcon', description: 'category.image.desc', order: 8 },
  { name: 'video', label: 'category.video', icon: 'VideoIcon', description: 'category.video.desc', order: 9 },
  { name: 'audio', label: 'category.audio', icon: 'Volume2Icon', description: 'category.audio.desc', order: 10 },
  { name: 'pdf', label: 'category.pdf', icon: 'FileTextIcon', description: 'category.pdf.desc', order: 11 },
  { name: 'math', label: 'category.math', icon: 'CalculatorIcon', description: 'category.math.desc', order: 12 },
  { name: 'measurement', label: 'category.measurement', icon: 'RulerIcon', description: 'category.measurement.desc', order: 13 },
  { name: 'generator', label: 'category.generator', icon: 'ZapIcon', description: 'category.generator.desc', order: 14 },
  { name: 'network-test', label: 'category.network-test', icon: 'ActivityIcon', description: 'category.network-test.desc', order: 15 },
  { name: 'platform', label: 'category.platform', icon: 'SettingsIcon', description: 'category.platform.desc', order: 16 },
];
