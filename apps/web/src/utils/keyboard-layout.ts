export const UNITS_PER_KEY = 4;
export const TOTAL_UNITS = 23;
export const ROW_COUNT = 6;

export interface KeyDef {
  code: string;
  label: string;
  sub?: string;
  u: number;
  row: number;
  col: number;
  rowSpan: number;
  // Vertical offset of this key's row from the tight grid, in key units. Rows
  // are stacked on integer tracks by default; a positive offset pushes a row
  // down to open a gap between it and the row above (e.g. under the function
  // row, or above the arrow cluster).
  rowOffset: number;
}

type RowItem =
  | (Omit<KeyDef, 'row' | 'col' | 'rowSpan' | 'rowOffset'> & { rowSpan?: number })
  | { gap: number };

function buildRow(items: RowItem[], rowIndex: number, rowOffset: number): KeyDef[] {
  let col = 0;
  const keys: KeyDef[] = [];
  for (const item of items) {
    if ('gap' in item) {
      col += item.gap * UNITS_PER_KEY;
      continue;
    }
    keys.push({ ...item, row: rowIndex, col, rowSpan: item.rowSpan ?? 1, rowOffset });
    col += item.u * UNITS_PER_KEY;
  }
  return keys;
}

const k = (code: string, label: string, u = 1, sub?: string, rowSpan?: number): RowItem => ({
  ...(sub === undefined ? { code, label, u } : { code, label, u, sub }),
  ...(rowSpan === undefined ? {} : { rowSpan }),
});
const gap = (u: number): RowItem => ({ gap: u });

const ROWS: RowItem[][] = [
  [
    k('Escape', 'ESC'),
    gap(1),
    k('F1', 'F1'), k('F2', 'F2'), k('F3', 'F3'), k('F4', 'F4'),
    gap(0.5),
    k('F5', 'F5'), k('F6', 'F6'), k('F7', 'F7'), k('F8', 'F8'),
    gap(0.5),
    k('F9', 'F9'), k('F10', 'F10'), k('F11', 'F11'), k('F12', 'F12'),
    gap(0.5),
    k('PrintScreen', 'PRTSC'), k('ScrollLock', 'SCRLK'), k('Pause', 'PAUSE'),
    gap(0.5),
    k('AudioVolumeDown', 'VOL−'), k('AudioVolumeUp', 'VOL+'), k('AudioVolumeMute', 'MUTE'), k('LaunchCalculator', 'CALC'),
  ],
  [
    k('Backquote', '`', 1, '~'),
    k('Digit1', '1', 1, '!'), k('Digit2', '2', 1, '@'), k('Digit3', '3', 1, '#'),
    k('Digit4', '4', 1, '$'), k('Digit5', '5', 1, '%'), k('Digit6', '6', 1, '^'),
    k('Digit7', '7', 1, '&'), k('Digit8', '8', 1, '*'), k('Digit9', '9', 1, '('),
    k('Digit0', '0', 1, ')'),
    k('Minus', '-', 1, '_'), k('Equal', '=', 1, '+'),
    k('Backspace', 'BACKSPACE', 2),
    gap(0.5),
    k('Insert', 'INS'), k('Home', 'HOME'), k('PageUp', 'PGUP'),
    gap(0.5),
    k('NumLock', 'NUM'), k('NumpadDivide', '/'), k('NumpadMultiply', '*'), k('NumpadSubtract', '-'),
  ],
  [
    k('Tab', 'TAB', 1.5),
    k('KeyQ', 'Q'), k('KeyW', 'W'), k('KeyE', 'E'), k('KeyR', 'R'), k('KeyT', 'T'),
    k('KeyY', 'Y'), k('KeyU', 'U'), k('KeyI', 'I'), k('KeyO', 'O'), k('KeyP', 'P'),
    k('BracketLeft', '[', 1, '{'), k('BracketRight', ']', 1, '}'),
    k('Backslash', '\\', 1.5, '|'),
    gap(0.5),
    k('Delete', 'DEL'), k('End', 'END'), k('PageDown', 'PGDN'),
    gap(0.5),
    k('Numpad7', '7'), k('Numpad8', '8'), k('Numpad9', '9'),
    k('NumpadAdd', '+', 1, undefined, 2),
  ],
  [
    k('CapsLock', 'CAPS', 1.75),
    k('KeyA', 'A'), k('KeyS', 'S'), k('KeyD', 'D'), k('KeyF', 'F'), k('KeyG', 'G'),
    k('KeyH', 'H'), k('KeyJ', 'J'), k('KeyK', 'K'), k('KeyL', 'L'),
    k('Semicolon', ';', 1, ':'), k('Quote', "'", 1, '"'),
    k('Enter', 'ENTER', 2.25),
    gap(0.5),
    gap(3),
    gap(0.5),
    k('Numpad4', '4'), k('Numpad5', '5'), k('Numpad6', '6'),
    gap(1),
  ],
  [
    k('ShiftLeft', 'SHIFT', 2.25),
    k('KeyZ', 'Z'), k('KeyX', 'X'), k('KeyC', 'C'), k('KeyV', 'V'), k('KeyB', 'B'),
    k('KeyN', 'N'), k('KeyM', 'M'),
    k('Comma', ',', 1, '<'), k('Period', '.', 1, '>'), k('Slash', '/', 1, '?'),
    k('ShiftRight', 'SHIFT', 2.75),
    gap(0.5),
    gap(1), k('ArrowUp', '↑'), gap(1),
    gap(0.5),
    k('Numpad1', '1'), k('Numpad2', '2'), k('Numpad3', '3'),
    k('NumpadEnter', 'ENTER', 1, undefined, 2),
  ],
  [
    k('ControlLeft', 'CTRL', 1.25), k('MetaLeft', 'WIN', 1.25), k('AltLeft', 'ALT', 1.25),
    k('Space', '', 6.25),
    k('AltRight', 'ALT', 1.25), k('MetaRight', 'WIN', 1.25),
    k('ContextMenu', 'MENU', 1.25), k('ControlRight', 'CTRL', 1.25),
    gap(0.5),
    k('ArrowLeft', '←'), k('ArrowDown', '↓'), k('ArrowRight', '→'),
    gap(0.5),
    k('Numpad0', '0', 2), k('NumpadDecimal', '.'),
    gap(1),
  ],
];

// The function row sits at the very top; the five rows beneath it (alphanumeric
// block, arrow cluster and numpad) drop a half-unit together, opening a gap
// between the function row and the number row like a real board's function-key
// strip.
const MAIN_BLOCK_OFFSET = 0.5;

export const KEYS: KeyDef[] = ROWS.flatMap((items, row) => buildRow(items, row, row === 0 ? 0 : MAIN_BLOCK_OFFSET));

export const ROW_GAPS: readonly number[] = ROWS.map(
  (items) => items.reduce<number>((sum, item) => ('gap' in item ? sum + item.gap : sum), 0),
);

const byCode = new Map(KEYS.map((key) => [key.code, key]));

export function findKeyByCode(code: string): KeyDef | undefined {
  return byCode.get(code);
}
