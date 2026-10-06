export interface DiffSegment {
  text: string;
  changed: boolean;
}

export type DiffRowType = 'same' | 'added' | 'removed' | 'changed';

export interface DiffRow {
  type: DiffRowType;
  leftNum?: number;
  rightNum?: number;
  leftText?: string;
  rightText?: string;
  leftSegments?: DiffSegment[];
  rightSegments?: DiffSegment[];
}

export interface DiffSummary {
  same: number;
  added: number;
  removed: number;
  changed: number;
}

function toLines(text: string): string[] {
  if (text === '') return [];
  const lines = text.replace(/\r\n?/g, '\n').split('\n');
  if (lines.length > 1 && lines[lines.length - 1] === '') lines.pop();
  return lines;
}

type Op = 'eq' | 'del' | 'ins';

function sesScript(a: number[], b: number[]): Op[] {
  const n = a.length;
  const m = b.length;
  const max = n + m;
  if (max === 0) return [];
  const v = new Int32Array(2 * max + 1);
  const trace: Int32Array[] = [];
  let foundD = -1;
  for (let d = 0; d <= max; d++) {
    trace.push(v.slice());
    for (let k = -d; k <= d; k += 2) {
      let x: number;
      if (k === -d || (k !== d && v[k - 1 + max] < v[k + 1 + max])) {
        x = v[k + 1 + max];
      } else {
        x = v[k - 1 + max] + 1;
      }
      let y = x - k;
      while (x < n && y < m && a[x] === b[y]) {
        x++;
        y++;
      }
      v[k + max] = x;
      if (x >= n && y >= m) {
        foundD = d;
        break;
      }
    }
    if (foundD >= 0) break;
  }
  const ops: Op[] = [];
  let x = n;
  let y = m;
  for (let d = foundD; d > 0; d--) {
    const prev = trace[d];
    const k = x - y;
    const prevK = k === -d || (k !== d && prev[k - 1 + max] < prev[k + 1 + max]) ? k + 1 : k - 1;
    const prevX = prev[prevK + max];
    const prevY = prevX - prevK;
    while (x > prevX && y > prevY) {
      ops.push('eq');
      x--;
      y--;
    }
    if (x === prevX) {
      ops.push('ins');
      y--;
    } else {
      ops.push('del');
      x--;
    }
  }
  while (x > 0 && y > 0) {
    ops.push('eq');
    x--;
    y--;
  }
  while (x > 0) {
    ops.push('del');
    x--;
  }
  while (y > 0) {
    ops.push('ins');
    y--;
  }
  return ops.reverse();
}

function charSegments(left: string, right: string): { left: DiffSegment[]; right: DiffSegment[] } {
  const minLen = Math.min(left.length, right.length);
  let prefix = 0;
  while (prefix < minLen && left[prefix] === right[prefix]) prefix++;
  let suffix = 0;
  while (suffix < minLen - prefix && left[left.length - 1 - suffix] === right[right.length - 1 - suffix]) suffix++;
  const build = (full: string): DiffSegment[] => {
    const mid = full.slice(prefix, full.length - suffix);
    const segs: DiffSegment[] = [];
    if (prefix > 0) segs.push({ text: full.slice(0, prefix), changed: false });
    if (mid !== '') segs.push({ text: mid, changed: true });
    if (suffix > 0) segs.push({ text: full.slice(full.length - suffix), changed: false });
    return segs;
  };
  return { left: build(left), right: build(right) };
}

export function diffLines(oldText: string, newText: string): DiffRow[] {
  const a = toLines(oldText);
  const b = toLines(newText);
  const ids = new Map<string, number>();
  const idOf = (s: string): number => {
    let id = ids.get(s);
    if (id === undefined) {
      id = ids.size;
      ids.set(s, id);
    }
    return id;
  };
  const ops = sesScript(a.map(idOf), b.map(idOf));
  const rows: DiffRow[] = [];
  let i = 0;
  let j = 0;
  let k = 0;
  while (k < ops.length) {
    if (ops[k] === 'eq') {
      rows.push({ type: 'same', leftNum: i + 1, rightNum: j + 1, leftText: a[i], rightText: b[j] });
      i++;
      j++;
      k++;
      continue;
    }
    const startK = k;
    while (k < ops.length && ops[k] !== 'eq') k++;
    const dels: number[] = [];
    const ins: number[] = [];
    for (let p = startK; p < k; p++) {
      if (ops[p] === 'del') dels.push(i++);
      else ins.push(j++);
    }
    const paired = Math.min(dels.length, ins.length);
    for (let p = 0; p < paired; p++) {
      const segs = charSegments(a[dels[p]], b[ins[p]]);
      rows.push({
        type: 'changed',
        leftNum: dels[p] + 1,
        rightNum: ins[p] + 1,
        leftText: a[dels[p]],
        rightText: b[ins[p]],
        leftSegments: segs.left,
        rightSegments: segs.right,
      });
    }
    for (let p = paired; p < dels.length; p++) {
      rows.push({ type: 'removed', leftNum: dels[p] + 1, leftText: a[dels[p]] });
    }
    for (let p = paired; p < ins.length; p++) {
      rows.push({ type: 'added', rightNum: ins[p] + 1, rightText: b[ins[p]] });
    }
  }
  return rows;
}

export function summarize(rows: DiffRow[]): DiffSummary {
  const s: DiffSummary = { same: 0, added: 0, removed: 0, changed: 0 };
  for (const r of rows) s[r.type]++;
  return s;
}
