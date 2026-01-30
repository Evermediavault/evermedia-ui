/**
 * 用户列表 API：GET /users（分页、排序），仅管理员
 */
import { ref, type Ref } from 'vue';
import { api } from 'src/boot/axios';
import type { UserListItem, UserListMeta, UserListParams } from 'src/types/api';

/** 后端返回单条（snake_case，与 api/schemas/user UserListItem 一致） */
interface RawUserListItem {
  id: number;
  uid: string;
  username: string;
  email: string;
  role: string;
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
