import type { ToolCategoryDefinition } from './tool-types';

export const TOOL_CATEGORIES: ToolCategoryDefinition[] = [
  { name: 'crypto', label: 'category.crypto.name', icon: 'LockClosedIcon', description: 'category.crypto.desc', order: 1 },
  { name: 'converter', label: 'category.converter.name', icon: 'ArrowRightLeftIcon', description: 'category.converter.desc', order: 2 },
  { name: 'web', label: 'category.web.name', icon: 'GlobeIcon', description: 'category.web.desc', order: 3 },
  { name: 'developer', label: 'category.developer.name', icon: 'CodeIcon', description: 'category.developer.desc', order: 4 },
  { name: 'network', label: 'category.network.name', icon: 'NetworkIcon', description: 'category.network.desc', order: 5 },
  { name: 'text', label: 'category.text.name', icon: 'TypeIcon', description: 'category.text.desc', order: 6 },
  { name: 'data', label: 'category.data.name', icon: 'DatabaseIcon', description: 'category.data.desc', order: 7 },
  { name: 'image', label: 'category.image.name', icon: 'ImageIcon', description: 'category.image.desc', order: 8 },
  { name: 'video', label: 'category.video.name', icon: 'VideoIcon', description: 'category.video.desc', order: 9 },
  { name: 'audio', label: 'category.audio.name', icon: 'Volume2Icon', description: 'category.audio.desc', order: 10 },
  { name: 'pdf', label: 'category.pdf.name', icon: 'FileTextIcon', description: 'category.pdf.desc', order: 11 },
  { name: 'math', label: 'category.math.name', icon: 'CalculatorIcon', description: 'category.math.desc', order: 12 },
  { name: 'measurement', label: 'category.measurement.name', icon: 'RulerIcon', description: 'category.measurement.desc', order: 13 },
  { name: 'generator', label: 'category.generator.name', icon: 'ZapIcon', description: 'category.generator.desc', order: 14 },
  { name: 'network-test', label: 'category.network-test.name', icon: 'ActivityIcon', description: 'category.network-test.desc', order: 15 },
  { name: 'platform', label: 'category.platform.name', icon: 'SettingsIcon', description: 'category.platform.desc', order: 16 },
];
