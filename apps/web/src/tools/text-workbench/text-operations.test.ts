import { describe, expect, it } from 'vitest';
import { allTools } from '../registry';
import { replaceText, reorderText, sliceText, textStatistics, legacyTextTabs } from './text-operations';
describe('text workbench contracts', () => {
  it('consolidates six legacy tools while keeping text diff standalone', () => {
    const tool = allTools.find(tool => tool.path === '/text-tools');
    expect(allTools.find(tool => tool.path === '/text-diff')?.name).toBe('tools.textDiff.name');
    expect(tool).not.toHaveProperty('aliases');
    expect(tool?.redirectFrom).toContain('/remove-duplicate-lines');
    expect(tool?.redirectFrom).toContain('/list-find-unique');
    expect(tool?.redirectFrom).toEqual(Object.keys(legacyTextTabs));
    expect(allTools.filter(tool => tool.path in legacyTextTabs)).toEqual([]);
  });
  it('preserves literal replacement strings and validates regex failures', () => {
    expect(replaceText('a.a', '.', '$&', false)).toBe('a$&a');
    expect(replaceText('a1 b2', '\\d', 'x', true)).toBe('ax bx');
    expect(() => replaceText('abc', '[', '', true)).toThrow();
  });
  it('composes repeated Unicode-safe reversal and positive/negative rotations', () => {
    const source = 'a😀中';
    expect(reorderText(reorderText(source, 'reverse'), 'reverse')).toBe(source);
    expect(reorderText(source, 'rotate', -1)).toBe('中a😀');
    expect(reorderText(reorderText(source, 'rotate', 1), 'rotate', 1)).toBe('中a😀');
    expect(reorderText('', 'rotate', 5)).toBe('');
  });
  it('uses inclusive character/word/line ranges and neutral whitespace preservation', () => {
    expect(sliceText('a😀中', 'chars', 2, 2)).toBe('😀');
    expect(sliceText(' a  b\n', 'words', 1, 2)).toBe(' a  b\n');
    expect(sliceText('a b c', 'words', 2, 2)).toBe('b');
    expect(sliceText('a\nb\nc', 'lines', 2, 3)).toBe('b\nc');
    expect(textStatistics('😀。').characters).toBe(2);
    expect(textStatistics('').words).toBe(0);
  });
});
