<template>
  <PageBase :title="t('userList.title')" icon="people" content-class="full">
    <template #actions>
      <q-btn color="primary" unelevated no-caps class="ev-btn-primary user-list-page__add-btn"
        :label="t('userList.addUser')" @click="openAddModal" />
    </template>
    <div class="user-list-page">
      <div class="ev-glass-card ev-list-card">
        <q-inner-loading :showing="loading" color="primary" />
        <q-banner v-if="error" class="user-list-page__error ev-banner-error" rounded>
          {{ error.message }}
          <template #action>
            <q-btn flat :label="t('common.retry')" @click="() => fetchList()" />
          </template>
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
              <span class="user-list-page__role-pill">{{ roleDisplayLabel(props.row.role) }}</span>
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

    <EvModal v-model="showUserModal" :title="userFormMode === 'add' ? t('userList.addUserModalTitle') : t('userList.edit')" persistent max-width="28rem"
      @close="resetUserForm">
      <q-form ref="userFormRef" class="user-list-page__form" @submit.prevent="onSubmitUserForm">
        <q-select v-model="userForm.role" :options="roleOptions" outlined dark :label="t('userList.columns.role')"
          emit-value map-options :rules="[(v: string) => !!v || t('common.required')]" hide-bottom-space
          class="user-list-page__field" :disabled="userFormSubmitting" />
        <q-input v-model="userForm.username" outlined dark :label="t('userList.columns.username')"
          :rules="[(v: string) => !!trim(v) || t('common.required')]" hide-bottom-space class="user-list-page__field"
          :disabled="userFormSubmitting" />
        <q-input v-model="userForm.email" type="email" outlined dark :label="t('userList.columns.email')"
          :rules="emailRules" hide-bottom-space class="user-list-page__field" :disabled="userFormSubmitting" />
        <q-input v-model="userForm.password" type="password" outlined dark :label="t('auth.password')"
          :placeholder="userFormMode === 'edit' ? t('userList.passwordPlaceholder') : undefined"
          :rules="userFormMode === 'add' ? [(v: string) => !!v || t('common.required')] : []" hide-bottom-space
          class="user-list-page__field" :disabled="userFormSubmitting" />
        <template v-if="userForm.role === 'alliance_member'">
          <div class="user-list-page__alliance-hint">{{ t('userList.allianceFieldsHint') }}</div>
          <q-input v-model="userForm.logo" outlined dark :label="t('userList.logo')"
            :placeholder="t('userList.logoPlaceholder')"
            :rules="allianceLogoRules" hide-bottom-space class="user-list-page__field" :disabled="userFormSubmitting" />
          <q-input v-model="userForm.project_name" outlined dark :label="t('userList.projectName')"
            :placeholder="t('userList.projectNamePlaceholder')"
            :rules="[(v: string) => (userForm.role !== 'alliance_member' || !!trim(v)) || t('common.required')]"
            hide-bottom-space class="user-list-page__field" :disabled="userFormSubmitting" />
          <q-input v-model="userForm.website" outlined dark :label="t('userList.website')"
            :placeholder="t('userList.websitePlaceholder')" :rules="websiteHttpsRules" hide-bottom-space
            class="user-list-page__field" :disabled="userFormSubmitting" />
          <q-input v-model="userForm.twitter" outlined dark :label="t('userList.twitter')"
            :placeholder="t('userList.twitterPlaceholder')" hide-bottom-space class="user-list-page__field"
            :disabled="userFormSubmitting" />
        </template>
        <q-input v-if="userForm.role === 'alliance_member'" v-model="userForm.intro" outlined dark
          :label="t('userList.intro')" type="textarea" autogrow :placeholder="t('userList.introPlaceholder')"
          hide-bottom-space class="user-list-page__field user-list-page__intro-field" :disabled="userFormSubmitting"
          :min-rows="3" />
      </q-form>
      <template #actions>
        <q-btn flat no-caps :label="t('common.cancel')" color="grey" @click="showUserModal = false" />
        <q-btn unelevated no-caps color="primary" class="ev-btn-primary"
          :label="userFormMode === 'add' ? t('common.submit') : t('common.save')"
          :loading="userFormSubmitting" :disable="userFormSubmitting" @click="onSubmitUserForm" />
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
  type CreateUserPayload,
  USER_LIST_SORT_BY_MAP,
} from 'src/types/api';

function trim(s: string) {
  return (s ?? '').trim();
}

const { t } = useI18n();
const notify = useNotify();
const { list, meta, loading, error, load } = useUserList();

type UserFormMode = 'add' | 'edit';

const showUserModal = ref(false);
const userFormMode = ref<UserFormMode>('add');
const userFormSubmitting = ref(false);
const toggleLoadingUid = ref<string | null>(null);
const userForm = ref({
  user_id: '',
  username: '',
  email: '',
  password: '',
  role: 'uploader' as UserRole,
  logo: '',
  project_name: '',
  intro: '',
  website: '',
  twitter: '',
});

const emptyUserForm = () => ({
  user_id: '',
  username: '',
  email: '',
  password: '',
  role: 'uploader' as UserRole,
  logo: '',
  project_name: '',
  intro: '',
  website: '',
  twitter: '',
});

