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

/** 用户列表项（后端 snake_case 转 camelCase 后） */
export interface UserListItem {
  id: number;
  uid: string;
  username: string;
  email: string;
  role: string;
  lastLoginAt: string | null;
  createdAt: string;
}

/** 用户列表分页元数据（与后端 meta 对齐） */
export interface UserListMeta {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

/** 用户列表接口返回 data 结构 */
export interface UserListResponse {
  data: UserListItem[];
  meta: UserListMeta;
}

/** 用户列表可排序字段（与后端 sort_by 一致） */
export const USER_LIST_SORT_KEYS = ['created_at', 'username', 'last_login_at'] as const;
export type UserListSortBy = (typeof USER_LIST_SORT_KEYS)[number];

/** 前端表格 sortBy 与后端 sort_by 的映射（camelCase -> snake_case） */
export const USER_LIST_SORT_BY_MAP = {
  createdAt: 'created_at',
  username: 'username',
  lastLoginAt: 'last_login_at',
} as const satisfies Record<string, UserListSortBy>;

/** 用户列表表格可排序列名 */
export type UserListTableSortBy = keyof typeof USER_LIST_SORT_BY_MAP;

/** 用户列表查询参数（与后端 GET /users query 对齐） */
export interface UserListParams {
  page?: number;
  page_size?: number;
  sort_by?: UserListSortBy;
  order?: 'asc' | 'desc';
}

/** 文件列表项（与后端 GET /media/list 返回的 data 项对齐，snake_case 转 camelCase） */
export interface FileListItem {
  id: number;
  name: string;
  fileType: string;
  synapseIndexId: string;
  uploadedAt: string;
}

/** 文件列表分页元数据（与后端 meta 对齐） */
export interface FileListMeta {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

/** 文件列表查询参数（与后端 GET /media/list query 对齐） */
export interface FileListParams {
  page?: number;
  page_size?: number;
}

export type { ApiResponse, PaginationParams, PaginationResponse };
