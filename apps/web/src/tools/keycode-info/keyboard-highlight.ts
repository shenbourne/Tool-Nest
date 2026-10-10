const MODIFIER_CODES = new Set([
  'ControlLeft',
  'ControlRight',
  'ShiftLeft',
  'ShiftRight',
  'AltLeft',
  'AltRight',
  'MetaLeft',
  'MetaRight',
]);

export function isModifierCode(code: string): boolean {
  return MODIFIER_CODES.has(code);
}

export function toggleHeldModifier(held: readonly string[], code: string, isDown: boolean): string[] {
  if (!isModifierCode(code)) return [...held];
  const next = new Set(held);
  if (isDown) next.add(code);
  else next.delete(code);
  return [...next];
}

// The modifiers currently held are lit together with the key just pressed, so a
// combo dims as one set rather than leaving only the last physical key lit.
export function computeHighlight(held: readonly string[], pressedCode: string): string[] {
  const codes = new Set(held);
  if (pressedCode) codes.add(pressedCode);
  return [...codes];
}

interface ModifierState {
  code: string;
  ctrlKey: boolean;
  altKey: boolean;
  shiftKey: boolean;
  metaKey: boolean;
}

// Rebuild the held set from the keydown's own modifier flags. A keyup can be
// missed (focus lost, released off-page), which would otherwise leave a modifier
// stuck in `held` and light it on an unrelated later press. The event flags are
// authoritative for what is physically held right now. The pressed key's own
// code pins its side so a fresh left press lights the left key, not the default.
export function syncHeldModifiers(held: readonly string[], e: ModifierState): string[] {
  const pick = (left: string, right: string, flag: boolean): string | null => {
    if (!flag) return null;
    if (e.code === left) return left;
    if (e.code === right) return right;
    return held.includes(left) ? left : right;
  };
  const next: string[] = [];
  const push = (code: string | null) => {
    if (code) next.push(code);
  };
  push(pick('ControlLeft', 'ControlRight', e.ctrlKey));
  push(pick('AltLeft', 'AltRight', e.altKey));
  push(pick('ShiftLeft', 'ShiftRight', e.shiftKey));
  push(pick('MetaLeft', 'MetaRight', e.metaKey));
  return next;
}
