/**
 * 错误类型定义
 */

/**
 * 错误代码
 */
export enum ErrorCode {
  // 网络错误
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  // 服务器错误
  SERVER_ERROR = 'SERVER_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  // 业务错误
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  BUSINESS_ERROR = 'BUSINESS_ERROR',
  // 未知错误
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * 应用错误类
 * 当 messageKey 存在时，调用方应使用 t(messageKey)；否则使用 message（如后端返回的已翻译文案）。
 */
export class AppError extends Error {
  /**
   * 错误代码
   */
  code: ErrorCode | string;

  /**
   * HTTP状态码
   */
  statusCode?: number;

  /**
   * 错误详情
   */
  details?: unknown;

  /**
   * 原始错误
   */
  originalError?: Error;

  /**
   * i18n 文案 key（如 error.network）；存在时调用方用 t(messageKey) 展示
   */
  messageKey?: string;

  constructor(
    message: string,
    code: ErrorCode | string = ErrorCode.UNKNOWN_ERROR,
    statusCode?: number,
    details?: unknown,
    originalError?: Error,
    messageKey?: string
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    if (statusCode !== undefined) {
      this.statusCode = statusCode;
    }
    if (details !== undefined) {
      this.details = details;
    }
    if (originalError !== undefined) {
      this.originalError = originalError;
    }
    if (messageKey !== undefined) {
      this.messageKey = messageKey;
    }

    // 保持原型链
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

/**
 * 错误信息接口
 */
export interface ErrorInfo {
  code: ErrorCode | string;
  message: string;
  messageKey?: string;
  statusCode?: number;
  details?: unknown;
}
