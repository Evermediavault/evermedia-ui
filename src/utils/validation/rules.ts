/**
 * 数据验证工具函数
 * 纯函数实现，无外部依赖
 */

/**
 * 验证邮箱格式
 * @param email - 邮箱地址
 * @returns 是否为有效邮箱
 */
export function isEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email.trim());
}

/**
 * 验证URL格式
 * @param url - URL地址
 * @returns 是否为有效URL
 */
export function isUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * 验证密码强度
 * 要求：至少8位，包含大小写字母、数字和特殊字符
 * @param password - 密码字符串
 * @returns 是否为强密码
 */
export function isPasswordStrong(password: string): boolean {
  if (!password || typeof password !== 'string') {
    return false;
  }
  // 至少8位，包含大小写字母、数字和特殊字符
  const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
  return strongPasswordRegex.test(password);
}

/**
 * 验证数字是否在指定范围内
 * @param value - 数字值
 * @param min - 最小值（包含）
 * @param max - 最大值（包含）
 * @returns 是否在范围内
 */
export function isNumberInRange(
  value: number,
  min: number,
  max: number
): boolean {
  if (typeof value !== 'number' || isNaN(value)) {
    return false;
  }
  if (typeof min !== 'number' || typeof max !== 'number') {
    return false;
  }
  return value >= min && value <= max;
}

/**
 * 验证字符串长度
 * @param value - 字符串值
 * @param min - 最小长度（可选）
 * @param max - 最大长度（可选）
 * @returns 是否符合长度要求
 */
export function isStringLength(
  value: string,
  min?: number,
  max?: number
): boolean {
  if (typeof value !== 'string') {
    return false;
  }
  const length = value.length;
  if (min !== undefined && length < min) {
    return false;
  }
  if (max !== undefined && length > max) {
    return false;
  }
  return true;
}

/**
 * 验证值是否为空
 * @param value - 待验证的值
 * @returns 是否为空
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) {
    return true;
  }
  if (typeof value === 'string') {
    return value.trim().length === 0;
  }
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  if (typeof value === 'object') {
    return Object.keys(value).length === 0;
  }
  return false;
}

/**
 * 验证是否为数字（字符串或数字类型）
 * @param value - 待验证的值
 * @returns 是否为数字
 */
export function isNumeric(value: string | number): boolean {
  if (typeof value === 'number') {
    return !isNaN(value) && isFinite(value);
  }
  if (typeof value === 'string') {
    return /^-?\d+(\.\d+)?$/.test(value.trim());
  }
  return false;
}

/**
 * 验证是否为整数
 * @param value - 待验证的值
 * @returns 是否为整数
 */
export function isInteger(value: string | number): boolean {
  if (typeof value === 'number') {
    return Number.isInteger(value);
  }
  if (typeof value === 'string') {
    return /^-?\d+$/.test(value.trim());
  }
  return false;
}

/**
 * 验证是否为正数
 * @param value - 数字值
 * @returns 是否为正数
 */
export function isPositive(value: number): boolean {
  if (typeof value !== 'number' || isNaN(value)) {
    return false;
  }
  return value > 0;
}

/**
 * 验证是否为负数
 * @param value - 数字值
 * @returns 是否为负数
 */
export function isNegative(value: number): boolean {
  if (typeof value !== 'number' || isNaN(value)) {
    return false;
  }
  return value < 0;
}
