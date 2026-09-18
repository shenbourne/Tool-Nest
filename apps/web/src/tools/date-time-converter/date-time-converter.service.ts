import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';

dayjs.extend(customParseFormat);
dayjs.extend(relativeTime);
dayjs.extend(utc);

export interface DateConversionResult {
  label: string;
  value: string;
}

export type InputFormat = 'auto' | 'iso8601' | 'unix' | 'unix-ms' | 'rfc3339' | 'utc' | 'custom';

function parseRfc3339(input: string): dayjs.Dayjs {
  // RFC 3339 is profile of ISO 8601; dayjs handles it natively
  return dayjs(input);
}

export function convertDate(input: string, inputFormat: InputFormat, customFormat?: string): { results: DateConversionResult[]; error: string | null } {
  if (!input.trim()) {
    return { results: [], error: null };
  }

  let date: dayjs.Dayjs;

  switch (inputFormat) {
    case 'unix': {
      const n = Number(input);
      if (isNaN(n)) return { results: [], error: 'Invalid Unix timestamp (seconds)' };
      date = dayjs(n * 1000);
      break;
    }
    case 'unix-ms': {
      const n = Number(input);
      if (isNaN(n)) return { results: [], error: 'Invalid Unix timestamp (ms)' };
      date = dayjs(n);
      break;
    }
    case 'iso8601': {
      date = dayjs(input);
      if (!date.isValid()) return { results: [], error: 'Invalid ISO 8601 date' };
      break;
    }
    case 'rfc3339': {
      date = parseRfc3339(input);
      if (!date.isValid()) return { results: [], error: 'Invalid RFC 3339 date' };
      break;
    }
    case 'utc': {
      date = dayjs.utc(input);
      if (!date.isValid()) return { results: [], error: 'Invalid UTC string' };
      break;
    }
    case 'custom': {
      if (!customFormat) return { results: [], error: 'Custom format string required' };
      date = dayjs(input, customFormat);
      if (!date.isValid()) return { results: [], error: `Input does not match format "${customFormat}"` };
      break;
    }
    case 'auto':
    default: {
      // Try numeric timestamps first
      const trimmed = input.trim();
      const asNumber = Number(trimmed);
      if (!isNaN(asNumber) && trimmed.length >= 9) {
        // Looks like a timestamp
        if (asNumber > 1e12) {
          date = dayjs(asNumber); // milliseconds
        } else if (asNumber > 1e8) {
          date = dayjs(asNumber * 1000); // seconds
        } else {
          date = dayjs(trimmed);
        }
      } else {
        date = dayjs(trimmed);
      }
      break;
    }
  }

  if (!date.isValid()) {
    return { results: [], error: 'Invalid date input' };
  }

  const results: DateConversionResult[] = [
    { label: 'ISO 8601', value: date.toISOString() },
    { label: 'Unix Timestamp (s)', value: String(date.unix()) },
    { label: 'Unix Timestamp (ms)', value: String(date.valueOf()) },
    { label: 'RFC 3339', value: date.utc().format('YYYY-MM-DDTHH:mm:ssZ') },
    { label: 'UTC String', value: date.toDate().toUTCString() },
    { label: 'Local Date Time', value: date.format('YYYY-MM-DD HH:mm:ss') },
    { label: 'Relative', value: date.fromNow() },
  ];

  return { results, error: null };
}
