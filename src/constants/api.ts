/**
 * API相关常量
 */

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
