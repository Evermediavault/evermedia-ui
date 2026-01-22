/**
 * 时间解析工具
 */
import dayjs, { type Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

/**
 * 解析日期字符串
 * @param dateString - 日期字符串
 * @param format - 格式字符串（可选）
 * @returns Dayjs对象，如果解析失败返回null
 */
export function parseDate(
  dateString: string,
  format?: string
): Dayjs | null {
  if (!dateString || typeof dateString !== 'string') {
    return null;
  }

  if (format) {
    const parsed = dayjs(dateString, format, true);
    return parsed.isValid() ? parsed : null;
  }

  const parsed = dayjs(dateString);
  return parsed.isValid() ? parsed : null;
}

/**
 * 解析时间戳
 * @param timestamp - 时间戳（秒或毫秒）
 * @returns Dayjs对象
 */
export function parseTimestamp(timestamp: number): Dayjs {
  // 如果时间戳小于13位，认为是秒级时间戳，需要转换为毫秒
  if (timestamp < 1000000000000) {
    return dayjs(timestamp * 1000);
  }
  return dayjs(timestamp);
}

/**
 * 验证日期字符串是否有效
 * @param dateString - 日期字符串
 * @param format - 格式字符串（可选）
 * @returns 是否有效
 */
export function isValidDate(
  dateString: string,
  format?: string
): boolean {
  if (!dateString || typeof dateString !== 'string') {
    return false;
  }

  if (format) {
    return dayjs(dateString, format, true).isValid();
  }

  return dayjs(dateString).isValid();
}
