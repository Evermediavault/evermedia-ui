import type { MetaEntryType } from 'src/utils/validation';

export interface Todo {
  id: number;
  content: string;
}

export interface Meta {
  totalCount: number;
}

/** 文件选择器 v-model 值：文件、文件名、元数据分离，供外部统一上传 */
export interface FileSelectionValue {
  fileName: string;
  metaEntries: Array<{ name: string; type: MetaEntryType; value: string }>;
  file: File | null;
}
