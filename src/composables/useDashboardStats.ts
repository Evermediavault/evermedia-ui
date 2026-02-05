/**
 * 首页统计：GET /stats（需登录），用于展示文件数、分类数、用户数（管理员可见）
 */
import { ref, onMounted } from 'vue';
import { api } from 'src/boot/axios';
import { STATS_PATH } from 'src/constants/api';
import type { DashboardStats } from 'src/types/api';
import type { BackendSuccessResponse } from 'src/types/api';

export function useDashboardStats() {
  const stats = ref<DashboardStats | null>(null);
  const loading = ref(false);
  const error = ref<Error | null>(null);

  async function fetchStats() {
    loading.value = true;
    error.value = null;
    try {
      const res = await api.get<BackendSuccessResponse<DashboardStats>>(STATS_PATH);
      const body = res.data;
      if (body.success && body.data != null) {
        stats.value = body.data;
      } else {
        stats.value = null;
      }
    } catch (e) {
      error.value = e instanceof Error ? e : new Error(String(e));
      stats.value = null;
    } finally {
      loading.value = false;
    }
  }

  onMounted(() => {
    void fetchStats();
  });

  return { stats, loading, error, refetch: fetchStats };
}
