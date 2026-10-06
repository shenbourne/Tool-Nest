import { describe, expect, it } from 'vitest';
import {
  arrowPoints,
  boxBlurImageData,
  canRedo,
  canUndo,
  commit,
  createHistory,
  distToSegment,
  formatNumber,
  historyState,
  mosaicImageData,
  rectFromPoints,
  strokeDash,
  undo,
} from './image-editor.service';

describe('strokeDash', () => {
  it('returns an empty array for solid', () => {
    expect(strokeDash('solid', 2)).toEqual([]);
  });

  it('scales the five styles with width', () => {
    const base = {
      'dash-long': strokeDash('dash-long', 1),
      'dash-short': strokeDash('dash-short', 1),
      'dash-dot': strokeDash('dash-dot', 1),
      'dash-dot-dot': strokeDash('dash-dot-dot', 1),
    };
    for (const width of [2, 3, 5]) {
      const scale = Math.max(1, width);
      for (const style of ['dash-long', 'dash-short', 'dash-dot', 'dash-dot-dot'] as const) {
        expect(strokeDash(style, width)).toEqual(base[style].map((v) => v * scale));
      }
    }
  });

  it('treats non-positive widths as 1', () => {
    expect(strokeDash('dash-long', 0)).toEqual(strokeDash('dash-long', 1));
    expect(strokeDash('dash-long', -3)).toEqual(strokeDash('dash-long', 1));
  });
});

describe('formatNumber', () => {
  it('formats plain numbers', () => {
    expect(formatNumber(1, 'number')).toBe('1');
    expect(formatNumber(42, 'number')).toBe('42');
  });

  it('formats lower and upper alpha with Excel-style carry past 26', () => {
    expect(formatNumber(1, 'lower-alpha')).toBe('a');
    expect(formatNumber(26, 'lower-alpha')).toBe('z');
    expect(formatNumber(27, 'lower-alpha')).toBe('aa');
    expect(formatNumber(28, 'lower-alpha')).toBe('ab');
    expect(formatNumber(52, 'lower-alpha')).toBe('az');
    expect(formatNumber(53, 'lower-alpha')).toBe('ba');
    expect(formatNumber(702, 'lower-alpha')).toBe('zz');
    expect(formatNumber(703, 'lower-alpha')).toBe('aaa');
    expect(formatNumber(1, 'upper-alpha')).toBe('A');
    expect(formatNumber(26, 'upper-alpha')).toBe('Z');
    expect(formatNumber(27, 'upper-alpha')).toBe('AA');
    expect(formatNumber(28, 'upper-alpha')).toBe('AB');
  });

  it('formats lower and upper roman numerals', () => {
    expect(formatNumber(1, 'lower-roman')).toBe('i');
    expect(formatNumber(4, 'lower-roman')).toBe('iv');
    expect(formatNumber(9, 'lower-roman')).toBe('ix');
    expect(formatNumber(40, 'lower-roman')).toBe('xl');
    expect(formatNumber(90, 'lower-roman')).toBe('xc');
    expect(formatNumber(400, 'lower-roman')).toBe('cd');
    expect(formatNumber(900, 'lower-roman')).toBe('cm');
    expect(formatNumber(1994, 'lower-roman')).toBe('mcmxciv');
    expect(formatNumber(2024, 'lower-roman')).toBe('mmxxiv');
    expect(formatNumber(1, 'upper-roman')).toBe('I');
    expect(formatNumber(4, 'upper-roman')).toBe('IV');
    expect(formatNumber(9, 'upper-roman')).toBe('IX');
    expect(formatNumber(40, 'upper-roman')).toBe('XL');
    expect(formatNumber(90, 'upper-roman')).toBe('XC');
    expect(formatNumber(400, 'upper-roman')).toBe('CD');
    expect(formatNumber(900, 'upper-roman')).toBe('CM');
    expect(formatNumber(1994, 'upper-roman')).toBe('MCMXCIV');
    expect(formatNumber(2024, 'upper-roman')).toBe('MMXXIV');
  });
});

