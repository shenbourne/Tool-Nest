import { describe, expect, it } from 'vitest';
import { sortLines } from './list-sort.service';

describe('sortLines', () => {
  it('sorts lines naturally', () => {
    expect(sortLines('item10\nitem2\nitem1')).toBe('item1\nitem2\nitem10');
  });

  it('keeps blank lines instead of dropping them', () => {
    expect(sortLines('b\n\na')).toBe('\na\nb');
    expect(sortLines('b\n\na').split('\n')).toHaveLength(3);
  });

  it('sorts case-insensitively', () => {
    expect(sortLines('banana\nApple')).toBe('Apple\nbanana');
  });

  it('handles empty input', () => {
    expect(sortLines('')).toBe('');
  });

  it('sorts numeric lines by value', () => {
    expect(sortLines('9\n10\n2')).toBe('2\n9\n10');
  });
});
