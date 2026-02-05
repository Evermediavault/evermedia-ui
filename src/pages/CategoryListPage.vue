<template>
  <PageBase :title="t('categoryList.title')" icon="category" content-class="full">
    <template #actions>
      <q-btn v-if="isAdmin" color="primary" unelevated no-caps class="ev-btn-primary category-list-page__add-btn"
        :label="t('categoryList.addCategory')" @click="openFormModal()" />
    </template>
    <div class="category-list-page">
      <div class="ev-glass-card ev-list-card">
        <q-inner-loading :showing="loading" color="primary" />
        <q-banner v-if="error" class="category-list-page__error ev-banner-error" rounded>
          {{ error.message }}
        </q-banner>
        <q-table separator="none" v-model:pagination="pagination" :rows="list" :columns="columns" row-key="id" flat dark
          :rows-per-page-options="rowsPerPageOptions" :no-data-label="t('categoryList.noData')"
          class="ev-table-theme category-list-page__table ev-scrollbar" :loading="loading" @request="onTableRequest">
          <template #header="props">
            <q-tr :props="props">
              <q-th v-for="col in props.cols" :key="col.name" :props="props" :align="col.align">
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>

          <template #body-cell-id="props">
            <q-td :props="props" class="category-list-page__cell-mono">
              {{ props.row.id }}
            </q-td>
          </template>

          <template #body-cell-name="props">
            <q-td :props="props" class="category-list-page__cell-name">
              <span class="category-list-page__name">{{ props.row.name }}</span>
            </q-td>
          </template>

          <template #body-cell-uid="props">
            <q-td :props="props" class="category-list-page__cell-mono">
              <span class="category-list-page__uid" :title="props.row.uid">{{ props.row.uid }}</span>
            </q-td>
          </template>

          <template #body-cell-description="props">
            <q-td :props="props" class="category-list-page__cell-desc">
              {{ props.row.description || '—' }}
            </q-td>
          </template>

          <template #body-cell-fileCount="props">
            <q-td :props="props" class="category-list-page__cell-mono">
              {{ props.row.fileCount ?? 0 }}
            </q-td>
          </template>

          <template #body-cell-createdAt="props">
            <q-td :props="props" class="category-list-page__cell-date">
              {{ formatDate(props.row.createdAt, DATE_FORMATS.DATETIME_SHORT) }}
            </q-td>
          </template>

          <template #body-cell-actions="props">
            <q-td :props="props" class="category-list-page__cell-actions">
              <template v-if="isAdmin">
                <q-btn outline no-caps color="primary" :label="t('categoryList.edit')"
                  class="category-list-page__action-btn" @click="onEdit(props.row)" />
                <q-btn outline no-caps color="negative" :label="t('categoryList.delete')"
                  class="category-list-page__action-btn" :disable="props.row.isDefault"
                  :title="props.row.isDefault ? t('categoryList.cannotDeleteDefault') : undefined"
                  @click="onDelete(props.row)" />
              </template>
              <span v-else class="category-list-page__no-actions">—</span>
            </q-td>
          </template>

          <template #no-data>
            <div class="ev-table-empty-state">
              <q-icon name="category" size="2.5rem" />
              <span>{{ t('categoryList.noData') }}</span>
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

    <EvModal v-model="showFormModal" :title="formModalTitle" persistent max-width="28rem" @close="resetForm">
      <q-form ref="formRef" class="category-list-page__form ev-field-theme" @submit.prevent="onSubmitForm">
        <q-input v-model="form.name" outlined dark :label="t('categoryList.columns.name')"
          :rules="[(v: string) => !!trim(v) || t('common.required')]" hide-bottom-space
          class="category-list-page__field" :disabled="formSubmitting" />
        <q-input v-model="form.description" outlined dark type="textarea" :label="t('categoryList.columns.description')"
          hide-bottom-space class="category-list-page__field" :disabled="formSubmitting" />
      </q-form>
      <template #actions>
        <q-btn flat no-caps :label="t('common.cancel')" color="grey" @click="showFormModal = false" />
        <q-btn unelevated no-caps color="primary" class="ev-btn-primary"
          :label="isEditMode ? t('common.save') : t('common.submit')" :loading="formSubmitting"
          :disable="formSubmitting" @click="onSubmitForm" />
      </template>
    </EvModal>

    <EvConfirmDialog
      v-model="showDeleteConfirm"
      icon="delete_outline"
      icon-color="negative"
      :title="t('common.confirm')"
      :description="deleteConfirmDescription"
      :cancel-label="t('common.cancel')"
      :confirm-label="t('categoryList.delete')"
      confirm-color="negative"
      :loading="deleteSubmitting"
      @confirm="onConfirmDelete"
      @cancel="categoryToDelete = null"
    />
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
import { useCategoryList, createCategory, updateCategory, deleteCategory } from 'src/composables/useCategoryList';
import { useNotify } from 'src/utils/notify';
import { handleAxiosError } from 'src/utils/error/handler';
import { useAuthStore } from 'src/stores/auth-store';
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from 'src/constants/common';
import type { CategoryListItem } from 'src/types/api';

