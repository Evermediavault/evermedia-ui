/**
 * 通用常量
 */

/**
 * 分页默认大小
 */
export const DEFAULT_PAGE_SIZE = 10;

/**
 * 分页大小选项
 */
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

/**
 * 最大文件上传大小（字节）
 */
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * 允许的文件类型
 */
export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const;

/**
 * 日期时间格式
 */
export const DATE_FORMAT = 'YYYY-MM-DD';
export const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
export const TIME_FORMAT = 'HH:mm:ss';
