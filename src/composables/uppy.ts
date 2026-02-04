/**
 * Uppy 上传组合式：创建带 Dashboard、XHR 的实例，与 i18n、认证对接
 * 后端 POST /api/v1/media/upload 仅管理员可用，fieldName: file
 */
import { onUnmounted, ref, shallowRef, type Ref } from 'vue';
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

/** 上传成功时后端返回的 data 结构 */
export interface UploadSuccessData {
  id?: number;
  name?: string;
  file_type?: string;
  synapse_index_id?: string;
  uploaded_at?: string;
}

/** 回调中的文件信息（与 Uppy 内部类型解耦，避免泛型冲突） */
export interface UppyFileInfo {
  name?: string;
  id?: string;
}

export interface UseUppyCallbacks {
  /** 单个文件上传成功 */
  onUploadSuccess?: (file: UppyFileInfo, response: { body?: { data?: UploadSuccessData; message?: string } }) => void;
  /** 单个文件上传失败 */
  onUploadError?: (file: UppyFileInfo, error: Error, response?: { body?: { message?: string; detail?: { reason?: string } }; status?: number }) => void;
  /** 开始上传（任一文件） */
  onUploadStart?: () => void;
  /** 本批全部完成（成功或失败都算） */
  onComplete?: (result: { successful: UppyFileInfo[]; failed: UppyFileInfo[] }) => void;
}

export interface UseUppyOptions {
  /** 覆盖上传地址，不传则用 apiConfig.baseURL + UPLOAD_PATH */
  endpoint?: string;
  /** 最大并发上传数 */
  limit?: number;
  /** 成功/失败/开始/完成回调，用于页面 toasts、状态、最近结果等 */
  callbacks?: UseUppyCallbacks;
}

export function useUppy(options: UseUppyOptions = {}): { uppy: Ref<Uppy | null>; fileCount: Ref<number> } {
  const { locale } = useI18n();
  const authStore = useAuthStore();
  const uppy = shallowRef<Uppy | null>(null);
  const fileCount = ref(0);

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
  // allowedMetaFields: ['metadata'] 使 file.meta.metadata 作为 form 字段一并提交，后端接收 JSON 字符串
  instance.use(XHRUpload, {
    endpoint: endpoint || '',
    method: 'POST',
    formData: true,
    fieldName: 'file',
    allowedMetaFields: ['metadata'],
    headers:
      authStore.token != null
        ? { Authorization: `Bearer ${authStore.token}` }
        : {},
    timeout: API_TIMEOUT,
    limit: options.limit ?? 4,
  });

  const toFileInfo = (f: { name?: string; id?: string } | null | undefined): UppyFileInfo => {
    if (!f) return {};
    const info: UppyFileInfo = {};
    if (f.name != null) info.name = f.name;
    if (f.id != null) info.id = f.id;
    return info;
  };

  const callbacks = options.callbacks;
  if (callbacks?.onUploadStart) {
    instance.on('upload', callbacks.onUploadStart);
  }
  if (callbacks?.onUploadSuccess) {
    instance.on('upload-success', (file, response) => {
      callbacks.onUploadSuccess!(toFileInfo(file), response as { body?: { data?: UploadSuccessData; message?: string } });
    });
  }
  if (callbacks?.onUploadError) {
    instance.on('upload-error', (file, error, response) => {
      callbacks.onUploadError!(toFileInfo(file), error, response as { body?: { message?: string; detail?: { reason?: string } }; status?: number } | undefined);
    });
  }
  if (callbacks?.onComplete) {
    instance.on('complete', (result) => {
      callbacks.onComplete!({
        successful: (result.successful ?? []).map(toFileInfo),
        failed: (result.failed ?? []).map(toFileInfo),
      });
    });
  }

  const syncFileCount = () => {
    fileCount.value = instance.getFiles().length;
  };
  instance.on('file-added', syncFileCount);
  instance.on('file-removed', syncFileCount);

  uppy.value = instance;

  onUnmounted(() => {
    instance.destroy();
    uppy.value = null;
  });

  return { uppy: uppy as Ref<Uppy | null>, fileCount };
}
