import { describe, it, expect } from 'vitest';
import {
  HISTORY_LIMIT,
  formatClock,
  formatComboLabel,
  formatKeyToken,
  formatModifierList,
  pushHistory,
  type HistoryEntry,
} from './keyboard-history';

const press = (over: Partial<Parameters<typeof formatComboLabel>[0]> = {}) => ({
  key: 'a',
  ctrlKey: false,
  altKey: false,
  shiftKey: false,
  metaKey: false,
  ...over,
});

describe('keyboard-history', () => {
  it('uppercases single-character keys and names the space key', () => {
    expect(formatKeyToken('a')).toBe('A');
    expect(formatKeyToken('A')).toBe('A');
    expect(formatKeyToken('1')).toBe('1');
    expect(formatKeyToken(' ')).toBe('Space');
    expect(formatKeyToken('Shift')).toBe('Shift');
    expect(formatKeyToken('ArrowUp')).toBe('ArrowUp');
  });

  it('orders modifiers Meta, Ctrl, Alt, Shift before the key', () => {
    expect(formatComboLabel(press())).toBe('A');
    expect(formatComboLabel(press({ ctrlKey: true }))).toBe('Ctrl+A');
    expect(formatComboLabel(press({ key: 'c', ctrlKey: true, shiftKey: true }))).toBe('Ctrl+Shift+C');
    expect(
      formatComboLabel(press({ metaKey: true, ctrlKey: true, altKey: true, shiftKey: true })),
    ).toBe('Meta+Ctrl+Alt+Shift+A');
  });

  it('does not repeat a modifier pressed on its own', () => {
    expect(formatComboLabel(press({ key: 'Shift', shiftKey: true }))).toBe('Shift');
    expect(formatComboLabel(press({ key: 'Control', ctrlKey: true }))).toBe('Ctrl');
    expect(formatComboLabel(press({ key: 'A', shiftKey: true }))).toBe('Shift+A');
  });

  it('formats the modifier list with the same order and separator used by the field table', () => {
    expect(formatModifierList(press())).toBe('');
    expect(formatModifierList(press({ altKey: true, ctrlKey: true }))).toBe('Ctrl + Alt');
    expect(formatModifierList(press({ shiftKey: true, metaKey: true }))).toBe('Meta + Shift');
  });

  it('formats a clock timestamp as zero-padded HH:MM:SS', () => {
    expect(formatClock(new Date(2026, 9, 2, 9, 5, 7))).toBe('09:05:07');
    expect(formatClock(new Date(2026, 9, 2, 23, 59, 59))).toBe('23:59:59');
  });

  it('prepends new entries and keeps only the most recent ones', () => {
    const first: HistoryEntry = { label: 'A', time: '00:00:01' };
    const second: HistoryEntry = { label: 'B', time: '00:00:02' };
    expect(pushHistory([first], second)).toEqual([second, first]);
  });

  it('caps the history at HISTORY_LIMIT entries', () => {
    let list: HistoryEntry[] = [];
    for (let i = 0; i < HISTORY_LIMIT + 5; i++) {
      list = pushHistory(list, { label: `K${i}`, time: '00:00:00' });
    }
    expect(list).toHaveLength(HISTORY_LIMIT);
    expect(list[0].label).toBe(`K${HISTORY_LIMIT + 4}`);
    expect(list[HISTORY_LIMIT - 1].label).toBe('K5');
  });

  it('honours an explicit limit', () => {
    let list: HistoryEntry[] = [];
    for (let i = 0; i < 5; i++) list = pushHistory(list, { label: `K${i}`, time: 't' }, 3);
    expect(list.map((e) => e.label)).toEqual(['K4', 'K3', 'K2']);
  });
});
