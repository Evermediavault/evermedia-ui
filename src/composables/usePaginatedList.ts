/**
 * 通用分页列表状态与请求：统一 list / meta / loading / error / load 模式。
 * 供 useUserList、useFileList、useCategoryList 等复用。
 */
import { ref, type Ref } from 'vue';

/** 与后端分页 meta 对齐 */
export interface PaginationMeta {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export function usePaginatedList<T, P extends object>(
  fetcher: (params: P) => Promise<{ list: T[]; meta: PaginationMeta }>
) {
  const list: Ref<T[]> = ref([]) as Ref<T[]>;
  const meta: Ref<PaginationMeta | null> = ref(null);
  const loading = ref(false);
  const error = ref<Error | null>(null);

  async function load(params: P) {
    loading.value = true;
    error.value = null;
    try {
      const result = await fetcher(params);
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
