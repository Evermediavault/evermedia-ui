/**
 * 文件列表 API：GET /media/list（不鉴权，分页）
 */
import { api } from 'src/boot/axios';
import { usePaginatedList } from 'src/composables/usePaginatedList';
import { MEDIA_LIST_PATH } from 'src/constants/api';
import type { FileListItem, FileListMeta, FileListParams, StorageProviderSnapshot } from 'src/types/api';

/** 后端返回单条（snake_case，与 api UploadFileItem 一致） */
interface RawFileListItem {
  id: number;
  name: string;
  file_type: string;
  synapse_index_id: string;
  synapse_data_set_id?: number;
  storage_id?: number;
  storage_info?: StorageProviderSnapshot;
  uploaded_at: string;
  category_uid?: string;
  category_name?: string;
  uploader_username?: string;
}

/** GET /media/list 响应体 */
interface FileListBackendResponse {
  success: true;
  message: string;
  data: RawFileListItem[];
  meta: FileListMeta;
}

function mapToFileListItem(row: RawFileListItem): FileListItem {
  const item: FileListItem = {
    id: row.id,
    name: row.name,
    fileType: row.file_type,
    synapseIndexId: row.synapse_index_id,
    uploadedAt: row.uploaded_at,
  };
  if (row.synapse_data_set_id !== undefined && row.synapse_data_set_id !== null) {
    item.synapseDataSetId = row.synapse_data_set_id;
  }
  if (row.storage_id !== undefined && row.storage_id !== null) {
    item.storageId = row.storage_id;
  }
  if (row.storage_info !== undefined && row.storage_info !== null) {
    item.storageInfo = row.storage_info;
  }
  if (row.category_uid !== undefined && row.category_uid !== '') {
    item.categoryUid = row.category_uid;
  }
  if (row.category_name !== undefined && row.category_name !== '') {
    item.categoryName = row.category_name;
  }
  if (row.uploader_username !== undefined && row.uploader_username !== '') {
    item.uploaderName = row.uploader_username;
  }
  return item;
}

/**
 * 请求文件列表（不鉴权；不管理 loading/error，仅做请求与数据转换）
 */
export async function fetchFileList(
  params: FileListParams
): Promise<{ list: FileListItem[]; meta: FileListMeta }> {
  const res = await api.get<FileListBackendResponse>(MEDIA_LIST_PATH, {
    params: {
      page: params.page ?? 1,
      page_size: params.page_size ?? 10,
    },
  });
  const body = res.data;
  if (!body.success || body.data === undefined) {
    throw new Error(body.message ?? '');
  }
  return {
    list: body.data.map(mapToFileListItem),
    meta: body.meta,
  };
}

/**
 * 文件列表状态与请求（用于页面：list / meta / loading / error / load）
 */
export function useFileList() {
  return usePaginatedList<FileListItem, FileListParams>(fetchFileList);
}
