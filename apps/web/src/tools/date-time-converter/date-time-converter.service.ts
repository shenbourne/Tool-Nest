import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import 'dayjs/locale/zh-cn';
import { i18n } from '@/i18n';

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

  dayjs.locale(i18n.global.locale.value === 'zh' ? 'zh-cn' : 'en');

  let date: dayjs.Dayjs;

  switch (inputFormat) {
    case 'unix': {
      const n = Number(input);
      if (isNaN(n)) return { results: [], error: i18n.global.t('tools.dateTimeConverter.errorInvalidUnixSeconds') };
      date = dayjs(n * 1000);
      break;
    }
    case 'unix-ms': {
      const n = Number(input);
      if (isNaN(n)) return { results: [], error: i18n.global.t('tools.dateTimeConverter.errorInvalidUnixMs') };
      date = dayjs(n);
      break;
    }
    case 'iso8601': {
      date = dayjs(input);
      if (!date.isValid()) return { results: [], error: i18n.global.t('tools.dateTimeConverter.errorInvalidIso') };
      break;
    }
    case 'rfc3339': {
      date = parseRfc3339(input);
      if (!date.isValid()) return { results: [], error: i18n.global.t('tools.dateTimeConverter.errorInvalidRfc') };
      break;
    }
    case 'utc': {
      date = dayjs.utc(input);
      if (!date.isValid()) return { results: [], error: i18n.global.t('tools.dateTimeConverter.errorInvalidUtc') };
      break;
    }
    case 'custom': {
      if (!customFormat) return { results: [], error: i18n.global.t('tools.dateTimeConverter.errorCustomFormatRequired') };
      date = dayjs(input, customFormat);
      if (!date.isValid()) return { results: [], error: i18n.global.t('tools.dateTimeConverter.errorFormatMismatch', { format: customFormat }) };
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
    return { results: [], error: i18n.global.t('tools.dateTimeConverter.errorInvalidDate') };
  }

  const results: DateConversionResult[] = [
    { label: 'ISO 8601', value: date.toISOString() },
    { label: i18n.global.t('tools.dateTimeConverter.labelUnixSeconds'), value: String(date.unix()) },
    { label: i18n.global.t('tools.dateTimeConverter.labelUnixMilliseconds'), value: String(date.valueOf()) },
    { label: 'RFC 3339', value: date.utc().format('YYYY-MM-DDTHH:mm:ssZ') },
    { label: i18n.global.t('tools.dateTimeConverter.labelUtcString'), value: date.toDate().toUTCString() },
    { label: i18n.global.t('tools.dateTimeConverter.labelLocalDateTime'), value: date.format('YYYY-MM-DD HH:mm:ss') },
    { label: i18n.global.t('tools.dateTimeConverter.labelRelative'), value: date.fromNow() },
  ];

  return { results, error: null };
}
