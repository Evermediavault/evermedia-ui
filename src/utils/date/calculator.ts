/**
 * 时间计算工具
 */
import dayjs, { type Dayjs } from 'dayjs';

/**
 * 获取当前时间
 * @returns Dayjs对象
 */
export function now(): Dayjs {
  return dayjs();
}

/**
 * 获取今天的开始时间（00:00:00）
 * @returns Dayjs对象
 */
export function startOfToday(): Dayjs {
  return dayjs().startOf('day');
}

/**
 * 获取今天的结束时间（23:59:59）
 * @returns Dayjs对象
 */
export function endOfToday(): Dayjs {
  return dayjs().endOf('day');
}

/**
 * 获取指定日期的开始时间
 * @param date - 日期值
 * @returns Dayjs对象
 */
export function startOfDay(
  date: Date | string | number | Dayjs | null | undefined
): Dayjs {
  return dayjs(date).startOf('day');
}

/**
 * 获取指定日期的结束时间
 * @param date - 日期值
 * @returns Dayjs对象
 */
export function endOfDay(
  date: Date | string | number | Dayjs | null | undefined
): Dayjs {
  return dayjs(date).endOf('day');
}

/**
 * 添加天数
 * @param date - 日期值
 * @param days - 天数
 * @returns 新的Dayjs对象
 */
export function addDays(
  date: Date | string | number | Dayjs | null | undefined,
  days: number
): Dayjs {
  return dayjs(date).add(days, 'day');
}

/**
 * 减去天数
 * @param date - 日期值
 * @param days - 天数
 * @returns 新的Dayjs对象
 */
export function subtractDays(
  date: Date | string | number | Dayjs | null | undefined,
  days: number
): Dayjs {
  return dayjs(date).subtract(days, 'day');
}

/**
 * 添加月份
 * @param date - 日期值
 * @param months - 月数
 * @returns 新的Dayjs对象
 */
export function addMonths(
  date: Date | string | number | Dayjs | null | undefined,
  months: number
): Dayjs {
  return dayjs(date).add(months, 'month');
}

/**
 * 减去月份
 * @param date - 日期值
 * @param months - 月数
 * @returns 新的Dayjs对象
 */
export function subtractMonths(
  date: Date | string | number | Dayjs | null | undefined,
  months: number
): Dayjs {
  return dayjs(date).subtract(months, 'month');
}

/**
 * 添加年份
 * @param date - 日期值
 * @param years - 年数
 * @returns 新的Dayjs对象
 */
export function addYears(
  date: Date | string | number | Dayjs | null | undefined,
  years: number
): Dayjs {
  return dayjs(date).add(years, 'year');
}

/**
 * 减去年份
 * @param date - 日期值
 * @param years - 年数
 * @returns 新的Dayjs对象
 */
export function subtractYears(
  date: Date | string | number | Dayjs | null | undefined,
  years: number
): Dayjs {
  return dayjs(date).subtract(years, 'year');
}

/**
 * 计算两个日期之间的差值（天数）
 * @param date1 - 第一个日期
 * @param date2 - 第二个日期
 * @returns 天数差值
 */
export function diffInDays(
  date1: Date | string | number | Dayjs | null | undefined,
  date2: Date | string | number | Dayjs | null | undefined
): number {
  return dayjs(date1).diff(dayjs(date2), 'day');
}

/**
 * 计算两个日期之间的差值（小时数）
 * @param date1 - 第一个日期
 * @param date2 - 第二个日期
 * @returns 小时数差值
 */
export function diffInHours(
  date1: Date | string | number | Dayjs | null | undefined,
  date2: Date | string | number | Dayjs | null | undefined
): number {
  return dayjs(date1).diff(dayjs(date2), 'hour');
}

/**
 * 计算两个日期之间的差值（分钟数）
 * @param date1 - 第一个日期
 * @param date2 - 第二个日期
 * @returns 分钟数差值
 */
export function diffInMinutes(
  date1: Date | string | number | Dayjs | null | undefined,
  date2: Date | string | number | Dayjs | null | undefined
): number {
  return dayjs(date1).diff(dayjs(date2), 'minute');
}

/**
 * 判断日期是否在今天
 * @param date - 日期值
 * @returns 是否在今天
 */
export function isToday(
  date: Date | string | number | Dayjs | null | undefined
): boolean {
  return dayjs(date).isSame(dayjs(), 'day');
}

/**
 * 判断日期是否在昨天
 * @param date - 日期值
 * @returns 是否在昨天
 */
export function isYesterday(
  date: Date | string | number | Dayjs | null | undefined
): boolean {
  return dayjs(date).isSame(dayjs().subtract(1, 'day'), 'day');
}

/**
 * 判断日期是否在明天
 * @param date - 日期值
 * @returns 是否在明天
 */
export function isTomorrow(
  date: Date | string | number | Dayjs | null | undefined
): boolean {
  return dayjs(date).isSame(dayjs().add(1, 'day'), 'day');
}

/**
 * 判断日期是否在过去
 * @param date - 日期值
 * @returns 是否在过去
 */
export function isPast(
  date: Date | string | number | Dayjs | null | undefined
): boolean {
  return dayjs(date).isBefore(dayjs());
}

/**
 * 判断日期是否在未来
 * @param date - 日期值
 * @returns 是否在未来
 */
export function isFuture(
  date: Date | string | number | Dayjs | null | undefined
): boolean {
  return dayjs(date).isAfter(dayjs());
}
