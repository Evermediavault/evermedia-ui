<template>
  <PageBase :title="t('userList.title')" icon="people" content-class="full">
    <template #actions>
      <q-btn color="primary" unelevated no-caps class="ev-btn-primary user-list-page__add-btn"
        :label="t('userList.addUser')" @click="showAddModal = true" />
    </template>
    <div class="user-list-page">
      <div class="ev-glass-card ev-list-card">
        <q-inner-loading :showing="loading" color="primary" />
        <q-banner v-if="error" class="user-list-page__error ev-banner-error" rounded>
          {{ error.message }}
        </q-banner>
        <q-table separator="none" v-model:pagination="pagination" :rows="list" :columns="columns" row-key="id" flat dark
          :rows-per-page-options="rowsPerPageOptions" :no-data-label="t('userList.noData')"
          class="ev-table-theme user-list-page__table ev-scrollbar" :loading="loading" @request="onTableRequest">
          <template #header="props">
            <q-tr :props="props">
              <q-th v-for="col in props.cols" :key="col.name" :props="props" :align="col.align">
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

          <template #body-cell-status="props">
            <q-td :props="props" class="user-list-page__cell-status">
              <span
                :class="[
                  'user-list-page__status-pill',
                  props.row.disabled ? 'user-list-page__status-pill--disabled' : 'user-list-page__status-pill--normal',
                ]"
              >
                {{ props.row.disabled ? t('userList.statusDisabled') : t('userList.statusNormal') }}
              </span>
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

          <template #body-cell-actions="props">
            <q-td :props="props" class="user-list-page__cell-actions">
              <q-btn
                outline
                no-caps
                color="primary"
                :label="t('userList.edit')"
                class="user-list-page__action-btn"
                @click="openEditModal(props.row)"
              />
              <q-btn
                outline
                no-caps
                :color="props.row.disabled ? 'positive' : 'grey'"
                :label="props.row.disabled ? t('userList.enable') : t('userList.disable')"
                class="user-list-page__action-btn"
                :loading="toggleLoadingUid === props.row.uid"
                :disable="toggleLoadingUid != null"
                @click="toggleDisabled(props.row)"
              />
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
              <q-pagination v-model="pagination.page" :max="maxPages" :max-pages="7" direction-links boundary-links
                color="primary" class="ev-table-pagination" @update:model-value="refetch" />
            </div>
          </template>
        </q-table>
      </div>
    </div>

    <EvModal v-model="showAddModal" :title="t('userList.addUserModalTitle')" persistent max-width="28rem"
      @close="resetAddForm">
      <q-form ref="addFormRef" class="user-list-page__form" @submit.prevent="onSubmitAddUser">
        <q-input v-model="addForm.username" outlined dark :label="t('userList.columns.username')"
          :rules="[(v: string) => !!trim(v) || t('common.required')]" hide-bottom-space class="user-list-page__field"
          :disabled="addSubmitting" />
        <q-input v-model="addForm.email" type="email" outlined dark :label="t('userList.columns.email')"
          :rules="emailRules" hide-bottom-space class="user-list-page__field" :disabled="addSubmitting" />
        <q-input v-model="addForm.password" type="password" outlined dark :label="t('auth.password')"
          :rules="[(v: string) => !!v || t('common.required')]" hide-bottom-space class="user-list-page__field"
          :disabled="addSubmitting" />
        <q-select v-model="addForm.role" :options="roleOptions" outlined dark :label="t('userList.columns.role')"
          emit-value map-options :rules="[(v: string) => !!v || t('common.required')]" hide-bottom-space
          class="user-list-page__field" :disabled="addSubmitting" />
      </q-form>
      <template #actions>
        <q-btn flat no-caps :label="t('common.cancel')" color="grey" @click="showAddModal = false" />
        <q-btn unelevated no-caps color="primary" class="ev-btn-primary" :label="t('common.submit')"
          :loading="addSubmitting" :disable="addSubmitting" @click="onSubmitAddUser" />
      </template>
    </EvModal>

    <EvModal v-model="showEditModal" :title="t('userList.edit')" persistent max-width="28rem">
      <q-form ref="editFormRef" class="user-list-page__form" @submit.prevent="onSubmitEditUser">
        <q-input v-model="editForm.username" outlined dark :label="t('userList.columns.username')"
          :rules="[(v: string) => !!trim(v) || t('common.required')]" hide-bottom-space class="user-list-page__field"
          :disabled="editSubmitting" />
        <q-input v-model="editForm.email" type="email" outlined dark :label="t('userList.columns.email')"
          :rules="emailRules" hide-bottom-space class="user-list-page__field" :disabled="editSubmitting" />
        <q-input v-model="editForm.password" type="password" outlined dark :label="t('auth.password')"
          hide-bottom-space class="user-list-page__field" :placeholder="t('userList.passwordPlaceholder')"
          :disabled="editSubmitting" />
        <q-select v-model="editForm.role" :options="roleOptions" outlined dark :label="t('userList.columns.role')"
          emit-value map-options :rules="[(v: string) => !!v || t('common.required')]" hide-bottom-space
          class="user-list-page__field" :disabled="editSubmitting" />
      </q-form>
      <template #actions>
        <q-btn flat no-caps :label="t('common.cancel')" color="grey" @click="showEditModal = false" />
        <q-btn unelevated no-caps color="primary" class="ev-btn-primary" :label="t('common.save')"
          :loading="editSubmitting" :disable="editSubmitting" @click="onSubmitEditUser" />
      </template>
    </EvModal>
  </PageBase>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { QTableProps } from 'quasar';
