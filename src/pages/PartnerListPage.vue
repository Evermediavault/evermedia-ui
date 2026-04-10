<template>
  <PageBase :title="t('partnerList.title')" icon="handshake" content-class="full">
    <template #actions>
      <q-btn color="primary" unelevated no-caps class="ev-btn-primary partner-list-page__add-btn"
        :label="t('partnerList.addPartner')" @click="openFormModal()" />
    </template>
    <div class="partner-list-page">
      <div class="ev-glass-card ev-list-card">
        <q-inner-loading :showing="loading" color="primary" />
        <q-banner v-if="error" class="partner-list-page__error ev-banner-error" rounded>
          {{ error.message }}
          <template #action>
            <q-btn flat :label="t('common.retry')" @click="() => fetchList()" />
          </template>
        </q-banner>
        <q-table separator="none" v-model:pagination="pagination" :rows="list" :columns="columns" row-key="id" flat
          dark :rows-per-page-options="rowsPerPageOptions" :no-data-label="t('partnerList.noData')"
          class="ev-table-theme partner-list-page__table ev-scrollbar" :loading="loading" @request="onTableRequest">
          <template #header="props">
            <q-tr :props="props">
              <q-th v-for="col in props.cols" :key="col.name" :props="props" :align="col.align">
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>

          <template #body-cell-id="props">
            <q-td :props="props" class="partner-list-page__cell-mono">
              {{ props.row.id }}
            </q-td>
          </template>

          <template #body-cell-logo="props">
            <q-td :props="props" class="partner-list-page__cell-logo">
              <img v-if="props.row.logo" class="partner-list-page__logo-thumb" :src="props.row.logo" alt=""
                loading="lazy" @error="onLogoImgError" />
              <span v-else class="partner-list-page__logo-fallback">—</span>
            </q-td>
          </template>

          <template #body-cell-tag="props">
            <q-td :props="props" class="partner-list-page__cell-tag">
              {{ props.row.tag || '—' }}
            </q-td>
          </template>

          <template #body-cell-name="props">
            <q-td :props="props" class="partner-list-page__cell-name">
              <span class="partner-list-page__name">{{ props.row.name }}</span>
            </q-td>
          </template>

          <template #body-cell-description="props">
            <q-td :props="props" class="partner-list-page__cell-desc">
              <span class="partner-list-page__desc-text" :title="props.row.description">{{ props.row.description ||
                '—' }}</span>
            </q-td>
          </template>

          <template #body-cell-link="props">
            <q-td :props="props" class="partner-list-page__cell-link">
              <a v-if="props.row.link" class="partner-list-page__link" :href="props.row.link" target="_blank"
                rel="noopener noreferrer">{{ truncateMiddle(props.row.link, 40) }}</a>
              <span v-else>—</span>
            </q-td>
          </template>

          <template #body-cell-createdAt="props">
            <q-td :props="props" class="partner-list-page__cell-date">
              {{ formatDate(props.row.createdAt, DATE_FORMATS.DATETIME_SHORT) }}
            </q-td>
          </template>

          <template #body-cell-actions="props">
            <q-td :props="props" class="partner-list-page__cell-actions">
              <q-btn outline no-caps color="primary" :label="t('partnerList.edit')"
                class="partner-list-page__action-btn" @click="onEdit(props.row)" />
              <q-btn outline no-caps color="negative" :label="t('partnerList.delete')"
                class="partner-list-page__action-btn" @click="onDelete(props.row)" />
            </q-td>
          </template>

          <template #no-data>
            <div class="ev-table-empty-state">
              <q-icon name="handshake" size="2.5rem" />
              <span>{{ t('partnerList.noData') }}</span>
            </div>
          </template>
          <template #bottom>
            <div class="ev-table-pagination-wrap">
              <q-pagination v-model="pagination.page" :max="maxPages" :max-pages="7" direction-links boundary-links
                color="primary" class="ev-table-pagination" @update:model-value="refetch()" />
            </div>
          </template>
        </q-table>
      </div>
    </div>

    <EvModal v-model="showFormModal" :title="formModalTitle" persistent max-width="32rem" @close="resetForm">
      <q-form ref="formRef" class="partner-list-page__form ev-field-theme" @submit.prevent="onSubmitForm">
        <q-input v-model="form.logo" outlined dark :label="t('partnerList.formLogo')"
          :rules="[(v: string) => !!trim(v) || t('common.required')]" hide-bottom-space class="partner-list-page__field"
          :disabled="formSubmitting" />
        <q-input v-model="form.tag" outlined dark :label="t('partnerList.formTag')" hide-bottom-space
          class="partner-list-page__field" :disabled="formSubmitting" />
        <q-input v-model="form.name" outlined dark :label="t('partnerList.formName')"
          :rules="[(v: string) => !!trim(v) || t('common.required')]" hide-bottom-space class="partner-list-page__field"
          :disabled="formSubmitting" />
        <q-input v-model="form.description" outlined dark type="textarea" autogrow :label="t('partnerList.formDescription')"
          :rules="[(v: string) => (trim(v).length <= 500) || t('validation.maxLength', { max: 500 })]" hide-bottom-space
          class="partner-list-page__field" :disabled="formSubmitting" />
        <q-input v-model="form.link" outlined dark :label="t('partnerList.formLink')"
          :rules="[(v: string) => !!trim(v) || t('common.required')]" hide-bottom-space class="partner-list-page__field"
          :disabled="formSubmitting" />
      </q-form>
      <template #actions>
        <q-btn flat no-caps :label="t('common.cancel')" color="grey" @click="showFormModal = false" />
        <q-btn unelevated no-caps color="primary" class="ev-btn-primary"
          :label="isEditMode ? t('common.save') : t('common.submit')" :loading="formSubmitting"
          :disable="formSubmitting" @click="onSubmitForm" />
      </template>
    </EvModal>

    <EvConfirmDialog v-model="showDeleteConfirm" icon="delete_outline" icon-color="negative" :title="t('common.confirm')"
      :description="deleteConfirmDescription" :cancel-label="t('common.cancel')" :confirm-label="t('partnerList.delete')"
      confirm-color="negative" :loading="deleteSubmitting" @confirm="onConfirmDelete" @cancel="partnerToDelete = null" />
  </PageBase>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { QTableProps } from 'quasar';
