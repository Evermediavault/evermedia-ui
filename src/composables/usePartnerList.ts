/**
 * 合作伙伴：GET /partners/manage（管理员）、POST /partners、DELETE /partners/:id
 */
import { api } from 'src/boot/axios';
import { usePaginatedList } from 'src/composables/usePaginatedList';
import type { PartnerListItem, PartnerListParams, UpsertPartnerPayload } from 'src/types/api';
import type { PaginationMeta } from 'src/composables/usePaginatedList';

interface RawPartnerItem {
  id: number;
  logo: string;
  tag: string | null;
  name: string;
  description: string | null;
  link: string;
  created_at: string;
  updated_at: string;
}

interface PartnerListBackendResponse {
  success: true;
  message: string;
  data: RawPartnerItem[];
  meta: PaginationMeta;
}

function mapPartner(row: RawPartnerItem): PartnerListItem {
  return {
    id: row.id,
    logo: row.logo,
    tag: row.tag ?? '',
    name: row.name,
    description: row.description ?? '',
    link: row.link,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function fetchPartnerList(
  params: PartnerListParams
): Promise<{ list: PartnerListItem[]; meta: PaginationMeta }> {
  const res = await api.get<PartnerListBackendResponse>('/partners/manage', {
    params: {
      page: params.page ?? 1,
      page_size: params.page_size ?? 10,
      sort_by: params.sort_by ?? 'created_at',
      order: params.order ?? 'desc',
    },
  });
  const body = res.data;
  if (!body.success || body.data === undefined) {
    throw new Error(body.message ?? '');
  }
  return {
    list: body.data.map(mapPartner),
    meta: body.meta,
  };
}

interface UpsertPartnerBackendResponse {
  success: true;
  message: string;
  data: RawPartnerItem;
}

export async function upsertPartner(payload: UpsertPartnerPayload): Promise<PartnerListItem> {
  const body: Record<string, unknown> = {
    logo: payload.logo.trim(),
    name: payload.name.trim(),
    link: payload.link.trim(),
  };
  if (payload.id != null) body.id = payload.id;
  const tag = payload.tag?.trim();
  if (tag) body.tag = tag;
  const desc = payload.description?.trim();
  if (desc) body.description = desc;

  const res = await api.post<UpsertPartnerBackendResponse>('/partners', body);
  const data = res.data;
  if (!data.success || !data.data) {
    throw new Error(data.message ?? '');
  }
  return mapPartner(data.data);
}

export async function deletePartner(id: number): Promise<void> {
  const res = await api.delete<{ success: true; message: string }>(`/partners/${id}`);
  if (!res.data.success) {
    throw new Error(res.data.message ?? '');
  }
}

export function usePartnerList() {
  return usePaginatedList<PartnerListItem, PartnerListParams>(fetchPartnerList);
}
