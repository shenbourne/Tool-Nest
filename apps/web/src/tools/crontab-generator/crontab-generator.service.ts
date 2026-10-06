// Crontab Generator - business logic

export interface CronField {
  name: string;
  min: number;
  max: number;
  value: string;
}

export interface CronFieldDef {
  /** i18n leaf under `tools.crontabGenerator`, resolved by the component. */
  labelKey: string;
  min: number;
  max: number;
}

export const CRON_FIELDS: CronFieldDef[] = [
  { labelKey: 'fieldMinute', min: 0, max: 59 },
  { labelKey: 'fieldHour', min: 0, max: 23 },
  { labelKey: 'fieldDayOfMonth', min: 1, max: 31 },
  { labelKey: 'fieldMonth', min: 1, max: 12 },
  { labelKey: 'fieldDayOfWeek', min: 0, max: 6 },
];

export function validateField(value: string, min: number, max: number): boolean {
  if (!value || value.trim() === '') return false;
  if (value === '*') return true;

  // Handle comma-separated lists
  const parts = value.split(',');
  return parts.every(part => {
    const trimmed = part.trim();

    // Step values: */n or range/n
    if (trimmed.includes('/')) {
      const [rangePart, step] = trimmed.split('/');
      const stepNum = Number(step);
      if (isNaN(stepNum) || stepNum < 1) return false;
      if (rangePart === '*') return true;
      return validateRange(rangePart, min, max);
    }

    // Range: n-m
    if (trimmed.includes('-')) {
      return validateRange(trimmed, min, max);
    }

    // Single value
    const num = Number(trimmed);
    return !isNaN(num) && num >= min && num <= max && Number.isInteger(num);
  });
}

function validateRange(range: string, min: number, max: number): boolean {
  const parts = range.split('-');
  if (parts.length !== 2) return false;
  const start = Number(parts[0]);
  const end = Number(parts[1]);
  return !isNaN(start) && !isNaN(end)
    && start >= min && start <= max
    && end >= min && end <= max
    && start <= end
    && Number.isInteger(start) && Number.isInteger(end);
}

export function buildCronExpression(fields: string[]): string {
  return fields.join(' ');
}

export function describeCron(fields: string[]): string {
  const [minute, hour, dom, month, dow] = fields;

  // Special patterns
  if (minute === '*' && hour === '*' && dom === '*' && month === '*' && dow === '*') {
    return 'Every minute';
  }

  const parts: string[] = [];

  // Day of week
  const dowNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  if (dow !== '*') {
    if (dow.includes(',')) {
      const days = dow.split(',').map(d => dowNames[Number(d.trim())] || d.trim());
      parts.push(`on ${days.join(', ')}`);
    } else if (dow.includes('-')) {
      const [s, e] = dow.split('-');
      parts.push(`${dowNames[Number(s)] || s} through ${dowNames[Number(e)] || e}`);
    } else if (dow.includes('/')) {
      const step = dow.split('/')[1];
      parts.push(`every ${step} days of the week`);
    } else {
      parts.push(`on ${dowNames[Number(dow)] || dow}`);
    }
  }

  // Month
  const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  if (month !== '*') {
    if (month.includes(',')) {
      const months = month.split(',').map(m => monthNames[Number(m.trim())] || m.trim());
      parts.push(`in ${months.join(', ')}`);
    } else if (month.includes('-')) {
      const [s, e] = month.split('-');
      parts.push(`${monthNames[Number(s)] || s} through ${monthNames[Number(e)] || e}`);
    } else if (month.includes('/')) {
      const step = month.split('/')[1];
      parts.push(`every ${step} months`);
    } else {
      parts.push(`in ${monthNames[Number(month)] || month}`);
    }
  }

  // Day of month
  if (dom !== '*') {
    if (dom.includes(',')) {
      parts.push(`on days ${dom}`);
    } else if (dom.includes('-')) {
      parts.push(`on days ${dom.replace('-', ' through ')}`);
    } else if (dom.includes('/')) {
      const step = dom.split('/')[1];
      parts.push(`every ${step} days`);
    } else {
      parts.push(`on day ${dom}`);
    }
  }

  // Hour
  if (hour !== '*') {
    if (hour.includes(',')) {
      const hours = hour.split(',').map(h => formatHour(Number(h.trim())));
      parts.push(`at ${hours.join(', ')}`);
    } else if (hour.includes('-')) {
      const [s, e] = hour.split('-');
      parts.push(`between ${formatHour(Number(s))} and ${formatHour(Number(e))}`);
    } else if (hour.includes('/')) {
      const step = hour.split('/')[1];
      parts.push(`every ${step} hours`);
    } else {
      parts.push(`at ${formatHour(Number(hour))}`);
    }
  }

  // Minute
  if (minute !== '*') {
    if (minute.includes(',')) {
      parts.push(`at minutes ${minute}`);
    } else if (minute.includes('-')) {
      parts.push(`during minutes ${minute}`);
    } else if (minute.includes('/')) {
      const step = minute.split('/')[1];
      parts.push(`every ${step} minutes`);
    } else {
      if (hour !== '*' && !parts.some(p => p.includes('at'))) {
        parts.push(`at minute ${minute}`);
      } else if (hour !== '*') {
        // Replace the "at HH:00" with "at HH:MM"
        const lastIdx = parts.length - 1;
        for (let i = lastIdx; i >= 0; i--) {
          if (parts[i].startsWith('at ') && parts[i].match(/\d{1,2}:\d{2}/) === null) {
            // This is an hour reference, append minute
            parts[i] = parts[i].replace(/(\d{1,2})(:\d{2})?( (?:AM|PM|am|pm))?$/, `$1:${Number(minute).toString().padStart(2, '0')}$3`);
            break;
          }
        }
      } else {
        parts.push(`at minute ${minute}`);
      }
    }
  }

  if (parts.length === 0) return 'Every minute';
  return parts.join(' ');
}