import PageBase from 'src/components/PageBase.vue';
import EvModal from 'src/components/EvModal.vue';
import EvConfirmDialog from 'src/components/EvConfirmDialog.vue';
import { formatDate, DATE_FORMATS } from 'src/utils/date/formatter';
import { usePartnerList, upsertPartner, deletePartner } from 'src/composables/usePartnerList';
import { useNotify } from 'src/utils/notify';
import { handleAxiosError } from 'src/utils/error/handler';
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from 'src/constants/common';
import type { PartnerListItem } from 'src/types/api';

function trim(s: string) {
  return (s ?? '').trim();
}

function truncateMiddle(s: string, max: number) {
  if (s.length <= max) return s;
  const half = Math.floor((max - 3) / 2);
  return `${s.slice(0, half)}…${s.slice(s.length - half)}`;
}

function onLogoImgError(e: Event) {
  const el = e.target as HTMLImageElement | null;
  if (el) el.style.display = 'none';
}

const { t } = useI18n();
const notify = useNotify();
const { list, meta, loading, error, load } = usePartnerList();

const showFormModal = ref(false);
const formSubmitting = ref(false);
const isEditMode = ref(false);
const editingRow = ref<PartnerListItem | null>(null);
const formRef = ref<{ validate: () => Promise<boolean> } | null>(null);
const form = ref({ logo: '', tag: '', name: '', description: '', link: '' });

const showDeleteConfirm = ref(false);
const partnerToDelete = ref<PartnerListItem | null>(null);
const deleteSubmitting = ref(false);

const formModalTitle = computed(() =>
  isEditMode.value ? t('partnerList.edit') : t('partnerList.addPartner'));

const deleteConfirmDescription = computed(() =>
  partnerToDelete.value
    ? t('partnerList.deleteConfirm', { name: partnerToDelete.value.name })
    : '');

function resetForm() {
  form.value = { logo: '', tag: '', name: '', description: '', link: '' };
  editingRow.value = null;
  isEditMode.value = false;
}

function openFormModal(row?: PartnerListItem) {
  if (row) {
    isEditMode.value = true;
    editingRow.value = row;
    form.value = {
      logo: row.logo,
      tag: row.tag,
      name: row.name,
      description: row.description,
      link: row.link,
    };
  } else {
    resetForm();
  }
  showFormModal.value = true;
}

async function onSubmitForm() {
  const valid = await formRef.value?.validate();
  if (!valid) return;
  const name = trim(form.value.name);
  const logo = trim(form.value.logo);
  const link = trim(form.value.link);
  if (!name || !logo || !link) return;

  formSubmitting.value = true;
  try {
    const payload: Parameters<typeof upsertPartner>[0] = {
      logo,
      name,
      link,
    };
    const tagT = trim(form.value.tag);
    if (tagT) payload.tag = tagT;
    const descT = trim(form.value.description);
    if (descT) payload.description = descT;
    if (isEditMode.value && editingRow.value) {
      payload.id = editingRow.value.id;
    }
    await upsertPartner(payload);
    notify.success(isEditMode.value ? t('success.updated') : t('success.created'));
    showFormModal.value = false;
    resetForm();
    void fetchList();
  } catch (err) {
    const appErr = handleAxiosError(err);
    notify.error(appErr.messageKey ? t(appErr.messageKey) : appErr.message);
  } finally {
    formSubmitting.value = false;
  }
}

