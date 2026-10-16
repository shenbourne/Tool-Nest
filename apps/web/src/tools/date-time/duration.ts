export type DurationUnit = 'days' | 'hours' | 'minutes' | 'seconds' | 'clock';
const factors = { days: 86400, hours: 3600, minutes: 60, seconds: 1 };
export function durationSeconds(input: string, unit: DurationUnit): number | null {
  if (!input.trim()) return null;
  let seconds: number;
  if (unit === 'clock') {
    const match = /^(\d+):([0-5]\d):([0-5]\d(?:\.\d+)?)$/.exec(input.trim());
    if (!match) return null;
    seconds = Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]);
  } else {
    if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(input.trim())) return null;
    seconds = Number(input) * factors[unit];
  }
  return Number.isFinite(seconds) && seconds >= 0 && seconds <= Number.MAX_SAFE_INTEGER ? seconds : null;
}
export function durationClock(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor(seconds % 3600 / 60);
  const remainder = Number((seconds % 60).toFixed(6));
  // Round before splitting, so 59.9999999 carries into the next minute.
  if (remainder === 60) return durationClock(Math.ceil(seconds));
  return String(hours).padStart(2, '0') + ':' + String(minutes).padStart(2, '0') + ':' + (remainder < 10 ? '0' : '') + String(remainder);
}
