/**
 * 时间格式化工具
 */
import dayjs, { type Dayjs } from 'dayjs';
import 'dayjs/locale/zh-cn';
import 'dayjs/locale/en';
import relativeTime from 'dayjs/plugin/relativeTime';
import duration from 'dayjs/plugin/duration';

dayjs.extend(relativeTime);
dayjs.extend(duration);

/**
 * 常用日期格式
 */
export const DATE_FORMATS = {
  DATE: 'YYYY-MM-DD',
  DATETIME: 'YYYY-MM-DD HH:mm:ss',
  TIME: 'HH:mm:ss',
  DATETIME_SHORT: 'YYYY-MM-DD HH:mm',
  MONTH_DAY: 'MM-DD',
  YEAR_MONTH: 'YYYY-MM',
  ISO: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
} as const;

/**
 * 格式化日期
 * @param date - 日期值（Date、string、number或Dayjs对象）
 * @param format - 格式字符串，默认为 YYYY-MM-DD
 * @returns 格式化后的日期字符串
 */
export function formatDate(
  date: Date | string | number | Dayjs | null | undefined,
  format: string = DATE_FORMATS.DATE
): string {
  if (!date) {
    return '';
  }
  return dayjs(date).format(format);
}

/**
 * 格式化日期时间
 * @param date - 日期值
 * @param format - 格式字符串，默认为 YYYY-MM-DD HH:mm:ss
 * @returns 格式化后的日期时间字符串
 */
export function formatDateTime(
  date: Date | string | number | Dayjs | null | undefined,
  format: string = DATE_FORMATS.DATETIME
): string {
  return formatDate(date, format);
}

/**
 * 格式化时间
 * @param date - 日期值
 * @param format - 格式字符串，默认为 HH:mm:ss
 * @returns 格式化后的时间字符串
 */
export function formatTime(
  date: Date | string | number | Dayjs | null | undefined,
  format: string = DATE_FORMATS.TIME
): string {
  return formatDate(date, format);
}

/**
 * 格式化相对时间（刚刚、几分钟前等）
 * @param date - 日期值
 * @param locale - 语言，默认为 'zh-cn'
 * @returns 相对时间字符串
 */
export function formatRelativeTime(
  date: Date | string | number | Dayjs | null | undefined,
  locale: 'zh-cn' | 'en' = 'zh-cn'
): string {
  if (!date) {
    return '';
  }
  const dayjsInstance = dayjs(date).locale(locale);
  return dayjsInstance.fromNow();
}

/**
 * 格式化持续时间
 * @param milliseconds - 毫秒数
 * @param format - 格式字符串，如 'HH:mm:ss'
 * @returns 格式化后的持续时间字符串
 */
export function formatDuration(
  milliseconds: number,
  format: string = 'HH:mm:ss'
): string {
  return dayjs.duration(milliseconds).format(format);
}