function openAddModal() {
  userFormMode.value = 'add';
  userForm.value = { ...emptyUserForm(), password: '' };
  showUserModal.value = true;
}

function openEditModal(row: UserListItem) {
  const am = row.allianceMeta;
  userFormMode.value = 'edit';
  userForm.value = {
    user_id: row.uid,
    username: row.username,
    email: row.email,
    password: '',
    role: row.role as UserRole,
    logo: am?.logo ?? '',
    project_name: am?.project_name ?? '',
    intro: am?.intro ?? '',
    website: am?.website ?? '',
    twitter: am?.twitter ?? '',
  };
  showUserModal.value = true;
}

function resetUserForm() {
  userForm.value = emptyUserForm();
  userFormRef.value?.resetValidation?.();
}

function isHttpsUrl(s: string): boolean {
  const v = trim(s);
  if (!v) return true;
  try {
    return new URL(v).protocol === 'https:';
  } catch {
    return false;
  }
}

const websiteHttpsRules = [
  (v: string) => !trim(v) || isHttpsUrl(v) || t('validation.websiteMustHttps'),
];

const allianceLogoRules = [
  (v: string) =>
    (userForm.value.role !== 'alliance_member' || !!trim(v)) || t('common.required'),
  (v: string) => (userForm.value.role !== 'alliance_member' || trim(v) === '' || isHttpsUrl(v)) || t('validation.logoMustHttps'),
];

async function onSubmitUserForm() {
  const valid = await userFormRef.value?.validate();
  if (!valid) return;
  const u = trim(userForm.value.username);
  const e = trim(userForm.value.email).toLowerCase();
  if (!u || !e) return;
  if (userFormMode.value === 'add' && !trim(userForm.value.password)) return;
  userFormSubmitting.value = true;
  try {
    if (userFormMode.value === 'add') {
      const payload: CreateUserPayload = {
        username: u,
        email: e,
        password: userForm.value.password,
        role: userForm.value.role,
      };
      if (userForm.value.role === 'alliance_member') {
        payload.logo = trim(userForm.value.logo);
        payload.project_name = trim(userForm.value.project_name);
        payload.intro = trim(userForm.value.intro);
        payload.website = trim(userForm.value.website);
        payload.twitter = trim(userForm.value.twitter);
      }
      await createUser(payload);
      notify.success(t('userList.createSuccess'));
      showUserModal.value = false;
      resetUserForm();
    } else {
      const payload: Parameters<typeof updateUser>[0] = {
        user_id: userForm.value.user_id,
        username: u,
        email: e,
        role: userForm.value.role,
      };
      if (trim(userForm.value.password)) payload.password = userForm.value.password;
      if (userForm.value.role === 'alliance_member') {
        payload.logo = trim(userForm.value.logo);
        payload.project_name = trim(userForm.value.project_name);
        payload.intro = trim(userForm.value.intro);
        payload.website = trim(userForm.value.website);
        payload.twitter = trim(userForm.value.twitter);
      }
      await updateUser(payload);
      notify.success(t('userList.updateSuccess'));
      showUserModal.value = false;
    }
    await fetchList();
  } catch (err) {
    const appErr = handleAxiosError(err);
    notify.error(appErr.messageKey ? t(appErr.messageKey) : appErr.message);
  } finally {
    userFormSubmitting.value = false;
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
    notify.error(appErr.messageKey ? t(appErr.messageKey) : appErr.message);
  } finally {
    toggleLoadingUid.value = null;
  }
}

const userFormRef = ref<{ validate: () => Promise<boolean>; resetValidation?: () => void } | null>(null);

const roleOptions = computed(() => [
  { value: 'uploader' as UserRole, label: t('userList.roleUploader') },
  { value: 'alliance_member' as UserRole, label: t('userList.roleAllianceMember') },
  { value: 'admin' as UserRole, label: t('userList.roleAdmin') },
]);

function roleDisplayLabel(role: string): string {
  const map: Record<string, string> = {
    uploader: t('userList.roleUploader'),
    alliance_member: t('userList.roleAllianceMember'),
    admin: t('userList.roleAdmin'),
  };
  return map[role] ?? role;
}

const emailRules = [
  (v: string) => !!trim(v) || t('common.required'),
  (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trim(v)) || t('validation.email'),
];

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
  min-width: 6.5rem;
  padding: var(--ev-space-1) var(--ev-space-3);
  font-size: var(--ev-font-size-xs);
  font-weight: var(--ev-font-weight-medium);
  color: var(--ev-color-primary-light);
  background: var(--ev-color-primary-tint-bg);
  border: 1px solid var(--ev-color-primary-tint-border);
  border-radius: var(--ev-radius-md);
  text-align: center;
  box-sizing: border-box;
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

.user-list-page__alliance-hint {
  font-size: var(--ev-font-size-sm);
  color: var(--ev-color-foreground-muted);
  margin: var(--ev-space-1) 0;
}

.user-list-page__intro-field {
  :deep(.q-field__control) {
    min-height: 4.5rem;
  }
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
