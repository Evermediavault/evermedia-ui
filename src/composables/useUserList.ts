/**
 * 用户列表 API：GET /users（分页、排序）、POST /users（添加用户），仅管理员
 */
import { ref, type Ref } from 'vue';
import { api } from 'src/boot/axios';
import type {
  UserListItem,
  UserListMeta,
  UserListParams,
  CreateUserPayload,
  UpdateUserPayload,
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
}

/** GET /users 响应体 */
interface UserListBackendResponse {
  success: true;
  message: string;
  data: RawUserListItem[];
  meta: UserListMeta;
}

function mapToUserListItem(row: RawUserListItem): UserListItem {
  return {
    id: row.id,
    uid: row.uid,
    username: row.username,
    email: row.email,
    role: row.role,
    disabled: row.disabled ?? false,
    lastLoginAt: row.last_login_at,
    createdAt: row.created_at,
  };
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
    throw new Error(body.message ?? 'Failed to fetch user list');
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
  const res = await api.post<CreateUserBackendResponse>('/users', {
    username: payload.username.trim(),
    email: payload.email.trim().toLowerCase(),
    password: payload.password,
    role: payload.role,
  });
  const body = res.data;
  if (!body.success || !body.data?.user) {
    throw new Error(body.message ?? 'Failed to create user');
  }
  return body.data.user;
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
  };
  if (payload.password != null && payload.password.length > 0) {
    body.password = payload.password;
  }
  const res = await api.post<{ success: true; message: string; data: UpdateUserBackendData }>(
    '/users',
    body
  );
  const data = res.data;
  if (!data.success || !data.data?.user) {
    throw new Error(data.message ?? 'Failed to update user');
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
    throw new Error(data.message ?? 'Failed to update user disabled state');
  }
  return data.data.user;
}

/**
 * 用户列表状态与请求（用于页面：list / meta / loading / error / load）
 */
export function useUserList() {
  const list: Ref<UserListItem[]> = ref([]);
  const meta: Ref<UserListMeta | null> = ref(null);
  const loading = ref(false);
  const error = ref<Error | null>(null);

  /** 拉取一页并更新 list / meta，失败时写 error、清 list */
  async function load(params: UserListParams) {
    loading.value = true;
    error.value = null;
    try {
      const result = await fetchUserList(params);
      list.value = result.list;
      meta.value = result.meta;
    } catch (e) {
      error.value = e instanceof Error ? e : new Error(String(e));
      list.value = [];
      meta.value = null;
    } finally {
      loading.value = false;
    }
  }

  return { list, meta, loading, error, load };
}
