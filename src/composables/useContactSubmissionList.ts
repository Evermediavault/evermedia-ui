/**
 * 联系表单提交列表：GET /contact（仅管理员，需 Bearer）
 */
import { api } from 'src/boot/axios';
import { usePaginatedList } from 'src/composables/usePaginatedList';
import type { ContactSubmissionItem, ContactSubmissionListParams } from 'src/types/api';
import type { PaginationMeta } from 'src/composables/usePaginatedList';

interface RawContactSubmission {
  id: number;
  user_name: string;
  email: string;
  content: string;
  ip: string;
  created_at: string;
}

interface ContactListBackendResponse {
  success: true;
  message: string;
  data: RawContactSubmission[];
  meta: PaginationMeta;
}

function mapRow(row: RawContactSubmission): ContactSubmissionItem {
  return {
    id: row.id,
    userName: row.user_name,
    email: row.email,
    content: row.content,
    ip: row.ip,
    createdAt: row.created_at,
  };
}

export async function fetchContactSubmissionList(
  params: ContactSubmissionListParams,
): Promise<{ list: ContactSubmissionItem[]; meta: PaginationMeta }> {
  const res = await api.get<ContactListBackendResponse>('/contact', {
    params: {
      page: params.page ?? 1,
      page_size: params.page_size ?? 12,
      sort_by: params.sort_by ?? 'created_at',
      order: params.order ?? 'desc',
    },
  });
  const body = res.data;
  if (!body.success || body.data === undefined) {
    throw new Error(body.message ?? '');
  }
  return {
    list: body.data.map(mapRow),
    meta: body.meta,
  };
}

export function useContactSubmissionList() {
  return usePaginatedList<ContactSubmissionItem, ContactSubmissionListParams>(fetchContactSubmissionList);
}
