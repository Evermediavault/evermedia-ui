/**
 * API配置
 */
import { API_TIMEOUT } from 'src/constants/api';
import { env } from './env';

/**
 * API配置
 */
export const apiConfig = {
  /**
   * API基础URL
   */
  baseURL: env.apiBaseUrl || 'https://api.example.com',
  /**
   * 请求超时时间（毫秒）
   */
  timeout: API_TIMEOUT,
  /**
   * 默认请求头
   */
  headers: {
    'Content-Type': 'application/json',
  },
} as const;
