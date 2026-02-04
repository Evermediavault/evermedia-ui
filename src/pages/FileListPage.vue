<template>
  <PageBase :title="t('fileList.title')" icon="folder" content-class="full">
    <div class="file-list-page">
      <div class="file-list-page__card ev-glass-card">
        <q-inner-loading :showing="loading" color="primary" />
        <q-banner v-if="error" class="file-list-page__error bg-negative text-white" rounded>
          {{ error.message }}
        </q-banner>
        <q-table separator="none" v-model:pagination="pagination" :rows="list" :columns="columns" row-key="id" flat dark
          :rows-per-page-options="rowsPerPageOptions" :no-data-label="t('fileList.noData')"
          class="file-list-page__table" :loading="loading" @request="onTableRequest">
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
                color="primary" class="file-list-page__pagination" @update:model-value="refetch" />
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
import { useFileList } from 'src/composables/useFileList';
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from 'src/constants/common';

const { t } = useI18n();
const { list, meta, loading, error, load } = useFileList();

const rowsPerPageOptions = [...PAGE_SIZE_OPTIONS];

const columns = computed<QTableProps['columns']>(() => [
  { name: 'name', label: t('fileList.columns.name'), field: 'name', align: 'left' },
  { name: 'fileType', label: t('fileList.columns.fileType'), field: 'fileType', align: 'left' },
  { name: 'synapseIndexId', label: t('fileList.columns.synapseIndexId'), field: 'synapseIndexId', align: 'left' },
  { name: 'uploadedAt', label: t('fileList.columns.uploadedAt'), field: 'uploadedAt', align: 'right' },
]);

const pagination = ref({
  page: 1,
  rowsPerPage: DEFAULT_PAGE_SIZE,
  rowsNumber: 0,
  sortBy: 'uploadedAt' as string,
  descending: true,
});

const maxPages = computed(() => Math.max(1, meta.value?.total_pages ?? 1));

function buildListParams() {
  return {
    page: pagination.value.page,
    page_size: pagination.value.rowsPerPage,
  };
}

async function fetchList() {
  await load(buildListParams());
  if (meta.value) {
    pagination.value.rowsNumber = meta.value.total;
  }
}

function onTableRequest(requestProp: Parameters<NonNullable<QTableProps['onRequest']>>[0]) {
  const { pagination: p } = requestProp;
  pagination.value.page = p.page;
  pagination.value.rowsPerPage = p.rowsPerPage;
  void fetchList();
}

function refetch() {
  void fetchList();
}

onMounted(() => {
  void fetchList();
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
  position: relative;
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

.file-list-page__error {
  margin: var(--ev-space-4);
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
.file-list-page__cell-synapse,
.file-list-page__cell-date {
  vertical-align: middle;
}

.file-list-page__name {
  font-weight: var(--ev-font-weight-semibold);
  color: var(--ev-color-primary-light);
  letter-spacing: 0.02em;
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
