export interface TextAnnotation {
  id: number;
  type: 'text';
  x: number;
  y: number;
  text: string;
  fontSize: number;
  color: string;
}

export interface LineAnnotation {
  id: number;
  type: 'line';
  points: [number, number, number, number];
  color: string;
  strokeWidth: number;
}

export type Annotation = TextAnnotation | LineAnnotation;

export type ActiveTool = 'none' | 'text' | 'line';

export type ParamField = 'color' | 'lineWidth' | 'fontSize' | 'text';

/** Which parameter rows the panel shows for the current tool and selection. */
export function paramsFor(activeTool: ActiveTool, selected: Annotation | null): ParamField[] {
  // A drawing tool owns the panel while it is active — an existing selection
  // must not change the rows under the pointer that is about to add one.
  const kind = activeTool === 'none' ? selected?.type ?? null : activeTool;
  if (kind === 'text') return ['color', 'fontSize', 'text'];
  if (kind === 'line') return ['color', 'lineWidth'];
  return [];
}

export const HISTORY_LIMIT = 100;

export interface History<T> {
  states: T[];
  cursor: number;
  limit: number;
}

// The annotations are plain JSON data, and the component hands over Vue
// reactive proxies, which `structuredClone` refuses. A JSON round trip copies
// the values without caring what wraps them.
function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function createHistory<T>(initial: T, limit = HISTORY_LIMIT): History<T> {
  return { states: [clone(initial)], cursor: 0, limit };
}

/** Records a new state, dropping any redo tail and the oldest states past `limit`. */
export function commit<T>(history: History<T>, state: T): History<T> {
  const states = history.states.slice(0, history.cursor + 1);
  states.push(clone(state));
  const capped = states.length > history.limit ? states.slice(states.length - history.limit) : states;
  return { states: capped, cursor: capped.length - 1, limit: history.limit };
}

export function undo<T>(history: History<T>): History<T> {
  return history.cursor > 0 ? { ...history, cursor: history.cursor - 1 } : history;
}

export function redo<T>(history: History<T>): History<T> {
  return history.cursor < history.states.length - 1 ? { ...history, cursor: history.cursor + 1 } : history;
}

export function canUndo<T>(history: History<T>): boolean {
  return history.cursor > 0;
}

export function canRedo<T>(history: History<T>): boolean {
  return history.cursor < history.states.length - 1;
}

/** The state at the cursor, as a copy the caller may edit freely. */
export function historyState<T>(history: History<T>): T {
  return clone(history.states[history.cursor]);
}

export function moveLine(annotation: LineAnnotation, dx: number, dy: number): LineAnnotation {
  const [x1, y1, x2, y2] = annotation.points;
  return { ...annotation, points: [x1 + dx, y1 + dy, x2 + dx, y2 + dy] };
}

export function moveLineEndpoint(
  annotation: LineAnnotation,
  end: 0 | 1,
  x: number,
  y: number,
): LineAnnotation {
  const [x1, y1, x2, y2] = annotation.points;
  return { ...annotation, points: end === 0 ? [x, y, x2, y2] : [x1, y1, x, y] };
}