import PageBase from 'src/components/PageBase.vue';
import EvModal from 'src/components/EvModal.vue';
import { formatDate, DATE_FORMATS } from 'src/utils/date/formatter';
import { useUserList, createUser, updateUser, setUserDisabled } from 'src/composables/useUserList';
import { useNotify } from 'src/utils/notify';
import { handleAxiosError } from 'src/utils/error/handler';
import {
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
} from 'src/constants/common';
import {
  type UserListItem,
  type UserListParams,
  type UserListTableSortBy,
  type UserRole,
  USER_LIST_SORT_BY_MAP,
} from 'src/types/api';

function trim(s: string) {
  return (s ?? '').trim();
}

const { t } = useI18n();
const notify = useNotify();
const { list, meta, loading, error, load } = useUserList();

const showAddModal = ref(false);
const addSubmitting = ref(false);
const addForm = ref({
  username: '',
  email: '',
  password: '',
  role: 'uploader' as UserRole,
});

const showEditModal = ref(false);
const editSubmitting = ref(false);
const toggleLoadingUid = ref<string | null>(null);
const editForm = ref({
  user_id: '',
  username: '',
  email: '',
  password: '',
  role: 'uploader' as UserRole,
});

function openEditModal(row: UserListItem) {
  editForm.value = {
    user_id: row.uid,
    username: row.username,
    email: row.email,
    password: '',
    role: row.role as UserRole,
  };
  showEditModal.value = true;
}

async function onSubmitEditUser() {
  const valid = await editFormRef.value?.validate();
  if (!valid) return;
  const u = trim(editForm.value.username);
  const e = trim(editForm.value.email).toLowerCase();
  if (!u || !e) return;
  editSubmitting.value = true;
  try {
    const payload: Parameters<typeof updateUser>[0] = {
      user_id: editForm.value.user_id,
      username: u,
      email: e,
      role: editForm.value.role,
    };
    if (trim(editForm.value.password)) {
      payload.password = editForm.value.password;
    }
    await updateUser(payload);
    notify.success(t('userList.updateSuccess'));
    showEditModal.value = false;
    await fetchList();
  } catch (err) {
    const appErr = handleAxiosError(err);
    notify.error(appErr.message);
  } finally {
    editSubmitting.value = false;
  }
}

async function toggleDisabled(row: UserListItem) {
  toggleLoadingUid.value = row.uid;
  try {
    await setUserDisabled(row.uid, !row.disabled);
    notify.success(t('userList.updateSuccess'));
    await fetchList();
  } catch (err) {
    const appErr = handleAxiosError(err);
    notify.error(appErr.message);
  } finally {
    toggleLoadingUid.value = null;
  }
}

const editFormRef = ref<{ validate: () => Promise<boolean> } | null>(null);