function trim(s: string) {
  return (s ?? '').trim();
}

const { t } = useI18n();
const notify = useNotify();
const authStore = useAuthStore();
const { list, meta, loading, error, load } = useCategoryList();

const isAdmin = computed(() => (authStore.currentUser?.role ?? '').toLowerCase() === 'admin');

const showFormModal = ref(false);
const formSubmitting = ref(false);
const isEditMode = ref(false);
const editingRow = ref<CategoryListItem | null>(null);
const formRef = ref<{ validate: () => Promise<boolean> } | null>(null);
const form = ref({ name: '', description: '' });

const showDeleteConfirm = ref(false);
const categoryToDelete = ref<CategoryListItem | null>(null);
const deleteSubmitting = ref(false);

const formModalTitle = computed(() =>
  isEditMode.value ? t('categoryList.edit') : t('categoryList.addCategory'));

const deleteConfirmDescription = computed(() =>
  categoryToDelete.value
    ? t('categoryList.deleteConfirm', { name: categoryToDelete.value.name })
    : '');

function resetForm() {
  form.value = { name: '', description: '' };
  editingRow.value = null;
  isEditMode.value = false;
}

function openFormModal(row?: CategoryListItem) {
  if (row) {
    isEditMode.value = true;
    editingRow.value = row;
    form.value = { name: row.name, description: row.description || '' };
  } else {
    isEditMode.value = false;
    editingRow.value = null;
    form.value = { name: '', description: '' };
  }
  showFormModal.value = true;
}

async function onSubmitForm() {
  const valid = await formRef.value?.validate();
  if (!valid) return;
  const name = trim(form.value.name);
  if (!name) return;
  const desc = trim(form.value.description);
  formSubmitting.value = true;
  try {
    if (isEditMode.value && editingRow.value) {
      await updateCategory({
        uid: editingRow.value.uid,
        name,
        description: desc,
      });
      notify.success(t('success.updated'));
    } else {
      const createPayload: { name: string; description?: string } = { name };
      if (desc) createPayload.description = desc;
      await createCategory(createPayload);
      notify.success(t('success.created'));
    }
    showFormModal.value = false;
    resetForm();
    void fetchList();
  } catch (err) {
    const appErr = handleAxiosError(err);
    notify.error(appErr.message);
  } finally {
    formSubmitting.value = false;
  }
}

const rowsPerPageOptions = [...PAGE_SIZE_OPTIONS];

