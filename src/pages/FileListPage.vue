<template>
  <PageBase :title="t('fileList.title')" icon="folder" content-class="full">
    <div class="file-list-page">
      <div class="file-list-page__card ev-glass-card">
        <q-table separator="none" v-model:pagination="pagination" :rows="rows" :columns="columns" row-key="id" flat dark
          :rows-per-page-options="[10, 20, 50]" :no-data-label="t('fileList.noData')" class="file-list-page__table"
          @request="onRequest">
          <template #header="props">
            <q-tr :props="props" class="file-list-page__header-row">
              <q-th v-for="col in props.cols" :key="col.name" :props="props" :align="col.align"
                class="file-list-page__th">
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>

          <template #body-cell-name="props">
            <q-td :props="props" class="file-list-page__cell-name">
              <span class="file-list-page__name">{{ props.row.name }}</span>
            </q-td>
          </template>

          <template #body-cell-permission="props">
            <q-td :props="props" class="file-list-page__cell-permission">
              <span class="file-list-page__permission-pill">{{ props.row.permission }}</span>
            </q-td>
          </template>

          <template #body-cell-cost="props">
            <q-td :props="props" class="file-list-page__cell-cost">
              <span class="file-list-page__cost">{{ props.row.cost }}</span>
            </q-td>
          </template>

          <template #body-cell-synapseIndexId="props">
            <q-td :props="props" class="file-list-page__cell-synapse">
              <span class="file-list-page__synapse-id" :title="props.row.synapseIndexId">{{ props.row.synapseIndexId
                }}</span>
            </q-td>
          </template>

          <template #body-cell-uploadedAt="props">
            <q-td :props="props" class="file-list-page__cell-date">
              {{ formatDate(props.row.uploadedAt, DATE_FORMATS.DATETIME_SHORT) }}
            </q-td>
          </template>

          <template #bottom>
            <div class="file-list-page__bottom">
              <q-pagination v-model="pagination.page" :max="maxPages" :max-pages="7" direction-links boundary-links
                color="primary" class="file-list-page__pagination" @update:model-value="onPageChange" />
            </div>
          </template>
        </q-table>
      </div>
    </div>
  </PageBase>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { QTableProps } from 'quasar';
import PageBase from 'src/components/PageBase.vue';
import { formatDate, DATE_FORMATS } from 'src/utils/date/formatter';

const { t } = useI18n();

// 占位数据，后续接接口
const mockRows = ref([
  {
    id: 1,
    name: 'sample.pdf',
    fileType: 'application/pdf',
    permission: 'public',
    cost: '0.001',
    projectName: null as string | null,
    synapseIndexId: 'bafkzcib...',
    uploadedAt: '2026-01-29T10:00:00.000Z',
  },
  {
    id: 2,
    name: 'report.docx',
    fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    permission: 'public',
    cost: '0.002',
    projectName: 'Demo Project',
    synapseIndexId: 'bafkzcic...',
    uploadedAt: '2026-01-28T14:30:00.000Z',
  },
]);

const columns = computed<QTableProps['columns']>(() => [
  { name: 'name', label: t('fileList.columns.name'), field: 'name', align: 'left', sortable: true },
  { name: 'fileType', label: t('fileList.columns.fileType'), field: 'fileType', align: 'left' },
  { name: 'permission', label: t('fileList.columns.permission'), field: 'permission', align: 'center' },
  { name: 'cost', label: t('fileList.columns.cost'), field: 'cost', align: 'right' },
  { name: 'projectName', label: t('fileList.columns.projectName'), field: 'projectName', align: 'left' },
  { name: 'synapseIndexId', label: t('fileList.columns.synapseIndexId'), field: 'synapseIndexId', align: 'left' },
  { name: 'uploadedAt', label: t('fileList.columns.uploadedAt'), field: 'uploadedAt', align: 'right' },
]);

const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
  sortBy: 'uploadedAt' as string,
  descending: true,
});

const rowsNumber = computed(() => mockRows.value.length);
const maxPages = computed(() =>
  Math.max(1, Math.ceil(rowsNumber.value / pagination.value.rowsPerPage))
);

const rows = computed(() => {
  const { page, rowsPerPage, sortBy, descending } = pagination.value;
  const start = (page - 1) * rowsPerPage;
  let list = [...mockRows.value];
  if (sortBy) {
    const toSortKey = (x: unknown): string => {
      if (x === null || x === undefined) return '';
      if (typeof x === 'object') return JSON.stringify(x);
      return typeof x === 'string' ? x : `${Number(x)}`;
    };
    list = list.sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sortBy];
      const bVal = (b as Record<string, unknown>)[sortBy];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return descending ? 1 : -1;
      if (bVal == null) return descending ? -1 : 1;
      const cmp = toSortKey(aVal).localeCompare(toSortKey(bVal), undefined, { numeric: true });
      return descending ? -cmp : cmp;
    });
  }
  return list.slice(start, start + rowsPerPage);
});

