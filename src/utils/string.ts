/**
 * 字符串处理工具
 */

/**
 * 首字母大写
 * @param str - 字符串
 * @returns 首字母大写的字符串
 */
export function capitalize(str: string): string {
  if (!str) {
    return '';
  }
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * 驼峰命名转短横线命名
 * @param str - 驼峰命名字符串
 * @returns 短横线命名字符串
 */
export function camelToKebab(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * 短横线命名转驼峰命名
 * @param str - 短横线命名字符串
 * @returns 驼峰命名字符串
 */
export function kebabToCamel(str: string): string {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * 截断字符串
 * @param str - 字符串
 * @param length - 最大长度
 * @param suffix - 后缀，默认'...'
 * @returns 截断后的字符串
 */
export function truncate(str: string, length: number, suffix: string = '...'): string {
  if (!str || str.length <= length) {
    return str;
  }
  return str.slice(0, length) + suffix;
}

/**
 * 去除HTML标签
 * @param html - HTML字符串
 * @returns 纯文本字符串
 */
export function stripHtml(html: string): string {
  if (typeof window === 'undefined') {
    // 服务端环境，使用正则表达式
    return html.replace(/<[^>]*>/g, '');
  }
  // 客户端环境，使用DOM API更安全
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

/**
 * 转义HTML特殊字符
 * @param str - 字符串
 * @returns 转义后的字符串
 */
export function escapeHtml(str: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return str.replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * 反转义HTML特殊字符
 * @param str - 转义后的字符串
 * @returns 原始字符串
 */
export function unescapeHtml(str: string): string {
  const map: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#039;': "'",
  };
  return str.replace(/&amp;|&lt;|&gt;|&quot;|&#039;/g, (entity) => map[entity] || entity);
}

/**
 * 生成随机字符串
 * @param length - 长度
 * @param chars - 字符集，默认包含大小写字母和数字
 * @returns 随机字符串
 */
export function randomString(
  length: number,
  chars: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * 去除字符串两端空白字符
 * @param str - 字符串
 * @returns 去除空白后的字符串
 */
export function trim(str: string): string {
  return str.trim();
}

/**
 * 去除字符串所有空白字符
 * @param str - 字符串
 * @returns 去除空白后的字符串
 */
export function removeWhitespace(str: string): string {
  return str.replace(/\s+/g, '');
}
