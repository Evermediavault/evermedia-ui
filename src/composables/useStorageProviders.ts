/**
 * 存储服务提供商列表：GET /media/storage-info，供上传页选择 providerId
 */
import { ref, type Ref } from 'vue';
import { api } from 'src/boot/axios';
import { STORAGE_INFO_PATH } from 'src/constants/api';
import type { StorageProviderSnapshot } from 'src/types/api';

interface StorageInfoResponse {
  success: true;
  message: string;
  data: { providers: StorageProviderSnapshot[] };
}

export function useStorageProviders(): {
  providers: Ref<StorageProviderSnapshot[]>;
  loading: Ref<boolean>;
  error: Ref<Error | null>;
  load: () => Promise<void>;
} {
  const providers = ref<StorageProviderSnapshot[]>([]) as Ref<StorageProviderSnapshot[]>;
  const loading = ref(false);
  const error = ref<Error | null>(null);

  async function load() {
    loading.value = true;
    error.value = null;
    try {
      const res = await api.get<StorageInfoResponse>(STORAGE_INFO_PATH);
      const body = res.data;
      if (!body.success || body.data?.providers == null) {
        throw new Error(body.message ?? 'Failed to load storage providers');
      }
      providers.value = body.data.providers.filter((p) => p.isActive);
    } catch (e) {
      error.value = e instanceof Error ? e : new Error(String(e));
      providers.value = [];
    } finally {
      loading.value = false;
    }
  }

  return { providers, loading, error, load };
}
