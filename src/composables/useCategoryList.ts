/**
 * 分类列表 API：GET /categories、POST /categories、PATCH /categories/:uid，所有已登录用户可访问
 */
import { ref, type Ref } from 'vue';
import { api } from 'src/boot/axios';
import type {
  CategoryListItem,
  CategoryListMeta,
  CategoryListParams,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from 'src/types/api';

/** 后端返回单条（snake_case） */
interface RawCategoryListItem {
  id: number;
  uid: string;
  name: string;
  description: string | null;
  is_default: boolean;
  created_at: string;
  file_count: number;
}

/** GET /categories 响应体 */
interface CategoryListBackendResponse {
  success: true;
  message: string;
  data: RawCategoryListItem[];
  meta: CategoryListMeta;
}

function mapToCategoryListItem(row: RawCategoryListItem): CategoryListItem {
  return {
    id: row.id,
    uid: row.uid,
    name: row.name,
    description: row.description ?? '',
    createdAt: row.created_at,
    isDefault: row.is_default,
    fileCount: row.file_count,
  };
}

/**
 * 请求分类列表（不管理 loading/error，仅做请求与数据转换）
 */
export async function fetchCategoryList(
  params: CategoryListParams
): Promise<{ list: CategoryListItem[]; meta: CategoryListMeta }> {
  const res = await api.get<CategoryListBackendResponse>('/categories', {
    params: {
      page: params.page ?? 1,
      page_size: params.page_size ?? 10,
      sort_by: params.sort_by ?? 'created_at',
      order: params.order ?? 'desc',
    },
  });
  const body = res.data;
  if (!body.success || body.data === undefined) {
    throw new Error(body.message ?? 'Failed to fetch category list');
  }
  return {
    list: body.data.map(mapToCategoryListItem),
    meta: body.meta,
  };
}

/** POST /categories 响应 data 为单条（snake_case） */
interface CreateCategoryBackendResponse {
  success: true;
  message: string;
  data: RawCategoryListItem;
}

/** PATCH /categories/:uid 响应 data 为单条（snake_case） */
interface UpdateCategoryBackendResponse {
  success: true;
  message: string;
  data: RawCategoryListItem;
}

/**
 * 创建分类（POST /categories）；失败抛错
 */
export async function createCategory(payload: CreateCategoryPayload): Promise<CategoryListItem> {
  const res = await api.post<CreateCategoryBackendResponse>('/categories', {
    name: payload.name.trim(),
    description: payload.description?.trim() || undefined,
  });
  const body = res.data;
  if (!body.success || !body.data) {
    throw new Error(body.message ?? 'Failed to create category');
  }
  return mapToCategoryListItem(body.data);
}

/**
 * 更新分类（PATCH /categories/:uid）；失败抛错
 */
export async function updateCategory(payload: UpdateCategoryPayload): Promise<CategoryListItem> {
  const { uid, ...rest } = payload;
  const body: Record<string, string | undefined> = {};
  if (rest.name !== undefined) body.name = rest.name.trim();
  if (rest.description !== undefined) body.description = rest.description.trim() || '';
  const res = await api.patch<UpdateCategoryBackendResponse>(`/categories/${uid}`, body);
  const data = res.data;
  if (!data.success || !data.data) {
    throw new Error(data.message ?? 'Failed to update category');
  }
  return mapToCategoryListItem(data.data);
}

/**
 * 删除分类（DELETE /categories/:uid）；仅管理员，默认分类不可删；失败抛错
 */
export async function deleteCategory(uid: string): Promise<void> {
  const res = await api.delete<{ success: true; message: string }>(`/categories/${uid}`);
  const data = res.data;
  if (!data.success) {
    throw new Error(data.message ?? 'Failed to delete category');
  }
}

/**
 * 分类列表状态与请求（用于页面：list / meta / loading / error / load）
 */
export function useCategoryList() {
  const list: Ref<CategoryListItem[]> = ref([]);
  const meta: Ref<CategoryListMeta | null> = ref(null);
  const loading = ref(false);
  const error = ref<Error | null>(null);

  async function load(params: CategoryListParams) {
    loading.value = true;
    error.value = null;
    try {
      const result = await fetchCategoryList(params);
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
