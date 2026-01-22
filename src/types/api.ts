/**
 * API相关类型定义
 */

import type { ApiResponse, PaginationParams, PaginationResponse } from './common';

/**
 * API请求配置
 */
export interface ApiRequestConfig {
  /**
   * 请求超时时间（毫秒）
   */
  timeout?: number;
  /**
   * 是否显示加载提示
   */
  showLoading?: boolean;
  /**
   * 是否显示错误提示
   */
  showError?: boolean;
  /**
   * 自定义请求头
   */
  headers?: Record<string, string>;
}

/**
 * API错误响应
 */
export interface ApiErrorResponse {
  /**
   * 错误码
   */
  code: number | string;
  /**
   * 错误消息
   */
  message: string;
  /**
   * 错误详情
   */
  details?: unknown;
}

/**
 * 导出通用类型
 */
export type { ApiResponse, PaginationParams, PaginationResponse };
