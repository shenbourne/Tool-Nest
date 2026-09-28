import { describe, expect, it } from 'vitest';
import { audioAtempoFilter, videoSetptsFilter } from './ffmpeg-speed';

// The speed tools label their options with a playback-speed multiplier (2x is
// twice as fast), so PTS — a duration — must scale by the reciprocal.
describe('videoSetptsFilter', () => {
  it('takes 2x to half the presentation timestamps', () => {
    expect(videoSetptsFilter(2)).toBe('setpts=PTS/2');
  });

  it('takes 4x to a quarter of the presentation timestamps', () => {
    expect(videoSetptsFilter(4)).toBe('setpts=PTS/4');
  });

  it('takes 0.5x to double the presentation timestamps', () => {
    expect(videoSetptsFilter(0.5)).toBe('setpts=PTS/0.5');
  });

  it('takes 0.25x to quadruple the presentation timestamps', () => {
    expect(videoSetptsFilter(0.25)).toBe('setpts=PTS/0.25');
  });

  it('leaves the timestamps alone at 1x', () => {
    expect(videoSetptsFilter(1)).toBe('setpts=PTS/1');
  });

  it('scales the duration by the reciprocal of the selected speed', () => {
    const durationFactor = (speed: number) =>
      1 / Number(videoSetptsFilter(speed).replace('setpts=PTS/', ''));

    expect(durationFactor(2)).toBe(0.5);
    expect(durationFactor(0.25)).toBe(4);
  });
});

describe('audioAtempoFilter', () => {
  it('passes in-range speeds straight to atempo', () => {
    expect(audioAtempoFilter(2)).toBe('atempo=2');
    expect(audioAtempoFilter(1.5)).toBe('atempo=1.5');
    expect(audioAtempoFilter(1)).toBe('atempo=1');
  });

  it('chains atempo for speeds below the 0.5 floor', () => {
    expect(audioAtempoFilter(0.25)).toBe('atempo=0.5,atempo=0.5');
  });

  it('chains atempo for speeds above the 100 ceiling', () => {
    expect(audioAtempoFilter(400)).toBe('atempo=100,atempo=4');
  });

  it('never feeds atempo a factor it rejects', () => {
    for (const speed of [0.25, 0.5, 1, 1.5, 2, 4]) {
      for (const factor of audioAtempoFilter(speed).split(',')) {
        const value = Number(factor.replace('atempo=', ''));
        expect(value).toBeGreaterThanOrEqual(0.5);
        expect(value).toBeLessThanOrEqual(100);
      }
    }
  });
});
