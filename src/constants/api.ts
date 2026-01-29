/**
 * API相关常量（与后端 api 设计对齐）
 */

/** 后端 API v1 前缀，与 api 侧 API_V1_PREFIX 一致 */
export const API_V1_PATH = '/api/v1';

/**
 * API请求超时时间（毫秒）
 */
export const API_TIMEOUT = 30000;

/**
 * API重试次数
 */
export const API_RETRY_COUNT = 3;

/**
 * API重试延迟（毫秒）
 */
export const API_RETRY_DELAY = 1000;

/**
 * HTTP状态码
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;