function formatHour(h: number): string {
  if (h === 0) return '12:00 AM';
  if (h < 12) return `${h}:00 AM`;
  if (h === 12) return '12:00 PM';
  return `${h - 12}:00 PM`;
}

export function getNextExecutions(fields: string[], count: number = 5): Date[] {
  const [minuteF, hourF, domF, monthF, dowF] = fields;
  const results: Date[] = [];
  const now = new Date();
  const current = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes());
  current.setMinutes(current.getMinutes() + 1);
  current.setSeconds(0);

  const minutes = expandField(minuteF, 0, 59);
  const hours = expandField(hourF, 0, 23);
  const doms = expandField(domF, 1, 31);
  const months = expandField(monthF, 1, 12);
  const dows = expandField(dowF, 0, 6);
  // Standard cron day semantics: a wildcard field defers to the other field;
  // when BOTH day-of-month and day-of-week are restricted, either may match.
  const domAny = domF.trim() === '*';
  const dowAny = dowF.trim() === '*';

  // Limit search to avoid infinite loops
  const maxIterations = 366 * 24 * 60 * 4; // ~4 years of minutes
  let iterations = 0;

  while (results.length < count && iterations < maxIterations) {
    iterations++;

    if (!months.includes(current.getMonth() + 1)) {
      current.setMonth(current.getMonth() + 1);
      current.setDate(1);
      current.setHours(0);
      current.setMinutes(0);
      continue;
    }

    // Standard cron semantics: when both day-of-month and day-of-week are
    // restricted, a date matches when EITHER field matches (OR); a wildcard
    // field defers to the other one.
    const domMatch = doms.includes(current.getDate());
    const dowMatch = dows.includes(current.getDay());
    const dayMatches = domAny ? dowMatch : dowAny ? domMatch : domMatch || dowMatch;
    if (!dayMatches) {
      current.setDate(current.getDate() + 1);
      current.setHours(0);
      current.setMinutes(0);
      continue;
    }

    if (!hours.includes(current.getHours())) {
      current.setHours(current.getHours() + 1);
      current.setMinutes(0);
      continue;
    }

    if (!minutes.includes(current.getMinutes())) {
      current.setMinutes(current.getMinutes() + 1);
      continue;
    }

    results.push(new Date(current));
    current.setMinutes(current.getMinutes() + 1);
  }

  return results;
}

function expandField(field: string, min: number, max: number): number[] {
  if (field === '*') {
    return Array.from({ length: max - min + 1 }, (_, i) => i + min);
  }

  const values = new Set<number>();
  const parts = field.split(',');

  for (const part of parts) {
    const trimmed = part.trim();

    if (trimmed.includes('/')) {
      const [rangePart, stepStr] = trimmed.split('/');
      const step = Number(stepStr);
      let start = min;
      let end = max;

      if (rangePart !== '*') {
        if (rangePart.includes('-')) {
          const [s, e] = rangePart.split('-').map(Number);
          start = s;
          end = e;
        } else {
          start = Number(rangePart);
        }
      }

      for (let i = start; i <= end; i += step) {
        values.add(i);
      }
    } else if (trimmed.includes('-')) {
      const [start, end] = trimmed.split('-').map(Number);
      for (let i = start; i <= end; i++) {
        values.add(i);
      }
    } else {
      const num = Number(trimmed);
      if (!isNaN(num)) values.add(num);
    }
  }

  return Array.from(values).sort((a, b) => a - b);
}
