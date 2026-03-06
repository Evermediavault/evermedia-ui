/**
 * 用户列表 API：GET /users（分页、排序）、POST /users（添加用户），仅管理员
 */
import { api } from 'src/boot/axios';
import { usePaginatedList } from 'src/composables/usePaginatedList';
import type {
  UserListItem,
  UserListMeta,
  UserListParams,
  CreateUserPayload,
  UpdateUserPayload,
  AllianceMemberMeta,
} from 'src/types/api';

/** 后端返回单条（snake_case，与 api/schemas/user UserListItem 一致） */
interface RawUserListItem {
  id: number;
  uid: string;
  username: string;
  email: string;
  role: string;
  disabled: boolean;
  last_login_at: string | null;
  created_at: string;
  alliance_meta?: AllianceMemberMeta;
}

/** GET /users 响应体 */
interface UserListBackendResponse {
  success: true;
  message: string;
  data: RawUserListItem[];
  meta: UserListMeta;
}

function mapToUserListItem(row: RawUserListItem): UserListItem {
  const item: UserListItem = {
    id: row.id,
    uid: row.uid,
    username: row.username,
    email: row.email,
    role: row.role,
    disabled: row.disabled ?? false,
    lastLoginAt: row.last_login_at,
    createdAt: row.created_at,
  };
  if (row.alliance_meta != null) {
    item.allianceMeta = row.alliance_meta;
  }
  return item;
}

/** 联盟成员扩展字段（logo、project_name、intro、website、twitter），仅 role=alliance_member 时写入 body */
function buildAllianceMetaBody(
  role: string,
  payload: {
    logo?: string;
    project_name?: string;
    intro?: string;
    website?: string;
    twitter?: string;
  }
): Record<string, unknown> {
  if (role !== 'alliance_member') return {};
  const out: Record<string, unknown> = {};
  if (payload.logo != null && payload.logo.trim()) out.logo = payload.logo.trim();
  if (payload.project_name != null && payload.project_name.trim()) out.project_name = payload.project_name.trim();
  if (payload.intro != null && payload.intro.trim()) out.intro = payload.intro.trim();
  if (payload.website != null && payload.website.trim()) out.website = payload.website.trim();
  if (payload.twitter != null && payload.twitter.trim()) out.twitter = payload.twitter.trim();
  return out;
}

/**
 * 请求用户列表（不管理 loading/error，仅做请求与数据转换）
 */
export async function fetchUserList(
  params: UserListParams
): Promise<{ list: UserListItem[]; meta: UserListMeta }> {
  const res = await api.get<UserListBackendResponse>('/users', {
    params: {
      page: params.page ?? 1,
      page_size: params.page_size ?? 10,
      sort_by: params.sort_by ?? 'created_at',
      order: params.order ?? 'desc',
    },
  });
  const body = res.data;
  if (!body.success || body.data === undefined) {
    throw new Error(body.message ?? '');
  }
  return {
    list: body.data.map(mapToUserListItem),
    meta: body.meta,
  };
}

/** POST /users 添加用户响应 data（与后端 createSuccessResponse 对齐） */
interface CreateUserBackendData {
  user: {
    uid: string;
    username: string;
    email: string;
    role: string;
    created_at: string;
  };
}

interface CreateUserBackendResponse {
  success: true;
  message: string;
  data: CreateUserBackendData;
}

/**
 * 添加用户（POST /users，无 user_id），仅管理员；失败抛错
 */
export async function createUser(
  payload: CreateUserPayload
): Promise<CreateUserBackendData['user']> {
  const body: Record<string, unknown> = {
    username: payload.username.trim(),
    email: payload.email.trim().toLowerCase(),
    password: payload.password,
    role: payload.role,
    ...buildAllianceMetaBody(payload.role, payload),
  };
  const res = await api.post<CreateUserBackendResponse>('/users', body);
  const data = res.data;
  if (!data.success || !data.data?.user) {
    throw new Error(data.message ?? '');
  }
  return data.data.user;
}

/** POST /users 编辑用户响应 data（与后端一致） */
interface UpdateUserBackendData {
  user: {
    uid: string;
    username: string;
    email: string;
    role: string;
    disabled?: boolean;
    created_at: string;
  };
}

/**
 * 编辑用户（POST /users，传 user_id），仅管理员；失败抛错
 */
export async function updateUser(
  payload: UpdateUserPayload
): Promise<UpdateUserBackendData['user']> {
  const body: Record<string, unknown> = {
    user_id: payload.user_id,
    username: payload.username.trim(),
    email: payload.email.trim().toLowerCase(),
    role: payload.role,
    ...(payload.password != null && payload.password.length > 0 ? { password: payload.password } : {}),
    ...buildAllianceMetaBody(payload.role, payload),
  };
  const res = await api.post<{ success: true; message: string; data: UpdateUserBackendData }>(
    '/users',
    body
  );
  const data = res.data;
  if (!data.success || !data.data?.user) {
    throw new Error(data.message ?? '');
  }
  return data.data.user;
}

/** PATCH /users/:uid/disabled 响应 data */
interface SetUserDisabledBackendData {
  user: {
    uid: string;
    username: string;
    email: string;
    role: string;
    disabled: boolean;
    created_at: string;
  };
}

/**
 * 禁用/解禁用户（PATCH /users/:uid/disabled），仅管理员；失败抛错
 */
export async function setUserDisabled(
  uid: string,
  disabled: boolean
): Promise<SetUserDisabledBackendData['user']> {
  const res = await api.patch<{ success: true; message: string; data: SetUserDisabledBackendData }>(
    `/users/${uid}/disabled`,
    { disabled }
  );
  const data = res.data;
  if (!data.success || !data.data?.user) {
    throw new Error(data.message ?? '');
  }
  return data.data.user;
}

/**
 * 用户列表状态与请求（用于页面：list / meta / loading / error / load）
 */
export function useUserList() {
  return usePaginatedList<UserListItem, UserListParams>(fetchUserList);
}
