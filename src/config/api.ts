/**
 * API配置（与后端 baseURL + API_V1_PREFIX 对齐）
 */
import { API_TIMEOUT, API_V1_PATH } from 'src/constants/api';
import { env } from './env';

/** 后端服务根地址（不含 /api/v1），开发默认 127.0.0.1:8000 */
const apiOrigin = env.apiBaseUrl || (env.isDev ? 'http://127.0.0.1:8000' : '');

export const apiConfig = {
  /** 后端服务根地址 */
  origin: apiOrigin,
  /** 请求 baseURL = origin + API_V1_PATH，供 axios 使用 */
  baseURL: apiOrigin ? `${apiOrigin.replace(/\/$/, '')}${API_V1_PATH}` : '',
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
} as const;
