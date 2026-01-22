/**
 * URL处理工具
 */

/**
 * 解析URL参数
 * @param url - URL字符串，默认为当前页面URL
 * @returns 参数对象
 */
export function parseUrlParams(url?: string): Record<string, string> {
  const targetUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const params: Record<string, string> = {};

  try {
    const urlObj = new URL(targetUrl);
    urlObj.searchParams.forEach((value, key) => {
      params[key] = value;
    });
  } catch (error) {
    console.error('URL parse error:', error);
  }

  return params;
}

/**
 * 获取URL参数值
 * @param key - 参数名
 * @param url - URL字符串，默认为当前页面URL
 * @returns 参数值，如果不存在返回null
 */
export function getUrlParam(key: string, url?: string): string | null {
  const params = parseUrlParams(url);
  return params[key] || null;
}

/**
 * 构建URL查询字符串
 * @param params - 参数对象
 * @returns 查询字符串（不包含?）
 */
export function buildQueryString(params: Record<string, string | number | boolean | null | undefined>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      searchParams.append(key, String(value));
    }
  });

  return searchParams.toString();
}

/**
 * 构建完整URL
 * @param baseUrl - 基础URL
 * @param params - 参数对象
 * @returns 完整URL
 */
export function buildUrl(
  baseUrl: string,
  params?: Record<string, string | number | boolean | null | undefined>
): string {
  if (!params || Object.keys(params).length === 0) {
    return baseUrl;
  }

  const queryString = buildQueryString(params);
  const separator = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${separator}${queryString}`;
}

/**
 * 合并URL参数
 * @param url - 原始URL
 * @param params - 要添加的参数对象
 * @returns 合并后的URL
 */
export function mergeUrlParams(
  url: string,
  params: Record<string, string | number | boolean | null | undefined>
): string {
  try {
    const urlObj = new URL(url);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        urlObj.searchParams.set(key, String(value));
      }
    });
    return urlObj.toString();
  } catch (error) {
    console.error('URL merge error:', error);
    return url;
  }
}

/**
 * 验证URL是否有效
 * @param url - URL字符串
 * @returns 是否有效
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
