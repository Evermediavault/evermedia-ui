/**
 * 时间处理组合式函数
 */
import { computed, ref, type Ref } from 'vue';
import dayjs, { type Dayjs } from 'dayjs';
import { formatDate, formatDateTime, formatRelativeTime } from './formatter';
import { useI18n } from 'vue-i18n';

/**
 * 使用日期格式化
 * @param date - 日期值（响应式或静态）
 * @param format - 格式字符串
 * @returns 格式化后的日期字符串（响应式）
 */
export function useDateFormat(
  date: Ref<Date | string | number | Dayjs | null | undefined> | Date | string | number | Dayjs | null | undefined,
  format: string = 'YYYY-MM-DD'
) {
  const dateRef =
    typeof date === 'object' && date !== null && 'value' in date
      ? date
      : ref(date);

  return computed(() => {
    return formatDate(dateRef.value, format);
  });
}

/**
 * 使用日期时间格式化
 * @param date - 日期值（响应式或静态）
 * @param format - 格式字符串
 * @returns 格式化后的日期时间字符串（响应式）
 */
export function useDateTimeFormat(
  date: Ref<Date | string | number | Dayjs | null | undefined> | Date | string | number | Dayjs | null | undefined,
  format: string = 'YYYY-MM-DD HH:mm:ss'
) {
  const dateRef =
    typeof date === 'object' && date !== null && 'value' in date
      ? date
      : ref(date);

  return computed(() => {
    return formatDateTime(dateRef.value, format);
  });
}

/**
 * 使用相对时间格式化（根据当前语言）
 * @param date - 日期值（响应式或静态）
 * @returns 相对时间字符串（响应式）
 */
export function useRelativeTime(
  date: Ref<Date | string | number | Dayjs | null | undefined> | Date | string | number | Dayjs | null | undefined
) {
  const { locale } = useI18n();
  const dateRef =
    typeof date === 'object' && date !== null && 'value' in date
      ? date
      : ref(date);

  return computed(() => {
    const currentLocale = locale.value === 'zh-CN' ? 'zh-cn' : 'en';
    return formatRelativeTime(dateRef.value, currentLocale);
  });
}

/**
 * 使用当前时间
 * @returns 当前时间的Dayjs对象（响应式，每秒更新）
 */
export function useNow() {
  const now = computed(() => dayjs());
  return now;
}
