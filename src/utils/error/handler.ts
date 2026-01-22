/**
 * 全局错误处理器
 */
import { ErrorCode, AppError, type ErrorInfo } from './types';

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
    // 将普通Error转换为AppError
    appError = new AppError(
      error.message,
      ErrorCode.UNKNOWN_ERROR,
      undefined,
      undefined,
      error
    );
  } else if (typeof error === 'string') {
    appError = new AppError(error, ErrorCode.UNKNOWN_ERROR);
  } else {
    appError = new AppError(
      '发生未知错误',
      ErrorCode.UNKNOWN_ERROR,
      undefined,
      error
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

  return {
    code: appError.code,
    message: appError.message,
    statusCode: appError.statusCode,
    details: appError.details,
  };
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
    // 服务器响应了错误状态码
    const status = axiosError.response.status;
    const data = axiosError.response.data;
    const message = data?.message || data?.error || `HTTP ${status} 错误`;

    let code = ErrorCode.SERVER_ERROR;
    if (status === 401) {
      code = ErrorCode.UNAUTHORIZED;
    } else if (status === 403) {
      code = ErrorCode.FORBIDDEN;
    } else if (status === 404) {
      code = ErrorCode.NOT_FOUND;
    } else if (status >= 500) {
      code = ErrorCode.SERVER_ERROR;
    }

    return new AppError(message, code, status, data, axiosError);
  } else if (axiosError?.request) {
    // 请求已发出但没有收到响应
    return new AppError(
      '网络错误，请检查网络连接',
      ErrorCode.NETWORK_ERROR,
      undefined,
      undefined,
      axiosError
    );
  } else if (axiosError?.code === 'ECONNABORTED') {
    // 请求超时
    return new AppError(
      '请求超时，请稍后重试',
      ErrorCode.TIMEOUT_ERROR,
      undefined,
      undefined,
      axiosError
    );
  }

  // 其他错误
  return new AppError(
    axiosError?.message || '网络请求失败',
    ErrorCode.NETWORK_ERROR,
    undefined,
    undefined,
    axiosError
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
