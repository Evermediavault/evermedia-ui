<template>
  <PageBase :title="t('fileList.title')" icon="folder" content-class="full">
    <div class="file-list-page">
      <div class="ev-glass-card ev-list-card">
        <q-inner-loading :showing="loading" color="primary" />
        <q-banner v-if="error" class="file-list-page__error ev-banner-error" rounded>
          {{ error.message }}
        </q-banner>
        <q-table separator="none" v-model:pagination="pagination" :rows="list" :columns="columns" row-key="id" flat dark
          :rows-per-page-options="rowsPerPageOptions" :no-data-label="t('fileList.noData')"
          class="ev-table-theme file-list-page__table ev-scrollbar" :loading="loading" @request="onTableRequest">
          <template #header="props">
            <q-tr :props="props">
              <q-th v-for="col in props.cols" :key="col.name" :props="props" :align="col.align">
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

          <template #body-cell-synapseDataSetId="props">
            <q-td :props="props" class="file-list-page__cell-mono">
              {{ props.row.synapseDataSetId ?? '—' }}
            </q-td>
          </template>

          <template #body-cell-storageId="props">
            <q-td :props="props" class="file-list-page__cell-mono">
              {{ props.row.storageId ?? '—' }}
            </q-td>
          </template>

          <template #body-cell-category="props">
            <q-td :props="props" class="file-list-page__cell-category">
              {{ props.row.categoryName ?? '—' }}
            </q-td>
          </template>

          <template #body-cell-uploadedAt="props">
            <q-td :props="props" class="file-list-page__cell-date">
              {{ formatDate(props.row.uploadedAt, DATE_FORMATS.DATETIME_SHORT) }}
            </q-td>
          </template>

          <template #no-data>
            <div class="ev-table-empty-state">
              <q-icon name="folder_off" size="2.5rem" />
              <span>{{ t('fileList.noData') }}</span>
            </div>
          </template>

          <template #bottom>
            <div class="ev-table-pagination-wrap">
              <q-pagination v-model="pagination.page" :max="maxPages" :max-pages="7" direction-links boundary-links
                color="primary" class="ev-table-pagination" @update:model-value="refetch" />
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
  { name: 'synapseDataSetId', label: t('fileList.columns.dataSetId'), field: 'synapseDataSetId', align: 'left' },
  { name: 'storageId', label: t('fileList.columns.storageProviderId'), field: 'storageId', align: 'left' },
  { name: 'category', label: t('fileList.columns.category'), field: 'categoryName', align: 'left' },
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

.file-list-page__error {
  margin: var(--ev-space-4);
}

.file-list-page__cell-name,
.file-list-page__cell-synapse,
.file-list-page__cell-mono,
.file-list-page__cell-category,
.file-list-page__cell-date {
  vertical-align: middle;
}

.file-list-page__cell-mono {
  font-family: var(--ev-font-mono);
  font-size: var(--ev-font-size-xs);
  color: var(--ev-color-foreground-subtle);
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
  max-width: var(--ev-cell-truncate-max-width);
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-list-page__cell-category,
.file-list-page__cell-date {
  color: var(--ev-color-foreground-subtle);
  font-size: var(--ev-font-size-xs);
}
</style>
