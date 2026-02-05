/**
 * 媒体批量上传：收集所有文件与对应 name/metadata，以 FormData 一次性 POST 到后端。
 * 后端使用单一数据集批量上传（createContext + Promise.all(upload)）。
 */
import { api } from 'src/boot/axios';
import { UPLOAD_PATH, UPLOAD_TIMEOUT_MS } from 'src/constants/api';
import type { StorageProviderSnapshot } from 'src/types/api';

/** 单次上传项：文件 + 显示名 + 元数据 JSON 字符串 */
export interface UploadItem {
  file: File;
  displayName: string;
  metadataJson: string;
}

/** 上传成功返回的单条文件信息（与后端 UploadFileItem 对齐） */
export interface UploadFileItem {
  id: number;
  name: string;
  file_type: string;
  synapse_index_id: string;
  synapse_data_set_id?: number;
  storage_id?: number;
  storage_info?: StorageProviderSnapshot;
  uploaded_at: string;
}

/** 后端成功响应 data 为本次创建的 1～N 条 */
interface UploadResponse {
  success: true;
  message: string;
  data?: UploadFileItem[];
}

/**
 * 批量上传：FormData 格式为 providerId、可选 categoryUid、file_0, file_1, …、name_0, name_1, …、metadata_0, metadata_1, …
 */
export async function uploadBatch(
  providerId: number,
  items: UploadItem[],
  categoryUid?: string | null
): Promise<UploadFileItem[]> {
  const form = new FormData();
  form.append('providerId', String(providerId));
  if (categoryUid != null && categoryUid.trim() !== '') {
    form.append('categoryUid', categoryUid.trim());
  }
  items.forEach((item, i) => {
    form.append(`file_${i}`, item.file, item.displayName || item.file.name);
    form.append(`name_${i}`, item.displayName || item.file.name);
    form.append(`metadata_${i}`, item.metadataJson);
  });
  const res = await api.post<UploadResponse>(UPLOAD_PATH, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: UPLOAD_TIMEOUT_MS,
  });
  const data = res.data?.data;
  return Array.isArray(data) ? data : [];
}
