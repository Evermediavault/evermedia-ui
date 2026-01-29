/**
 * API相关类型定义（与后端 schemas/response 对齐）
 */

import type { ApiResponse, PaginationParams, PaginationResponse } from './common';

/** 后端成功响应：success=true, message, data? */
export interface BackendSuccessResponse<T = unknown> {
  success: true;
  message: string;
  data?: T;
  detail?: unknown;
}

/** 登录接口返回的 user（与后端 auth 一致） */
export interface AuthUser {
  uid: string;
  username: string;
  email: string | null;
  role: string | null;
}

/** 登录接口 data 结构 */
export interface LoginData {
  token: string;
  user: AuthUser;
}

/** 后端错误响应：success=false, message, status_code, detail? */
export interface BackendErrorResponse {
  success: false;
  message: string;
  status_code: number;
  detail?: unknown;
}

/**
 * API请求配置
 */
export interface ApiRequestConfig {
  timeout?: number;
  showLoading?: boolean;
  showError?: boolean;
  headers?: Record<string, string>;
}

/**
 * API错误响应（前端统一使用）
 */
export interface ApiErrorResponse {
  code: number | string;
  message: string;
  details?: unknown;
}

export type { ApiResponse, PaginationParams, PaginationResponse };
