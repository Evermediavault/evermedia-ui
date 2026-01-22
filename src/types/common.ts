/**
 * 通用类型定义
 */

/**
 * 分页参数
 */
export interface PaginationParams {
  /**
   * 页码（从1开始）
   */
  page: number;
  /**
   * 每页数量
   */
  pageSize: number;
}

/**
 * 分页响应
 */
export interface PaginationResponse<T> {
  /**
   * 数据列表
   */
  list: T[];
  /**
   * 总数量
   */
  total: number;
  /**
   * 当前页码
   */
  page: number;
  /**
   * 每页数量
   */
  pageSize: number;
  /**
   * 总页数
   */
  totalPages: number;
}

/**
 * API响应基础结构
 */
export interface ApiResponse<T = unknown> {
  /**
   * 响应码
   */
  code: number;
  /**
   * 响应消息
   */
  message: string;
  /**
   * 响应数据
   */
  data: T;
  /**
   * 是否成功
   */
  success: boolean;
}

/**
 * 选项类型
 */
export interface Option<T = string | number> {
  /**
   * 值
   */
  value: T;
  /**
   * 标签
   */
  label: string;
  /**
   * 是否禁用
   */
  disabled?: boolean;
}

/**
 * 键值对类型
 */
export interface KeyValuePair<K = string, V = unknown> {
  /**
   * 键
   */
  key: K;
  /**
   * 值
   */
  value: V;
}
