import { describe, expect, it, vi } from 'vitest';
import { createImageEditorLifecycle } from './image-editor-lifecycle';
import type { TextAnnotation } from './image-editor.service';

const annotation: TextAnnotation = { id: 1, type: 'text', x: 10, y: 20, text: 'editable', fontSize: 16, color: '#000', fontFamily: 'sans-serif', rotation: 0, stroke: null, background: null };
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
const image = (name: string) => ({ name });

describe('image editor lifecycle', () => {
  it('bakes annotations on Apply and restores editable copies with Undo/Redo', async () => {
    const editor = createImageEditorLifecycle<ReturnType<typeof image>>();
    const original = image('original'); const baked = image('baked');
    await editor.importImage(async () => original);
    const edits = [structuredClone(annotation)];
    editor.commitAnnotations(edits);
    edits[0].x = 999;
    expect(editor.read().annotations[0]).toMatchObject({ x: 10 });
    expect(await editor.apply(async () => baked, [annotation])).toBe(true);
    expect(editor.read()).toMatchObject({ image: baked, annotations: [], canUndo: true, canRedo: false });
    editor.undo();
    expect(editor.read().image).toBe(original);
    expect(editor.read().annotations).toEqual([annotation]);
    const restored = editor.read().annotations[0];
    if (restored.type === 'text') restored.x = 888;
    expect(editor.read().annotations[0]).toMatchObject({ x: 10 });
    editor.redo(); expect(editor.read().image).toBe(baked);
    expect(editor.read().annotations).toEqual([]);
  });

  it('keeps only the newest import when loads finish out of order', async () => {
    const release = vi.fn(); const first = deferred<ReturnType<typeof image>>();
    const second = deferred<ReturnType<typeof image>>();
    const editor = createImageEditorLifecycle({ releaseImage: release });
    const one = editor.importImage(() => first.promise);
    const two = editor.importImage(() => second.promise);
    const fresh = image('fresh'); second.resolve(fresh); expect(await two).toBe(true);
    const stale = image('stale'); first.resolve(stale); expect(await one).toBe(false);
    expect(editor.read().image).toBe(fresh); expect(release).toHaveBeenCalledWith(stale);
    expect(editor.read().canUndo).toBe(false);
  });

  it('an old Apply cannot change a replacement image or its busy state', async () => {
    const release = vi.fn(); const editor = createImageEditorLifecycle({ releaseImage: release });
    await editor.importImage(async () => image('original'));
    const transform = deferred<ReturnType<typeof image>>(); const loading = deferred<ReturnType<typeof image>>();
    const applying = editor.apply(() => transform.promise, [annotation]);
    const importing = editor.importImage(() => loading.promise);
    const discarded = image('discarded'); transform.resolve(discarded);
    expect(await applying).toBe(false); expect(editor.read().busy).toBe(true);
    expect(editor.read().image).toBeNull(); expect(release).toHaveBeenCalledWith(discarded);
    const replacement = image('replacement'); loading.resolve(replacement); await importing;
    expect(editor.read().image).toBe(replacement); expect(editor.read().canUndo).toBe(false);
  });

  it('failure preserves the original image, annotation history and future edits', async () => {
    const editor = createImageEditorLifecycle<ReturnType<typeof image>>();
    const original = image('original'); await editor.importImage(async () => original);
    editor.commitAnnotations([annotation]); const before = editor.read();
    await expect(editor.apply(async () => { throw new Error('decode failed'); }, [annotation])).rejects.toThrow('decode failed');
    expect(editor.read()).toEqual(before);
    expect(editor.read().busy).toBe(false); editor.undo(); expect(editor.read().annotations).toEqual([]);
    editor.redo(); expect(editor.read().annotations).toEqual([annotation]);
  });

  it('suppresses an obsolete failure without ending the current task', async () => {
    const editor = createImageEditorLifecycle<ReturnType<typeof image>>();
    const old = deferred<ReturnType<typeof image>>(); const next = deferred<ReturnType<typeof image>>();
    const oldImport = editor.importImage(() => old.promise); const newImport = editor.importImage(() => next.promise);
    old.reject(new Error('obsolete')); expect(await oldImport).toBe(false);
    expect(editor.read().busy).toBe(true); next.resolve(image('new')); await newImport;
  });

  it('rejects conflicting Apply, history and annotation edits while busy', async () => {
    const editor = createImageEditorLifecycle<ReturnType<typeof image>>();
    await editor.importImage(async () => image('original')); editor.commitAnnotations([annotation]);
    const task = deferred<ReturnType<typeof image>>(); const applying = editor.apply(() => task.promise, [annotation]);
    const before = editor.read(); const extraTransform = vi.fn();
    expect(await editor.apply(extraTransform, [])).toBe(false);
    editor.commitAnnotations([]); editor.undo(); editor.redo();
    expect(editor.read()).toEqual(before); expect(extraTransform).not.toHaveBeenCalled();
    task.resolve(image('done')); await applying;
  });

  it('releases only bitmaps no retained history state uses when capped', async () => {
    const release = vi.fn(); const editor = createImageEditorLifecycle({ historyLimit: 3, releaseImage: release });
    const frames = ['a', 'b', 'c', 'd'].map(image);
    await editor.importImage(async () => frames[0]);
    for (const frame of frames.slice(1)) await editor.apply(async () => frame, []);
    expect(release.mock.calls).toEqual([[frames[0]]]);
    editor.undo(); expect(editor.read().image).toBe(frames[2]);
    editor.undo(); expect(editor.read().image).toBe(frames[1]);
    editor.clear(); expect(release.mock.calls.map(call => call[0])).toEqual(frames);
    editor.dispose(); expect(release).toHaveBeenCalledTimes(4);
  });

  it('releases redo bitmaps after branching with annotations', async () => {
    const release = vi.fn(); const editor = createImageEditorLifecycle({ releaseImage: release });
    const original = image('original'); const discarded = image('discarded');
    await editor.importImage(async () => original); await editor.apply(async () => discarded, []);
    editor.undo(); editor.commitAnnotations([annotation]);
    expect(editor.read().canRedo).toBe(false); expect(release.mock.calls).toEqual([[discarded]]);
    expect(editor.read().image).toBe(original);
  });

  it('clear and dispose invalidate pending work and release its late result', async () => {
    for (const action of ['clear', 'dispose'] as const) {
      const release = vi.fn(); const changed = vi.fn();
      const editor = createImageEditorLifecycle({ releaseImage: release, onChange: changed });
      const loaded = image('loaded'); await editor.importImage(async () => loaded);
      const late = deferred<ReturnType<typeof image>>(); const applying = editor.apply(() => late.promise, []);
      editor[action](); const notifications = changed.mock.calls.length;
      const obsolete = image('obsolete'); late.resolve(obsolete); expect(await applying).toBe(false);
      expect(editor.read()).toMatchObject({ image: null, annotations: [], busy: false, canUndo: false });
      expect(release.mock.calls).toEqual([[loaded], [obsolete]]);
      expect(changed).toHaveBeenCalledTimes(notifications);
      if (action === 'dispose') {
        const load = vi.fn(); expect(await editor.importImage(load)).toBe(false);
        expect(load).not.toHaveBeenCalled();
      }
    }
  });

  it('avoids duplicate commits and handles no-image actions safely', async () => {
    const editor = createImageEditorLifecycle<ReturnType<typeof image>>();
    editor.commitAnnotations([annotation]); editor.undo(); editor.redo();
    expect(await editor.apply(async () => image('unused'), [])).toBe(false);
    await editor.importImage(async () => image('loaded'));
    editor.commitAnnotations([annotation]); editor.commitAnnotations([annotation]);
    editor.undo(); expect(editor.read().annotations).toEqual([]); expect(editor.read().canUndo).toBe(false);
  });
});
