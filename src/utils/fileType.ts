/**
 * 文件类型 → 预览 kind、图标、缩略图背景 key，统一 MIME 判断，供 FileSelection 等复用。
 */

export type PreviewKind = 'image' | 'video' | 'audio' | 'pdf' | 'other';

export interface FileTypeInfo {
  kind: PreviewKind;
  icon: string;
  bgKey: string;
}

/** 非预览时的缩略图背景色（按 bgKey 取值） */
export const FILE_TYPE_BG: Record<string, string> = {
  pdf: 'rgba(193, 0, 21, 0.22)',
  word: 'rgba(43, 87, 154, 0.28)',
  excel: 'rgba(33, 115, 70, 0.28)',
  audio: 'rgba(139, 92, 246, 0.2)',
  text: 'rgba(255, 255, 255, 0.08)',
  other: 'rgba(255, 255, 255, 0.06)',
};

function mimeToBgKey(mime: string): string {
  if (mime === 'application/pdf') return 'pdf';
  if (
    mime === 'application/msword' ||
    mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  )
    return 'word';
  if (
    mime === 'application/vnd.ms-excel' ||
    mime === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  )
    return 'excel';
  if (mime.startsWith('audio/')) return 'audio';
  if (mime.startsWith('text/') || mime === 'application/json' || mime === 'application/xml')
    return 'text';
  return 'other';
}

function mimeToIcon(mime: string): string {
  if (mime === 'application/pdf') return 'picture_as_pdf';
  if (
    mime === 'application/msword' ||
    mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  )
    return 'description';
  if (
    mime === 'application/vnd.ms-excel' ||
    mime === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  )
    return 'table_chart';
  if (mime.startsWith('audio/')) return 'audiotrack';
  if (mime.startsWith('text/') || mime === 'application/json' || mime === 'application/xml')
    return 'description';
  return 'insert_drive_file';
}

function mimeToKind(mime: string): PreviewKind {
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('audio/')) return 'audio';
  if (mime === 'application/pdf') return 'pdf';
  return 'other';
}

export function getFileTypeInfo(file: File | null): FileTypeInfo {
  const mime = file?.type?.trim() ?? '';
  if (!mime) {
    return { kind: 'other', icon: 'insert_drive_file', bgKey: 'other' };
  }
  return {
    kind: mimeToKind(mime),
    icon: mimeToIcon(mime),
    bgKey: mimeToBgKey(mime),
  };
}
