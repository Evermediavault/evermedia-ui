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
  disabled: boolean;
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

/** 添加用户请求体（与后端 POST /users 对齐，无 user_id 为新增） */
export type UserRole = 'uploader' | 'admin';

export interface CreateUserPayload {
  username: string;
  email: string;
  password: string;
  role: UserRole;
}

/** 编辑用户请求体（与后端 POST /users 对齐，传 user_id 为编辑） */
export interface UpdateUserPayload {
  user_id: string;
  username: string;
  email: string;
  password?: string;
  role: UserRole;
}

/** 存储 Provider 快照（与 GET /media/storage-info 及文件 storage_info 一致） */
export interface StorageProviderSnapshot {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  serviceProvider: string;
  pdp: { serviceURL: string };
}

/** 文件列表项（与后端 GET /media/list 返回的 data 项对齐，snake_case 转 camelCase） */
export interface FileListItem {
  id: number;
  name: string;
  fileType: string;
  synapseIndexId: string;
  synapseDataSetId?: number;
  storageId?: number;
  storageInfo?: StorageProviderSnapshot;
  uploadedAt: string;
  categoryUid?: string;
  categoryName?: string;
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

/** 分类列表项（与后端 GET /categories 对齐，camelCase） */
export interface CategoryListItem {
  id: number;
  name: string;
  uid: string;
  description: string;
  createdAt: string;
  /** 默认分类不可删除 */
  isDefault?: boolean;
  /** 该分类下的文件数量 */
  fileCount?: number;
}

/** 分类列表分页元数据（与通用 meta 对齐） */
export interface CategoryListMeta {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

/** 分类列表查询参数（与后端 GET /categories query 对齐） */
export interface CategoryListParams {
  page?: number;
  page_size?: number;
  sort_by?: 'created_at' | 'name';
  order?: 'asc' | 'desc';
}

/** 创建分类请求体（与后端 POST /categories 对齐） */
export interface CreateCategoryPayload {
  name: string;
  description?: string;
}

/** 更新分类请求体（与后端 PATCH /categories/:uid 对齐） */
export interface UpdateCategoryPayload {
  uid: string;
  name?: string;
  description?: string;
}

/** 首页统计（GET /stats）：file_count、category_count 必有；user_count 仅管理员返回 */
export interface DashboardStats {
  file_count: number;
  category_count: number;
  user_count?: number;
}

/** Synapse 钱包信息（GET /synapse/wallet-info，仅管理员）；金额为 wei 字符串 */
export interface SynapseWalletInfo {
  network: string;
  wallet_fil_wei: string;
  wallet_usdfc_wei: string;
  payments_funds_wei: string;
  payments_available_funds_wei: string;
}

export type { ApiResponse, PaginationParams, PaginationResponse };
