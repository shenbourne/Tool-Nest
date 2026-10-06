import { describe, it, expect } from 'vitest';
import { computeHighlight, isModifierCode, syncHeldModifiers, toggleHeldModifier } from './keyboard-highlight';

describe('keyboard-highlight', () => {
  it('recognises physical modifier codes on both sides', () => {
    for (const code of ['ControlLeft', 'ControlRight', 'ShiftLeft', 'ShiftRight', 'AltLeft', 'AltRight', 'MetaLeft', 'MetaRight']) {
      expect(isModifierCode(code), code).toBe(true);
    }
    for (const code of ['KeyA', 'Digit1', 'Control', 'Shift', 'Space']) {
      expect(isModifierCode(code), code).toBe(false);
    }
  });

  it('tracks held modifiers on keydown and keyup', () => {
    let held: string[] = [];
    held = toggleHeldModifier(held, 'ControlLeft', true);
    expect(held).toEqual(['ControlLeft']);
    held = toggleHeldModifier(held, 'ShiftLeft', true);
    expect(held).toEqual(['ControlLeft', 'ShiftLeft']);
    held = toggleHeldModifier(held, 'ControlLeft', false);
    expect(held).toEqual(['ShiftLeft']);
  });

  it('ignores non-modifier codes and repeated presses', () => {
    let held: string[] = [];
    held = toggleHeldModifier(held, 'KeyA', true);
    expect(held).toEqual([]);
    held = toggleHeldModifier(held, 'ControlLeft', true);
    held = toggleHeldModifier(held, 'ControlLeft', true);
    expect(held).toEqual(['ControlLeft']);
    held = toggleHeldModifier(held, 'KeyA', false);
    expect(held).toEqual(['ControlLeft']);
  });

  it('highlights the held modifiers together with the pressed key', () => {
    expect(computeHighlight([], 'KeyA')).toEqual(['KeyA']);
    expect(computeHighlight(['ControlLeft'], 'KeyA')).toEqual(['ControlLeft', 'KeyA']);
    expect(computeHighlight(['ShiftLeft', 'ControlLeft'], 'KeyA')).toEqual(['ShiftLeft', 'ControlLeft', 'KeyA']);
  });

  it('does not duplicate a modifier that is pressed as the key itself', () => {
    expect(computeHighlight(['ControlLeft'], 'ControlLeft')).toEqual(['ControlLeft']);
    expect(computeHighlight([], 'ShiftLeft')).toEqual(['ShiftLeft']);
  });

  it('returns an empty set when nothing is held or pressed', () => {
    expect(computeHighlight([], '')).toEqual([]);
  });

  it('rebuilds the held set from the keydown modifier flags', () => {
    const none = { code: '', ctrlKey: false, altKey: false, shiftKey: false, metaKey: false };
    expect(syncHeldModifiers([], { ...none, code: 'ControlLeft', ctrlKey: true })).toEqual(['ControlLeft']);
    expect(syncHeldModifiers([], { ...none, code: 'KeyA', ctrlKey: true, shiftKey: true })).toEqual(['ControlRight', 'ShiftRight']);
    expect(syncHeldModifiers([], { ...none, code: 'KeyA', altKey: true, metaKey: true })).toEqual(['AltRight', 'MetaRight']);
  });

  it('keeps the known side when the modifier stays held', () => {
    const ctrlShift = { code: 'KeyA', ctrlKey: true, altKey: false, shiftKey: true, metaKey: false };
    expect(syncHeldModifiers(['ControlLeft', 'ShiftLeft'], ctrlShift)).toEqual(['ControlLeft', 'ShiftLeft']);
  });

  it('drops a stuck modifier that the keydown flags say is released', () => {
    const ctrlOnly = { code: 'ControlLeft', ctrlKey: true, altKey: false, shiftKey: false, metaKey: false };
    // ShiftLeft is still in `held` because its keyup was missed, but the event
    // says only Ctrl is held now, so Shift must not light.
    expect(syncHeldModifiers(['ShiftLeft'], ctrlOnly)).toEqual(['ControlLeft']);
    expect(syncHeldModifiers(['ShiftLeft', 'ControlLeft'], ctrlOnly)).toEqual(['ControlLeft']);
  });
});
