<template>
  <PageBase :title="t('userList.title')" icon="people" content-class="full">
    <div class="user-list-page">
      <div class="ev-glass-card ev-list-card">
        <q-inner-loading :showing="loading" color="primary" />
        <q-banner v-if="error" class="user-list-page__error ev-banner-error" rounded>
          {{ error.message }}
        </q-banner>
        <q-table
          separator="none"
          v-model:pagination="pagination"
          :rows="list"
          :columns="columns"
          row-key="id"
          flat
          dark
          :rows-per-page-options="rowsPerPageOptions"
          :no-data-label="t('userList.noData')"
          class="ev-table-theme user-list-page__table ev-scrollbar"
          :loading="loading"
          @request="onTableRequest"
        >
          <template #header="props">
            <q-tr :props="props">
              <q-th
                v-for="col in props.cols"
                :key="col.name"
                :props="props"
                :align="col.align"
              >
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>

          <template #body-cell-username="props">
            <q-td :props="props" class="user-list-page__cell-username">
              <span class="user-list-page__name">{{ props.row.username }}</span>
            </q-td>
          </template>

          <template #body-cell-role="props">
            <q-td :props="props" class="user-list-page__cell-role">
              <span class="user-list-page__role-pill">{{ props.row.role }}</span>
            </q-td>
          </template>

          <template #body-cell-lastLoginAt="props">
            <q-td :props="props" class="user-list-page__cell-date">
              {{ props.row.lastLoginAt ? formatDate(props.row.lastLoginAt, DATE_FORMATS.DATETIME_SHORT) : '—' }}
            </q-td>
          </template>

          <template #body-cell-createdAt="props">
            <q-td :props="props" class="user-list-page__cell-date">
              {{ formatDate(props.row.createdAt, DATE_FORMATS.DATETIME_SHORT) }}
            </q-td>
          </template>

          <template #no-data>
            <div class="ev-table-empty-state">
              <q-icon name="people_outline" size="2.5rem" />
              <span>{{ t('userList.noData') }}</span>
            </div>
          </template>

          <template #bottom>
            <div class="ev-table-pagination-wrap">
              <q-pagination
                v-model="pagination.page"
                :max="maxPages"
                :max-pages="7"
                direction-links
                boundary-links
                color="primary"
                class="ev-table-pagination"
                @update:model-value="refetch"
              />
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
import { useUserList } from 'src/composables/useUserList';
import {
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
} from 'src/constants/common';
import {
  type UserListParams,
  type UserListTableSortBy,
  USER_LIST_SORT_BY_MAP,
} from 'src/types/api';

const { t } = useI18n();
const { list, meta, loading, error, load } = useUserList();

const rowsPerPageOptions = [...PAGE_SIZE_OPTIONS];

const columns = computed<QTableProps['columns']>(() => [
  { name: 'username', label: t('userList.columns.username'), field: 'username', align: 'left', sortable: true },
  { name: 'email', label: t('userList.columns.email'), field: 'email', align: 'left' },
  { name: 'role', label: t('userList.columns.role'), field: 'role', align: 'center' },
  { name: 'lastLoginAt', label: t('userList.columns.lastLoginAt'), field: 'lastLoginAt', align: 'right' },
  { name: 'createdAt', label: t('userList.columns.createdAt'), field: 'createdAt', align: 'right' },
]);

const pagination = ref({
  page: 1,
  rowsPerPage: DEFAULT_PAGE_SIZE,
  rowsNumber: 0,
  sortBy: 'createdAt' as UserListTableSortBy,
  descending: true,
});

const maxPages = computed(() => Math.max(1, meta.value?.total_pages ?? 1));

function buildListParams(): UserListParams {
  const sortBy = USER_LIST_SORT_BY_MAP[pagination.value.sortBy] ?? 'created_at';
  return {
    page: pagination.value.page,
    page_size: pagination.value.rowsPerPage,
    sort_by: sortBy,
    order: pagination.value.descending ? 'desc' : 'asc',
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
  pagination.value.sortBy = (p.sortBy ?? pagination.value.sortBy) as UserListTableSortBy;
  pagination.value.descending = p.descending ?? pagination.value.descending;
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
.user-list-page {
  display: flex;
  flex-direction: column;
  gap: var(--ev-space-6);
  min-height: 0;
}

.user-list-page__error {
  margin: var(--ev-space-4);
  border-radius: var(--ev-radius-md);
}

.user-list-page__cell-username,
.user-list-page__cell-role,
.user-list-page__cell-date {
  vertical-align: middle;
}

.user-list-page__name {
  font-weight: var(--ev-font-weight-semibold);
  color: var(--ev-color-primary-light);
  letter-spacing: 0.02em;
}

.user-list-page__role-pill {
  display: inline-block;
  padding: var(--ev-space-1) var(--ev-space-3);
  font-size: var(--ev-font-size-xs);
  font-weight: var(--ev-font-weight-medium);
  color: var(--ev-color-primary-light);
  background: var(--ev-color-primary-tint-bg);
  border: 1px solid var(--ev-color-primary-tint-border);
  border-radius: var(--ev-radius-md);
}

.user-list-page__cell-date {
  color: var(--ev-color-foreground-subtle);
  font-size: var(--ev-font-size-xs);
}
</style>
