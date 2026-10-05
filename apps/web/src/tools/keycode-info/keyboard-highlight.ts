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