describe('arrowPoints', () => {
  it('returns a closed triangle polygon for the triangle style', () => {
    const pts = arrowPoints(0, 0, 10, 0, { style: 'triangle', size: 4 });
    expect(pts.length).toBe(6);
    expect(pts[0]).toBeCloseTo(10);
    expect(pts[1]).toBeCloseTo(0);
  });

  it('returns an open V shape for the open style', () => {
    const pts = arrowPoints(0, 0, 10, 0, { style: 'open', size: 4 });
    expect(pts.length).toBe(4);
  });

  it('returns a diamond for the circle style', () => {
    const pts = arrowPoints(0, 0, 10, 0, { style: 'circle', size: 4 });
    expect(pts.length).toBe(8);
  });

  it('returns an empty array for a degenerate zero-length segment', () => {
    expect(arrowPoints(5, 5, 5, 5, { style: 'triangle', size: 4 })).toEqual([]);
    expect(arrowPoints(5, 5, 5, 5, { style: 'open', size: 4 })).toEqual([]);
    expect(arrowPoints(5, 5, 5, 5, { style: 'circle', size: 4 })).toEqual([]);
  });
});

describe('distToSegment', () => {
  it('measures the perpendicular distance inside the segment', () => {
    expect(distToSegment(5, 5, 0, 0, 10, 0)).toBeCloseTo(5);
  });

  it('measures the distance to the nearest endpoint outside the segment', () => {
    expect(distToSegment(-3, 4, 0, 0, 10, 0)).toBeCloseTo(5);
    expect(distToSegment(13, 4, 0, 0, 10, 0)).toBeCloseTo(5);
  });

  it('is zero for a point on the segment', () => {
    expect(distToSegment(5, 0, 0, 0, 10, 0)).toBe(0);
  });
});

describe('rectFromPoints', () => {
  it('normalises an inverted drag', () => {
    expect(rectFromPoints(10, 20, 4, 6)).toEqual({ x: 4, y: 6, width: 6, height: 14 });
  });

  it('keeps a normal drag as-is', () => {
    expect(rectFromPoints(4, 6, 10, 20)).toEqual({ x: 4, y: 6, width: 6, height: 14 });
  });
});

function makeImageData(width: number, height: number, paint: (x: number, y: number) => [number, number, number, number]) {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = paint(x, y);
      const i = (y * width + x) * 4;
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = a;
    }
  }
  return { data, width, height };
}

function uniqueColours(img: { data: Uint8ClampedArray }) {
  const seen = new Set<string>();
  for (let i = 0; i < img.data.length; i += 4) {
    seen.add(`${img.data[i]},${img.data[i + 1]},${img.data[i + 2]},${img.data[i + 3]}`);
  }
  return seen.size;
}

describe('mosaicImageData', () => {
  it('reduces the number of unique colours', () => {
    const img = makeImageData(16, 16, (x, y) => [(x * 16) % 256, (y * 16) % 256, ((x + y) * 8) % 256, 255]);
    const before = uniqueColours(img);
    const out = mosaicImageData(img, 4);
    expect(uniqueColours(out)).toBeLessThan(before);
    expect(out.width).toBe(img.width);
    expect(out.height).toBe(img.height);
  });
});

describe('boxBlurImageData', () => {
  it('changes pixels but keeps dimensions', () => {
    const img = makeImageData(8, 8, (x, y) => [(x * 32) % 256, (y * 32) % 256, 128, 255]);
    const out = boxBlurImageData(img, 2);
    expect(out.width).toBe(img.width);
    expect(out.height).toBe(img.height);
    expect(Array.from(out.data)).not.toEqual(Array.from(img.data));
  });
});

describe('annotation history', () => {
  it('drops the redo tail when a new state is committed', () => {
    let history = createHistory<number[]>([]);
    history = commit(history, [1]);
    history = commit(history, [1, 2]);
    history = undo(history);
    expect(canRedo(history)).toBe(true);

    history = commit(history, [9]);
    expect(canRedo(history)).toBe(false);
    expect(historyState(history)).toEqual([9]);
    history = undo(history);
    expect(historyState(history)).toEqual([1]);
  });

  it('keeps only the newest states once the cap is reached', () => {
    let history = createHistory<number[]>([], 3);
    for (const value of [1, 2, 3, 4]) history = commit(history, [value]);

    expect(history.states).toHaveLength(3);
    expect(historyState(history)).toEqual([4]);
    expect(canUndo(history)).toBe(true);

    history = undo(history);
    history = undo(history);
    expect(historyState(history)).toEqual([2]);
    expect(canUndo(history)).toBe(false);
  });

  it('never hands out a reference into its own snapshots', () => {
    let history = createHistory<{ x: number }[]>([]);
    history = commit(history, [{ x: 5 }]);

    const handed = historyState(history);
    handed[0].x = 999;
    expect(historyState(history)[0].x).toBe(5);

    const restored = historyState(history);
    restored.push({ x: 1 });
    expect(historyState(history)).toHaveLength(1);
  });
});
