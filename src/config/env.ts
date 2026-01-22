/**
 * 环境变量管理
 */

/**
 * 环境类型
 */
export type EnvMode = 'development' | 'production' | 'test';

/**
 * 获取环境变量
 * @param key - 环境变量key
 * @param defaultValue - 默认值
 * @returns 环境变量值
 */
export function getEnv(key: string, defaultValue: string = ''): string {
  // 在Vite中，环境变量通过import.meta.env访问
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const env = (import.meta as any).env || {};
  return env[key] || defaultValue;
}

/**
 * 获取当前环境模式
 * @returns 环境模式
 */
export function getEnvMode(): EnvMode {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mode = (import.meta as any).env?.MODE || 'development';
  return mode as EnvMode;
}

/**
 * 是否为开发环境
 * @returns 是否为开发环境
 */
export function isDev(): boolean {
  return getEnvMode() === 'development';
}

/**
 * 是否为生产环境
 * @returns 是否为生产环境
 */
export function isProd(): boolean {
  return getEnvMode() === 'production';
}

/**
 * 是否为测试环境
 * @returns 是否为测试环境
 */
export function isTest(): boolean {
  return getEnvMode() === 'test';
}

/**
 * 环境配置
 */
export const env = {
  /**
   * 环境模式
   */
  mode: getEnvMode(),
  /**
   * 是否为开发环境
   */
  isDev: isDev(),
  /**
   * 是否为生产环境
   */
  isProd: isProd(),
  /**
   * 是否为测试环境
   */
  isTest: isTest(),
  /**
   * API基础URL
   */
  apiBaseUrl: getEnv('VITE_API_BASE_URL', ''),
  /**
   * 应用标题
   */
  appTitle: getEnv('VITE_APP_TITLE', 'Evermediavault'),
  /**
   * 应用版本
   */
  appVersion: getEnv('VITE_APP_VERSION', '0.0.1'),
} as const;
