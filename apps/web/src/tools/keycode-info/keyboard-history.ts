export const HISTORY_LIMIT = 30;

export interface KeyPressState {
  key: string;
  ctrlKey: boolean;
  altKey: boolean;
  shiftKey: boolean;
  metaKey: boolean;
}

export interface HistoryEntry {
  label: string;
  time: string;
}

// `event.key` names modifier keys Control/OS; the modifier list uses Ctrl/Meta.
const MODIFIER_ALIAS: Record<string, string> = {
  Shift: 'Shift',
  Control: 'Ctrl',
  Alt: 'Alt',
  Meta: 'Meta',
  OS: 'Meta',
};

export function formatKeyToken(key: string): string {
  if (key === ' ') return 'Space';
  const alias = MODIFIER_ALIAS[key];
  if (alias) return alias;
  return key.length === 1 ? key.toUpperCase() : key;
}

export function collectModifiers(press: KeyPressState): string[] {
  return [
    press.metaKey && 'Meta',
    press.ctrlKey && 'Ctrl',
    press.altKey && 'Alt',
    press.shiftKey && 'Shift',
  ].filter((modifier): modifier is string => Boolean(modifier));
}

export function formatModifierList(press: KeyPressState): string {
  return collectModifiers(press).join(' + ');
}

export function formatComboLabel(press: KeyPressState): string {
  const keyToken = formatKeyToken(press.key);
  // A modifier pressed on its own is both the key and a held modifier
  // ("Shift+Shift", "Ctrl+Control"); keep the single mention.
  const modifiers = collectModifiers(press).filter((modifier) => modifier !== keyToken);
  return [...modifiers, keyToken].join('+');
}

export function formatClock(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export function pushHistory(
  list: readonly HistoryEntry[],
  entry: HistoryEntry,
  limit: number = HISTORY_LIMIT,
): HistoryEntry[] {
  return [entry, ...list].slice(0, limit);
}