const columns = computed<QTableProps['columns']>(() => [
  { name: 'id', label: t('categoryList.columns.id'), field: 'id', align: 'left' },
  { name: 'name', label: t('categoryList.columns.name'), field: 'name', align: 'left', sortable: true },
  { name: 'uid', label: t('categoryList.columns.uid'), field: 'uid', align: 'left' },
  { name: 'description', label: t('categoryList.columns.description'), field: 'description', align: 'left' },
  { name: 'fileCount', label: t('categoryList.columns.fileCount'), field: 'fileCount', align: 'right' },
  { name: 'createdAt', label: t('categoryList.columns.createdAt'), field: 'createdAt', align: 'right', sortable: true },
  { name: 'actions', label: t('categoryList.columns.actions'), field: '', align: 'right' },
]);

const pagination = ref({
  page: 1,
  rowsPerPage: DEFAULT_PAGE_SIZE,
  rowsNumber: 0,
  sortBy: 'createdAt' as string,
  descending: true,
});

const maxPages = computed(() => Math.max(1, meta.value?.total_pages ?? 1));

const sortByToSortBy = (sortBy: string): 'created_at' | 'name' =>
  sortBy === 'name' ? 'name' : 'created_at';

function buildListParams() {
  const order: 'asc' | 'desc' = pagination.value.descending ? 'desc' : 'asc';
  return {
    page: pagination.value.page,
    page_size: pagination.value.rowsPerPage,
    sort_by: sortByToSortBy(pagination.value.sortBy),
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

function onEdit(row: CategoryListItem) {
  openFormModal(row);
}

function onDelete(row: CategoryListItem) {
  if (row.isDefault) return;
  categoryToDelete.value = row;
  showDeleteConfirm.value = true;
}

async function onConfirmDelete() {
  const row = categoryToDelete.value;
  if (!row) return;
  deleteSubmitting.value = true;
  try {
    await deleteCategory(row.uid);
    showDeleteConfirm.value = false;
    categoryToDelete.value = null;
    notify.success(t('success.deleted'));
    void fetchList();
  } catch (err) {
    const appErr = handleAxiosError(err);
    notify.error(appErr.message);
  } finally {
    deleteSubmitting.value = false;
  }
}

onMounted(() => {
  void fetchList();
});
</script>

<style lang="scss" scoped>
.category-list-page {
  display: flex;
  flex-direction: column;
  gap: var(--ev-space-6);
  min-height: 0;
}

.category-list-page__error {
  margin: var(--ev-space-4);
}

.category-list-page__cell-name,
.category-list-page__cell-mono,
.category-list-page__cell-desc,
.category-list-page__cell-date,
.category-list-page__cell-actions,
.category-list-page__cell-fileCount {
  vertical-align: middle;
}

.category-list-page__cell-mono {
  font-family: var(--ev-font-mono);
  font-size: var(--ev-font-size-xs);
  color: var(--ev-color-foreground-subtle);
}

.category-list-page__name {
  font-weight: var(--ev-font-weight-semibold);
  color: var(--ev-color-primary-light);
  letter-spacing: 0.02em;
}

.category-list-page__uid {
  font-family: var(--ev-font-mono);
  font-size: var(--ev-font-size-xs);
  color: var(--ev-color-foreground-subtle);
  max-width: var(--ev-cell-truncate-max-width);
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.category-list-page__cell-desc {
  color: var(--ev-color-foreground-subtle);
  font-size: var(--ev-font-size-xs);
}

.category-list-page__cell-date {
  color: var(--ev-color-foreground-subtle);
  font-size: var(--ev-font-size-xs);
}

.category-list-page__action-btn {
  margin-right: var(--ev-space-2);
  font-size: var(--ev-font-size-xs);
}

.category-list-page__no-actions {
  color: var(--ev-color-foreground-subtle);
  font-size: var(--ev-font-size-xs);
}

.category-list-page__add-btn {
  min-height: var(--ev-button-height);
}

.category-list-page__form {
  display: flex;
  flex-direction: column;
  gap: var(--ev-space-4);
}

.category-list-page__field {
  width: 100%;
}
</style>