function onRequest(requestProp: Parameters<NonNullable<QTableProps['onRequest']>>[0]) {
  const { pagination: p } = requestProp;
  pagination.value.rowsNumber = rowsNumber.value;
  pagination.value.page = p.page;
  pagination.value.rowsPerPage = p.rowsPerPage;
  pagination.value.sortBy = p.sortBy ?? pagination.value.sortBy;
  pagination.value.descending = p.descending ?? pagination.value.descending;
}

function onPageChange() {
  // 当前为前端分页，仅更新 page 即可；接接口时在此请求新页数据
}

onMounted(() => {
  pagination.value.rowsNumber = mockRows.value.length;
});
</script>

<style lang="scss" scoped>
.file-list-page {
  display: flex;
  flex-direction: column;
  gap: var(--ev-space-6);
  min-height: 0;
}

.file-list-page__card {
  padding: 0;
  border-radius: var(--ev-radius-xl);
  box-shadow: var(--ev-shadow-lg);
  overflow: hidden;
  background: var(--ev-glass-bg);
  border: 1px solid var(--ev-glass-border);

  &:hover {
    box-shadow: var(--ev-shadow-lg), var(--ev-shadow-glow);
    border-color: var(--ev-color-primary-tint-border);
  }
}

.file-list-page__table {
  background: transparent !important;

  :deep(.q-table__top),
  :deep(.q-table__bottom) {
    background: transparent;
    border-top: 0;
  }

  :deep(.q-table__container) {
    border: none;
    box-shadow: none;
  }

  :deep(thead tr th) {
    border: none;
    background: transparent;
  }

  :deep(tbody tr) {
    transition: background var(--ev-transition-fast);
  }

  :deep(tbody tr:hover td) {
    background: var(--ev-color-surface-hover);
  }

  :deep(.q-table tbody td) {
    padding: var(--ev-space-4) var(--ev-space-5);
    font-size: var(--ev-font-size-sm);
    color: var(--ev-color-foreground-muted);
    border-bottom: 1px solid var(--ev-color-border);
  }

  :deep(.q-table tbody tr:last-child td) {
    border-bottom: none;
  }
}

.file-list-page__header-row {
  background: linear-gradient(180deg,
      var(--ev-color-primary-tint-bg) 0%,
      transparent 100%);
  border-bottom: 1px solid var(--ev-color-primary-tint-border);
}

.file-list-page__th {
  padding: var(--ev-space-4) var(--ev-space-5);
  font-size: var(--ev-font-size-xs);
  font-weight: var(--ev-font-weight-semibold);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--ev-color-foreground-muted);
}

.file-list-page__cell-name,
.file-list-page__cell-permission,
.file-list-page__cell-cost,
.file-list-page__cell-synapse,
.file-list-page__cell-date {
  vertical-align: middle;
}

.file-list-page__name {
  font-weight: var(--ev-font-weight-semibold);
  color: var(--ev-color-primary-light);
  letter-spacing: 0.02em;
}

.file-list-page__permission-pill {
  display: inline-block;
  padding: var(--ev-space-1) var(--ev-space-3);
  font-size: var(--ev-font-size-xs);
  font-weight: var(--ev-font-weight-medium);
  color: var(--ev-color-primary-light);
  background: var(--ev-color-primary-tint-bg);
  border: 1px solid var(--ev-color-primary-tint-border);
  border-radius: var(--ev-radius-md);
}

.file-list-page__cost {
  font-family: var(--ev-font-mono);
  font-size: var(--ev-font-size-sm);
  color: var(--ev-color-foreground-muted);
}

.file-list-page__synapse-id {
  font-family: var(--ev-font-mono);
  font-size: var(--ev-font-size-xs);
  color: var(--ev-color-foreground-subtle);
  max-width: 8rem;
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-list-page__cell-date {
  color: var(--ev-color-foreground-subtle);
  font-size: var(--ev-font-size-xs);
}

.file-list-page__bottom {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: var(--ev-space-4) var(--ev-space-5);
  background: transparent;
  border-top: 0;
}

.file-list-page__pagination {
  flex-shrink: 0;

  :deep(.q-btn) {
    color: var(--ev-color-foreground-muted);
    border-radius: var(--ev-radius-md);
  }

  :deep(.q-btn:hover),
  :deep(.q-btn.q-btn--active) {
    color: var(--ev-color-primary-light);
    background: var(--ev-color-primary-tint-bg);
  }
}
</style>