const rowsPerPageOptions = [...PAGE_SIZE_OPTIONS];

const columns = computed<QTableProps['columns']>(() => [
  { name: 'id', label: t('partnerList.columns.id'), field: 'id', align: 'left' },
  { name: 'logo', label: t('partnerList.columns.logo'), field: 'logo', align: 'left' },
  { name: 'tag', label: t('partnerList.columns.tag'), field: 'tag', align: 'left' },
  { name: 'name', label: t('partnerList.columns.name'), field: 'name', align: 'left', sortable: true },
  { name: 'description', label: t('partnerList.columns.description'), field: 'description', align: 'left' },
  { name: 'link', label: t('partnerList.columns.link'), field: 'link', align: 'left' },
  { name: 'createdAt', label: t('partnerList.columns.createdAt'), field: 'createdAt', align: 'right', sortable: true },
  { name: 'actions', label: t('partnerList.columns.actions'), field: '', align: 'right' },
]);

const pagination = ref({
  page: 1,
  rowsPerPage: DEFAULT_PAGE_SIZE,
  rowsNumber: 0,
  sortBy: 'createdAt' as string,
  descending: true,
});

const maxPages = computed(() => Math.max(1, meta.value?.total_pages ?? 1));

function sortByToApi(sortBy: string): 'created_at' | 'name' {
  return sortBy === 'name' ? 'name' : 'created_at';
}

function buildListParams() {
  const order: 'asc' | 'desc' = pagination.value.descending ? 'desc' : 'asc';
  return {
    page: pagination.value.page,
    page_size: pagination.value.rowsPerPage,
    sort_by: sortByToApi(pagination.value.sortBy),
    order,
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
  if (p.sortBy != null) pagination.value.sortBy = p.sortBy;
  if (p.descending != null) pagination.value.descending = p.descending;
  void fetchList();
}

function refetch() {
  void fetchList();
}

function onEdit(row: PartnerListItem) {
  openFormModal(row);
}

function onDelete(row: PartnerListItem) {
  partnerToDelete.value = row;
  showDeleteConfirm.value = true;
}

async function onConfirmDelete() {
  const row = partnerToDelete.value;
  if (!row) return;
  deleteSubmitting.value = true;
  try {
    await deletePartner(row.id);
    showDeleteConfirm.value = false;
    partnerToDelete.value = null;
    notify.success(t('success.deleted'));
    void fetchList();
  } catch (err) {
    const appErr = handleAxiosError(err);
    notify.error(appErr.messageKey ? t(appErr.messageKey) : appErr.message);
  } finally {
    deleteSubmitting.value = false;
  }
}

onMounted(() => {
  void fetchList();
});
</script>

<style lang="scss" scoped>
.partner-list-page {
  display: flex;
  flex-direction: column;
  gap: var(--ev-space-6);
  min-height: 0;
}

.partner-list-page__error {
  margin: var(--ev-space-4);
}

.partner-list-page__cell-mono,
.partner-list-page__cell-logo,
.partner-list-page__cell-tag,
.partner-list-page__cell-name,
.partner-list-page__cell-desc,
.partner-list-page__cell-link,
.partner-list-page__cell-date,
.partner-list-page__cell-actions {
  vertical-align: middle;
}

.partner-list-page__cell-mono {
  font-family: var(--ev-font-mono);
  font-size: var(--ev-font-size-xs);
  color: var(--ev-color-foreground-subtle);
}

.partner-list-page__logo-thumb {
  width: 2.5rem;
  height: 2.5rem;
  object-fit: contain;
  border-radius: var(--ev-radius-sm);
  background: rgba(255, 255, 255, 0.04);
}

.partner-list-page__logo-fallback {
  color: var(--ev-color-foreground-subtle);
  font-size: var(--ev-font-size-xs);
}

.partner-list-page__name {
  font-weight: var(--ev-font-weight-semibold);
  color: var(--ev-color-primary-light);
  letter-spacing: 0.02em;
}

.partner-list-page__cell-desc {
  max-width: 14rem;
}

.partner-list-page__desc-text {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: var(--ev-font-size-xs);
  color: var(--ev-color-foreground-subtle);
}

.partner-list-page__cell-link {
  max-width: 12rem;
}

.partner-list-page__link {
  color: var(--ev-color-primary-light);
  font-size: var(--ev-font-size-xs);
  word-break: break-all;
}

.partner-list-page__cell-date {
  color: var(--ev-color-foreground-subtle);
  font-size: var(--ev-font-size-xs);
}

.partner-list-page__action-btn {
  margin-right: var(--ev-space-2);
  font-size: var(--ev-font-size-xs);
}

.partner-list-page__add-btn {
  min-height: var(--ev-button-height);
}

.partner-list-page__form {
  display: flex;
  flex-direction: column;
  gap: var(--ev-space-4);
}

.partner-list-page__field {
  width: 100%;
}
</style>
