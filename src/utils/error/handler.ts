/**
 * 全局错误处理器
 */
import { ErrorCode, AppError, type ErrorInfo } from './types';
import { isUnsafeApiMessage } from './sanitizeMessage';

/**
 * 错误处理器配置
 */
export interface ErrorHandlerConfig {
  /**
   * 是否在控制台输出错误
   */
  logToConsole?: boolean;
  /**
   * 自定义错误处理函数
   */
  onError?: (error: AppError) => void;
}

/**
 * 默认错误处理器配置
 */
const defaultConfig: ErrorHandlerConfig = {
  logToConsole: true,
};

let globalConfig: ErrorHandlerConfig = { ...defaultConfig };

/**
 * 配置全局错误处理器
 * @param config - 配置选项
 */
export function configureErrorHandler(config: ErrorHandlerConfig): void {
  globalConfig = { ...defaultConfig, ...config };
}

/**
 * 处理错误
 * @param error - 错误对象
 * @returns 错误信息
 */
export function handleError(error: unknown): ErrorInfo {
  let appError: AppError;

  if (error instanceof AppError) {
    appError = error;
  } else if (error instanceof Error) {
    if (isUnsafeApiMessage(error.message)) {
      appError = new AppError(
        'error.server',
        ErrorCode.UNKNOWN_ERROR,
        undefined,
        undefined,
        error,
        'error.server'
      );
    } else {
      appError = new AppError(
        error.message,
        ErrorCode.UNKNOWN_ERROR,
        undefined,
        undefined,
        error
      );
    }
  } else if (typeof error === 'string') {
    appError = new AppError(error, ErrorCode.UNKNOWN_ERROR);
  } else {
    appError = new AppError(
      'error.unknown',
      ErrorCode.UNKNOWN_ERROR,
      undefined,
      error,
      undefined,
      'error.unknown'
    );
  }

  // 记录到控制台
  if (globalConfig.logToConsole) {
    console.error('Error handled:', {
      code: appError.code,
      message: appError.message,
      statusCode: appError.statusCode,
      details: appError.details,
      stack: appError.stack,
    });
  }

  // 调用自定义处理函数
  if (globalConfig.onError) {
    globalConfig.onError(appError);
  }

  const errorInfo: ErrorInfo = {
    code: appError.code,
    message: appError.message,
  };

  if (appError.messageKey !== undefined) {
    errorInfo.messageKey = appError.messageKey;
  }

  if (appError.statusCode !== undefined) {
    errorInfo.statusCode = appError.statusCode;
  }

  if (appError.details !== undefined) {
    errorInfo.details = appError.details;
  }

  return errorInfo;
}

/**
 * 从Axios错误中提取错误信息
 * @param error - Axios错误对象
 * @returns AppError
 */
export function handleAxiosError(error: unknown): AppError {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const axiosError = error as any;

  if (axiosError?.response) {
    // 服务器响应了错误状态码，message 为后端已翻译文案，不设 messageKey
    const status = axiosError.response.status;
    const data = axiosError.response.data;
    const rawMsg =
      typeof data?.message === 'string'
        ? data.message
        : typeof data?.error === 'string'
          ? data.error
          : '';
    if (typeof rawMsg === 'string' && rawMsg.length > 0 && isUnsafeApiMessage(rawMsg)) {
      return new AppError(
        'error.server',
        ErrorCode.SERVER_ERROR,
        status,
        data,
        axiosError,
        'error.server'
      );
    }
    const message = rawMsg;

    let code = ErrorCode.SERVER_ERROR;
    if (status === 401) {
      code = ErrorCode.UNAUTHORIZED;
    } else if (status === 403) {
      code = ErrorCode.FORBIDDEN;
    } else if (status === 404) {
      code = ErrorCode.NOT_FOUND;
    } else if (status >= 500) {
      code = ErrorCode.SERVER_ERROR;
    } else if (status >= 400) {
      code = ErrorCode.BUSINESS_ERROR;
    }

    const fallbackKey = 'error.badRequest';
    return new AppError(
      message || fallbackKey,
      code,
      status,
      data,
      axiosError,
      message ? undefined : fallbackKey
    );
  } else if (axiosError?.request) {
    // 请求已发出但没有收到响应
    return new AppError(
      'error.network',
      ErrorCode.NETWORK_ERROR,
      undefined,
      undefined,
      axiosError,
      'error.network'
    );
  } else if (axiosError?.code === 'ECONNABORTED') {
    // 请求超时
    return new AppError(
      'error.timeout',
      ErrorCode.TIMEOUT_ERROR,
      undefined,
      undefined,
      axiosError,
      'error.timeout'
    );
  }

  // 其他错误
  return new AppError(
    'error.network',
    ErrorCode.NETWORK_ERROR,
    undefined,
    undefined,
    axiosError,
    'error.network'
  );
}

/**
 * 创建业务错误
 * @param message - 错误消息
 * @param details - 错误详情
 * @returns AppError
 */
export function createBusinessError(message: string, details?: unknown): AppError {
  return new AppError(message, ErrorCode.BUSINESS_ERROR, undefined, details);
}

/**
 * 创建验证错误
 * @param message - 错误消息
 * @param details - 验证详情
 * @returns AppError
 */
export function createValidationError(message: string, details?: unknown): AppError {
  return new AppError(message, ErrorCode.VALIDATION_ERROR, undefined, details);
}
