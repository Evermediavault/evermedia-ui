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

  constructor(
    message: string,
    code: ErrorCode | string = ErrorCode.UNKNOWN_ERROR,
    statusCode?: number,
    details?: unknown,
    originalError?: Error
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
  statusCode?: number;
  details?: unknown;
}
