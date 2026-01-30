<template>
  <PageBase :title="t('userList.title')" icon="people" content-class="full">
    <div class="user-list-page">
      <div class="user-list-page__card ev-glass-card">
        <q-inner-loading :showing="loading" color="primary" />
        <q-banner v-if="error" class="user-list-page__error bg-negative text-white" rounded>
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
          class="user-list-page__table"
          :loading="loading"
          @request="onTableRequest"
        >
          <template #header="props">
            <q-tr :props="props" class="user-list-page__header-row">
              <q-th
                v-for="col in props.cols"
                :key="col.name"
                :props="props"
                :align="col.align"
                class="user-list-page__th"
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

          <template #bottom>
            <div class="user-list-page__bottom">
              <q-pagination
                v-model="pagination.page"
                :max="maxPages"
                :max-pages="7"
                direction-links
                boundary-links
                color="primary"
                class="user-list-page__pagination"
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

.user-list-page__card {
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

.user-list-page__error {
  margin: var(--ev-space-4);
  border-radius: var(--ev-radius-md);
}

.user-list-page__table {
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

.user-list-page__header-row {
  background: linear-gradient(
    180deg,
    var(--ev-color-primary-tint-bg) 0%,
    transparent 100%
  );
  border-bottom: 1px solid var(--ev-color-primary-tint-border);
}

.user-list-page__th {
  padding: var(--ev-space-4) var(--ev-space-5);
  font-size: var(--ev-font-size-xs);
  font-weight: var(--ev-font-weight-semibold);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--ev-color-foreground-muted);
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

.user-list-page__bottom {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: var(--ev-space-4) var(--ev-space-5);
  background: transparent;
  border-top: 0;
}

.user-list-page__pagination {
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
