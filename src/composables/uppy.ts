/**
 * Uppy 上传组合式：创建带 Dashboard、XHR 的实例，与 i18n、认证对接
 * TODO: 对接后端上传 API 后确认 endpoint、fieldName、getResponseData
 */
import { onUnmounted, shallowRef, type Ref } from 'vue';
import Uppy from '@uppy/core';
import XHRUpload from '@uppy/xhr-upload';
import type { Locale } from '@uppy/utils';
import zhCN from '@uppy/locales/lib/zh_CN.js';
import enUS from '@uppy/locales/lib/en_US.js';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from 'src/stores/auth-store';
import { apiConfig } from 'src/config/api';
import { UPLOAD_PATH } from 'src/constants/api';
import { API_TIMEOUT } from 'src/constants/api';

const UPPY_LOCALE_MAP: Record<string, Locale> = {
  'zh-CN': zhCN as Locale,
  'en-US': enUS as Locale,
};

export interface UseUppyOptions {
  /** 覆盖上传地址，不传则用 apiConfig.baseURL + UPLOAD_PATH */
  endpoint?: string;
  /** 最大并发上传数 */
  limit?: number;
}

export function useUppy(options: UseUppyOptions = {}): { uppy: Ref<Uppy | null> } {
  const { locale } = useI18n();
  const authStore = useAuthStore();
  const uppy = shallowRef<Uppy | null>(null);

  const endpoint =
    options.endpoint ??
    (apiConfig.baseURL ? `${apiConfig.baseURL.replace(/\/$/, '')}${UPLOAD_PATH}` : '');

  const uppyLocale = UPPY_LOCALE_MAP[locale.value] ?? enUS;

  const instance = new Uppy({
    id: 'evermediavault-upload',
    locale: uppyLocale,
    autoProceed: false,
    allowMultipleUploadBatches: true,
  });

  // Dashboard 由 @uppy/vue 的 <Dashboard> 在挂载时注册，此处只注册 XHR
  // TODO: 后端上传 API 就绪后确认 fieldName、响应格式与 getResponseData
  instance.use(XHRUpload, {
    endpoint: endpoint || '/placeholder-upload',
    method: 'POST',
    formData: true,
    fieldName: 'file',
    headers:
      authStore.token != null
        ? { Authorization: `Bearer ${authStore.token}` }
        : {},
    timeout: API_TIMEOUT,
    limit: options.limit ?? 4,
  });

  uppy.value = instance;

  onUnmounted(() => {
    instance.destroy();
    uppy.value = null;
  });

  // 断言用于满足声明返回类型：instance.use(XHRUpload) 后推断缺少 Uppy 的 #private
  return { uppy: uppy as Ref<Uppy | null> };
}
