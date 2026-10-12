import type { ToolTag } from '@toolnest/shared';

const runtimeTags = new Set<ToolTag>(['browser', 'backend', 'file-upload', 'lazy-load', 'worker']);

// Runtime metadata remains on the tool detail; discovery shows functional tags.
export function visibleToolTags(tags: readonly ToolTag[]): ToolTag[] {
  return tags.filter(tag => !runtimeTags.has(tag));
}
