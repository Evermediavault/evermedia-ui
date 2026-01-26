/**
 * 格式化工具函数
 */

/**
 * 格式化数字（添加千分位分隔符）
 * @param value - 数字值
 * @param decimals - 小数位数，默认0
 * @returns 格式化后的字符串
 */
export function formatNumber(value: number | string, decimals: number = 0): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) {
    return '0';
  }
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * 格式化货币
 * @param value - 金额
 * @param currency - 货币符号，默认'¥'
 * @param decimals - 小数位数，默认2
 * @returns 格式化后的货币字符串
 */
export function formatCurrency(
  value: number | string,
  currency: string = '¥',
  decimals: number = 2
): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) {
    return `${currency}0.00`;
  }
  return `${currency}${formatNumber(num, decimals)}`;
}

/**
 * 格式化百分比
 * @param value - 数值（0-1之间或0-100之间）
 * @param decimals - 小数位数，默认2
 * @param isDecimal - 是否为小数形式（0-1），默认false（0-100）
 * @returns 格式化后的百分比字符串
 */
export function formatPercent(
  value: number | string,
  decimals: number = 2,
  isDecimal: boolean = false
): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) {
    return '0%';
  }
  const percentValue = isDecimal ? num * 100 : num;
  return `${formatNumber(percentValue, decimals)}%`;
}

/**
 * 格式化文件大小
 * @param bytes - 字节数
 * @param decimals - 小数位数，默认2
 * @returns 格式化后的文件大小字符串
 */
export function formatFileSize(bytes: number, decimals: number = 2): string {
  if (bytes === 0) {
    return '0 Bytes';
  }
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * 格式化手机号（中间4位用*代替）
 * @param phone - 手机号
 * @returns 格式化后的手机号
 */
export function formatPhone(phone: string): string {
  if (!phone || phone.length < 7) {
    return phone;
  }
  return phone.replace(/(\d{3})\d{4}(\d+)/, '$1****$2');
}

/**
 * 格式化邮箱（部分隐藏）
 * @param email - 邮箱地址
 * @returns 格式化后的邮箱
 */
export function formatEmail(email: string): string {
  if (!email || !email.includes('@')) {
    return email;
  }
  const [username, domain] = email.split('@');
  if (!username || !domain) {
    return email;
  }
  if (username.length <= 2) {
    return `${username[0]}***@${domain}`;
  }
  return `${username[0]}***${username[username.length - 1]}@${domain}`;
}
