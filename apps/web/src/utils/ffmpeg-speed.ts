// Speed is always the playback multiplier the option label shows (2x = faster).
// FFmpeg's `setpts` scales presentation timestamps, i.e. the duration, so it
// takes the reciprocal.
export function videoSetptsFilter(speed: number): string {
  return `setpts=PTS/${speed}`;
}

// `atempo` accepts only [0.5, 100], so out-of-range multipliers are split into
// a chain whose factors multiply out to the requested speed.
export function audioAtempoFilter(speed: number): string {
  const parts: string[] = [];
  let remaining = speed;
  while (remaining < 0.5) {
    parts.push('atempo=0.5');
    remaining /= 0.5;
  }
  while (remaining > 100) {
    parts.push('atempo=100');
    remaining /= 100;
  }
  parts.push(`atempo=${Math.round(remaining * 100) / 100}`);
  return parts.join(',');
}
