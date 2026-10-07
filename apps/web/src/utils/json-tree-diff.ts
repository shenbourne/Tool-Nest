/**
 * Recursive tree-shaped JSON comparison.
 *
 * Unlike the legacy flat path diff, this walks both values in parallel and
 * emits one row per node (leaf or container), so unchanged keys are listed
 * too and array/object children are compared item by item. Arrays align by
 * index; extra items on either side become added/removed rows.
 */

export type JsonDiffRowType = 'same' | 'added' | 'removed' | 'changed';

export interface JsonDiffRow {
  /** 0-based depth used for tree indentation. */
  depth: number;
  /** Last path segment shown in the tree column (e.g. `name`, `[0]`). */
  label: string;
  /** True when this node is the last child of its parent (renders └─). */
  isLast: boolean;
  /**
   * For each ancestor depth from 1 to depth-1, whether that ancestor is the
   * last child of its parent. Used to draw the tree guide lines: a `true`
   * entry means no vertical line at that level, `false` means draw one.
   */
  ancestorLast: boolean[];
  type: JsonDiffRowType;
  /** True when this row displays a container count ({N}/[N]) rather than a scalar value. */
  isContainer: boolean;
  leftValue?: string;
  rightValue?: string;
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function formatScalar(v: unknown): string {
  if (v === undefined) return '';
  if (typeof v === 'object') return JSON.stringify(v);
  if (typeof v === 'string') return JSON.stringify(v);
  return String(v);
}

function formatContainer(v: unknown): string {
  return Array.isArray(v) ? `[${(v as unknown[]).length}]` : `{${Object.keys(v as object).length}}`;
}

function scalarRow(depth: number, label: string, isLast: boolean, ancestorLast: boolean[], type: JsonDiffRowType, a: unknown, b: unknown): JsonDiffRow {
  return {
    depth,
    label,
    isLast,
    ancestorLast,
    type,
    leftValue: type === 'added' ? undefined : formatScalar(a),
    rightValue: type === 'removed' ? undefined : formatScalar(b),
    isContainer: false,
  };
}

function walk(a: unknown, b: unknown, depth: number, label: string, isLast: boolean, ancestorLast: boolean[], out: JsonDiffRow[]): void {
  const aObj = isPlainObject(a);
  const bObj = isPlainObject(b);
  const aArr = Array.isArray(a);
  const bArr = Array.isArray(b);

  if (aObj && bObj) {
    const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])];
    out.push({ depth, label, isLast, ancestorLast, type: 'same', leftValue: formatContainer(a), rightValue: formatContainer(b), isContainer: true });
    keys.forEach((key, idx) => {
      const last = idx === keys.length - 1;
      const childAncestors = [...ancestorLast, isLast];
      const hasA = key in a;
      const hasB = key in b;
      if (hasA && hasB) walk(a[key], b[key], depth + 1, key, last, childAncestors, out);
      else if (hasA) emitAll(a[key], depth + 1, key, last, childAncestors, 'removed', out);
      else emitAll(b[key], depth + 1, key, last, childAncestors, 'added', out);
    });
    return;
  }

  if (aArr && bArr) {
    const max = Math.max(a.length, b.length);
    out.push({ depth, label, isLast, ancestorLast, type: 'same', leftValue: formatContainer(a), rightValue: formatContainer(b), isContainer: true });
    for (let i = 0; i < max; i++) {
      const itemLabel = `[${i}]`;
      const last = i === max - 1;
      const childAncestors = [...ancestorLast, isLast];
      const hasA = i < a.length;
      const hasB = i < b.length;
      if (hasA && hasB) walk(a[i], b[i], depth + 1, itemLabel, last, childAncestors, out);
      else if (hasA) emitAll(a[i], depth + 1, itemLabel, last, childAncestors, 'removed', out);
      else emitAll(b[i], depth + 1, itemLabel, last, childAncestors, 'added', out);
    }
    return;
  }

  if (aObj || bObj || aArr || bArr) {
    // One side is a container and the other is not (or container kinds differ).
    out.push({
      depth,
      label,
      isLast,
      ancestorLast,
      type: 'changed',
      leftValue: formatScalar(a),
      rightValue: formatScalar(b),
      isContainer: false,
    });
    return;
  }

  out.push(scalarRow(depth, label, isLast, ancestorLast, a === b ? 'same' : 'changed', a, b));
}

function emitAll(v: unknown, depth: number, label: string, isLast: boolean, ancestorLast: boolean[], type: 'added' | 'removed', out: JsonDiffRow[]): void {
  const isCont = isPlainObject(v) || Array.isArray(v);
  const formatted = isCont ? formatContainer(v) : formatScalar(v);
  out.push({
    depth,
    label,
    isLast,
    ancestorLast,
    type,
    isContainer: isCont,
    leftValue: type === 'added' ? undefined : formatted,
    rightValue: type === 'removed' ? undefined : formatted,
  });
  const childAncestors = [...ancestorLast, isLast];
  if (isPlainObject(v)) {
    const keys = Object.keys(v);
    keys.forEach((key, idx) => emitAll(v[key], depth + 1, key, idx === keys.length - 1, childAncestors, type, out));
  } else if (Array.isArray(v)) {
    for (let i = 0; i < v.length; i++) emitAll(v[i], depth + 1, `[${i}]`, i === v.length - 1, childAncestors, type, out);
  }
}

export function diffJsonTree(a: unknown, b: unknown): JsonDiffRow[] {
  const out: JsonDiffRow[] = [];
  walk(a, b, 0, '(root)', true, [], out);
  return out;
}

export interface JsonDiffStats {
  same: number;
  added: number;
  removed: number;
  changed: number;
}

export function summarizeJsonTree(rows: JsonDiffRow[]): JsonDiffStats {
  const s: JsonDiffStats = { same: 0, added: 0, removed: 0, changed: 0 };
  for (const row of rows) s[row.type]++;
  return s;
}
