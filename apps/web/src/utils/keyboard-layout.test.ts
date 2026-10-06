import { describe, it, expect } from 'vitest';
import { KEYS, ROW_COUNT, ROW_GAPS, TOTAL_UNITS, UNITS_PER_KEY, findKeyByCode } from './keyboard-layout';

describe('keyboard-layout', () => {
  it('every row spans exactly the full keyboard width (keys + gaps)', () => {
    for (let row = 0; row < ROW_COUNT; row++) {
      const keyUnits = KEYS.filter((k) => k.row === row).reduce((sum, k) => sum + k.u, 0);
      expect(keyUnits + ROW_GAPS[row], `row ${row} width`).toBe(TOTAL_UNITS);
    }
  });

  it('assigns every key a non-negative quarter-column inside the grid', () => {
    for (const k of KEYS) {
      expect(k.col).toBeGreaterThanOrEqual(0);
      expect(k.col + k.u * UNITS_PER_KEY).toBeLessThanOrEqual(TOTAL_UNITS * UNITS_PER_KEY);
    }
  });

  it('has no overlapping keys within a row (tall numpad keys span rows, not columns)', () => {
    for (let row = 0; row < ROW_COUNT; row++) {
      const spans = KEYS.filter((k) => k.row === row)
        .map((k) => [k.col, k.col + k.u * UNITS_PER_KEY] as const)
        .sort((a, b) => a[0] - b[0]);
      for (let i = 1; i < spans.length; i++) {
        expect(spans[i][0], `row ${row} overlap at ${spans[i][0]}`).toBeGreaterThanOrEqual(spans[i - 1][1]);
      }
    }
  });

  it('uses unique, non-empty codes', () => {
    const codes = KEYS.map((k) => k.code);
    expect(new Set(codes).size).toBe(codes.length);
    expect(codes.every((c) => c.length > 0)).toBe(true);
  });

  it('covers the full 108-key layout shown in the reference image', () => {
    expect(KEYS.length).toBe(108);
    for (const code of [
      'Escape', 'F1', 'F12', 'PrintScreen', 'ScrollLock', 'Pause',
      'AudioVolumeDown', 'AudioVolumeUp', 'AudioVolumeMute', 'LaunchCalculator',
      'Backquote', 'Digit1', 'Digit0', 'Minus', 'Equal', 'Backspace',
      'Tab', 'KeyQ', 'KeyP', 'BracketLeft', 'BracketRight', 'Backslash',
      'CapsLock', 'KeyA', 'KeyL', 'Semicolon', 'Quote', 'Enter',
      'ShiftLeft', 'KeyZ', 'KeyM', 'Comma', 'Period', 'Slash', 'ShiftRight',
      'ControlLeft', 'MetaLeft', 'AltLeft', 'Space', 'AltRight', 'MetaRight', 'ContextMenu', 'ControlRight',
      'Insert', 'Home', 'PageUp', 'Delete', 'End', 'PageDown',
      'ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight',
      'NumLock', 'NumpadDivide', 'NumpadMultiply', 'NumpadSubtract',
      'Numpad7', 'Numpad8', 'Numpad9', 'NumpadAdd',
      'Numpad4', 'Numpad5', 'Numpad6',
      'Numpad1', 'Numpad2', 'Numpad3', 'NumpadEnter',
      'Numpad0', 'NumpadDecimal',
    ]) {
      expect(findKeyByCode(code), code).toBeDefined();
    }
  });

  it('aligns F12 right edge with Backspace right edge via a 1u Esc/F1 gap', () => {
    const f12 = findKeyByCode('F12');
    const backspace = findKeyByCode('Backspace');
    expect(f12!.col + f12!.u * UNITS_PER_KEY).toBe(backspace!.col + backspace!.u * UNITS_PER_KEY);
  });

  it('offsets the function row and the arrow cluster down from the rows above', () => {
    // The function row sits one half-unit below the number row, and the arrow
    // cluster sits one half-unit below the Insert/Home/PageUp block.
    expect(findKeyByCode('Escape')!.rowOffset).toBeGreaterThan(0);
    expect(findKeyByCode('ArrowUp')!.rowOffset).toBeGreaterThan(0);
  });

  it('findKeyByCode matches by physical code and returns the key metadata', () => {
    const a = findKeyByCode('KeyA');
    expect(a?.label).toBe('A');
    expect(a?.row).toBe(3);
    const leftShift = findKeyByCode('ShiftLeft');
    expect(leftShift).toBeDefined();
    expect(findKeyByCode('Shift')).toBeUndefined();
    expect(findKeyByCode('KeyAA')).toBeUndefined();
  });

  it('marks the two tall numpad keys with rowSpan 2', () => {
    expect(findKeyByCode('NumpadAdd')?.rowSpan).toBe(2);
    expect(findKeyByCode('NumpadEnter')?.rowSpan).toBe(2);
    expect(KEYS.filter((k) => k.rowSpan === 2)).toHaveLength(2);
  });

  it('carries shifted symbols as secondary labels on the number row', () => {
    expect(findKeyByCode('Digit1')?.sub).toBe('!');
    expect(findKeyByCode('Backquote')?.sub).toBe('~');
    expect(findKeyByCode('Minus')?.sub).toBe('_');
    expect(findKeyByCode('Digit9')?.sub).toBe('(');
  });
});