const roleOptions = computed(() => [
  { value: 'uploader' as UserRole, label: t('userList.roleUploader') },
  { value: 'admin' as UserRole, label: t('userList.roleAdmin') },
]);

const emailRules = [
  (v: string) => !!trim(v) || t('common.required'),
  (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trim(v)) || t('validation.email'),
];

function resetAddForm() {
  addForm.value = { username: '', email: '', password: '', role: 'uploader' };
}

const addFormRef = ref<{ validate: () => Promise<boolean> } | null>(null);

async function onSubmitAddUser() {
  const valid = await addFormRef.value?.validate();
  if (!valid) return;
  const u = trim(addForm.value.username);
  const e = trim(addForm.value.email).toLowerCase();
  const p = addForm.value.password;
  if (!u || !e || !p) return;
  addSubmitting.value = true;
  try {
    await createUser({ username: u, email: e, password: p, role: addForm.value.role });
    notify.success(t('userList.createSuccess'));
    showAddModal.value = false;
    resetAddForm();
    await fetchList();
  } catch (err) {
    const appErr = handleAxiosError(err);
    notify.error(appErr.message);
  } finally {
    addSubmitting.value = false;
  }
}

const rowsPerPageOptions = [...PAGE_SIZE_OPTIONS];

const columns = computed<QTableProps['columns']>(() => [
  { name: 'username', label: t('userList.columns.username'), field: 'username', align: 'left', sortable: true },
  { name: 'email', label: t('userList.columns.email'), field: 'email', align: 'left' },
  { name: 'role', label: t('userList.columns.role'), field: 'role', align: 'center' },
  { name: 'status', label: t('userList.columns.status'), field: 'disabled', align: 'center' },
  { name: 'lastLoginAt', label: t('userList.columns.lastLoginAt'), field: 'lastLoginAt', align: 'right' },
  { name: 'createdAt', label: t('userList.columns.createdAt'), field: 'createdAt', align: 'right' },
  { name: 'actions', label: t('userList.columns.actions'), field: '', align: 'right' },
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
.user-list-page__cell-status,
.user-list-page__cell-date,
.user-list-page__cell-actions {
  vertical-align: middle;
}

.user-list-page__status-pill {
  display: inline-block;
  padding: var(--ev-space-1) var(--ev-space-3);
  font-size: var(--ev-font-size-xs);
  font-weight: var(--ev-font-weight-medium);
  border-radius: var(--ev-radius-md);
}

.user-list-page__status-pill--normal {
  color: var(--ev-color-positive);
  background: rgba(33, 186, 69, 0.12);
  border: 1px solid rgba(33, 186, 69, 0.25);
}

.user-list-page__status-pill--disabled {
  color: var(--ev-color-foreground-subtle);
  background: var(--ev-color-surface-hover);
  border: 1px solid var(--ev-color-border);
}

.user-list-page__cell-actions {
  white-space: nowrap;
}

.user-list-page__action-btn {
  min-height: var(--ev-button-height);
  padding: 0 var(--ev-space-3);
  font-size: var(--ev-font-size-sm);
  font-weight: var(--ev-font-weight-medium);
  margin-right: var(--ev-space-2);
}

.user-list-page__action-btn:last-child {
  margin-right: 0;
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

.user-list-page__form {
  display: flex;
  flex-direction: column;
  gap: var(--ev-space-4);
}

.user-list-page__field {
  :deep(.q-field) {
    --q-color-primary: var(--ev-color-primary-light);
  }

  :deep(.q-field__control::before) {
    border-color: var(--ev-color-border);
  }

  :deep(.q-field__control:hover::before) {
    border-color: var(--ev-color-border-strong);
  }

  :deep(.q-field--outlined .q-field__control::before) {
    border-width: 1px;
  }

  :deep(.q-field__label) {
    color: var(--ev-color-foreground-muted);
  }

  :deep(.q-field__native),
  :deep(.q-field__input) {
    color: var(--ev-color-foreground);
  }

  :deep(.q-field--focused .q-field__control::after) {
    border-color: var(--ev-color-primary-tint-border-strong);
    border-width: 1px;
  }

  :deep(.q-field--focused .q-field__label) {
    color: var(--ev-color-primary-light);
  }
}
</style>
