import {
  canRedo, canUndo, commit, createHistory, historyState, redo, undo,
  type Annotation,
} from './image-editor.service';

export interface EditorLifecycleState<Image> {
  image: Image | null;
  annotations: Annotation[];
  busy: boolean;
  canUndo: boolean;
  canRedo: boolean;
}
interface EditorSnapshot { imageId: number; annotations: Annotation[] }
interface LifecycleOptions<Image> {
  historyLimit?: number;
  onChange?: (state: EditorLifecycleState<Image>) => void;
  releaseImage?: (image: Image) => void;
}

/** Owns bitmap/history retention and the authority to publish asynchronous edits. */
export function createImageEditorLifecycle<Image>(options: LifecycleOptions<Image> = {}) {
  const limit = options.historyLimit;
  if (limit !== undefined && (!Number.isInteger(limit) || limit < 2)) {
    throw new RangeError('Image history must retain at least two states');
  }
  const empty = (): EditorSnapshot => ({ imageId: 0, annotations: [] });
  let history = createHistory(empty(), limit);
  const images = new Map<number, Image>();
  let nextImageId = 0;
  let taskId = 0;
  let busy = false;
  let disposed = false;

  function read(): EditorLifecycleState<Image> {
    const snapshot = historyState(history);
    return {
      image: images.get(snapshot.imageId) ?? null,
      annotations: snapshot.annotations,
      busy,
      canUndo: !busy && canUndo(history),
      canRedo: !busy && canRedo(history),
    };
  }
  function notify() { if (!disposed) options.onChange?.(read()); }
  function release(image: Image) {
    if (![...images.values()].includes(image)) options.releaseImage?.(image);
  }
  function prune() {
    const retained = new Set(history.states.map(state => state.imageId));
    for (const [id, image] of images) {
      if (!retained.has(id)) { images.delete(id); release(image); }
    }
  }
  function record(snapshot: EditorSnapshot) {
    if (JSON.stringify(snapshot) !== JSON.stringify(historyState(history))) {
      history = commit(history, snapshot);
      prune();
    }
  }
  function reset() {
    taskId += 1;
    busy = false;
    history = createHistory(empty(), limit);
    prune();
  }
  function clear() {
    if (disposed) return;
    reset(); notify();
  }
  function commitAnnotations(annotations: Annotation[]) {
    if (disposed || busy || !read().image) return;
    record({ imageId: historyState(history).imageId, annotations });
    notify();
  }
  async function run(load: () => Promise<Image>, importing: boolean, annotations: Annotation[]): Promise<boolean> {
    if (disposed || (!importing && (busy || !read().image))) return false;
    // Capture plain annotation values before the caller can mutate them during decode.
    const before = JSON.parse(JSON.stringify({ imageId: historyState(history).imageId, annotations })) as EditorSnapshot;
    if (importing) reset();
    const identity = ++taskId;
    busy = true; notify();
    try {
      const image = await load();
      if (disposed || identity !== taskId) { release(image); return false; }
      if (!importing) record(before);
      const id = ++nextImageId;
      images.set(id, image);
      const after = { imageId: id, annotations: [] };
      if (importing) { history = createHistory(after, limit); prune(); }
      else record(after);
      return true;
    } catch (error) {
      if (disposed || identity !== taskId) return false;
      throw error;
    } finally {
      // An obsolete task never clears a replacement import/apply's busy state.
      if (!disposed && identity === taskId) { busy = false; notify(); }
    }
  }
  function restore(direction: 'undo' | 'redo') {
    if (disposed || busy) return;
    history = direction === 'undo' ? undo(history) : redo(history);
    notify();
  }
  function dispose() {
    if (disposed) return;
    disposed = true; reset();
  }
  return {
    read, clear, commitAnnotations, dispose,
    importImage: (load: () => Promise<Image>) => run(load, true, []),
    apply: (transform: () => Promise<Image>, annotations: Annotation[]) => run(transform, false, annotations),
    undo: () => restore('undo'),
    redo: () => restore('redo'),
  };
}
