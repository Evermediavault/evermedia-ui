<template>
  <PageBase :title="t('upload.title')" icon="cloud_upload" content-class="default">
    <template #actions>
      <q-btn color="primary" icon="cloud_upload" unelevated no-caps class="upload-page__upload-btn ev-btn-primary"
        :loading="isUploading" :disable="!canStartUpload" :aria-label="t('upload.startButton')"
        :label="t('upload.startButton')" @click="startUpload" />
    </template>
    <div class="upload-page">
      <div class="upload-page__provider-row ev-field-theme">
        <q-select v-model="selectedProviderId" :options="storageProviderOptions" outlined dark
          :label="t('upload.storageProvider')" :placeholder="t('upload.storageProviderPlaceholder')" emit-value
          map-options options-dense class="upload-page__provider" hide-bottom-space :loading="storageProvidersLoading"
          :disable="storageProvidersLoading"
          :rules="[(v: number | null) => v != null || t('upload.storageProviderRequired')]" :options-cover="false" />
        <q-select v-model="selectedCategoryUid" :options="categoryOptions" outlined dark emit-value map-options
          options-dense class="upload-page__category" hide-bottom-space :label="t('upload.category')"
          :placeholder="t('upload.categoryPlaceholder')" :loading="categoryListLoading" :disable="categoryListLoading"
          clearable :options-cover="false" />
      </div>
      <div class="upload-page__blocks">
        <q-expansion-item v-for="(block, index) in blocks" :key="block.id" :model-value="expandedBlockId === block.id"
          class="upload-page__expansion" dense @update:model-value="(v: boolean) => setExpanded(block.id, v)">
          <template #header>
            <q-item-section avatar>
              <q-icon name="insert_drive_file" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ getBlockLabel(block, index) }}</q-item-label>
            </q-item-section>
            <q-item-section v-if="blocks.length > 1" side>
              <q-btn icon="delete_outline" flat round dense size="sm" class="upload-page__block-remove"
                :aria-label="t('common.delete')" @click.stop="removeBlock(block.id)" />
            </q-item-section>
          </template>
          <FileSelection v-model="block.value" />
        </q-expansion-item>
      </div>
      <div class="upload-page__actions">
        <q-btn outline no-caps icon="add" class="upload-page__add-btn" :label="t('upload.addFile')" @click="addBlock" />
      </div>
    </div>
  </PageBase>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import PageBase from 'src/components/PageBase.vue';
import FileSelection from 'src/components/FileSelection.vue';
import type { FileSelectionValue } from 'src/components/models';
import { uploadBatch } from 'src/composables/useMediaUpload';
import { useStorageProviders } from 'src/composables/useStorageProviders';
import { useCategoryList } from 'src/composables/useCategoryList';
import { useAuthStore } from 'src/stores/auth-store';
import { useNotify } from 'src/utils/notify';
import { handleAxiosError } from 'src/utils/error/handler';

// -----------------------------------------------------------------------------
// 类型与工厂
// -----------------------------------------------------------------------------
interface Block {
  id: string;
  value: FileSelectionValue;
}

function createBlock(): Block {
  return {
    id: crypto.randomUUID(),
    value: { fileName: '', metaEntries: [], file: null },
  };
}

// -----------------------------------------------------------------------------
// 组合式与状态
// -----------------------------------------------------------------------------
const { t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();
const notify = useNotify();

const initialBlock = createBlock();
const blocks = ref<Block[]>([initialBlock]);
const expandedBlockId = ref<string | null>(initialBlock.id);
const selectedProviderId = ref<number | null>(null);
const isUploading = ref(false);

const { providers: storageProviders, loading: storageProvidersLoading, load: loadStorageProviders } =
  useStorageProviders();
const { list: categoryList, loading: categoryListLoading, load: loadCategories } = useCategoryList();

const selectedCategoryUid = ref<string | null>(null);

void loadStorageProviders();
onMounted(() => {
  void loadCategories({ page: 1, page_size: 100 });
});

// -----------------------------------------------------------------------------
// 派生数据
// -----------------------------------------------------------------------------
const storageProviderOptions = computed(() =>
  storageProviders.value.map((p) => ({ value: p.id, label: p.name }))
);

const categoryOptions = computed(() => [
  { value: null, label: t('upload.uncategorized') },
  ...categoryList.value.map((c) => ({ value: c.uid, label: c.name })),
]);

/** 已选文件的块（用于上传） */
const blocksWithFile = computed(() => blocks.value.filter((b) => b.value.file != null));

/** 是否存在未选文件的块（用于「添加文件」前校验） */
const hasBlockWithoutFile = computed(() => blocks.value.some((b) => b.value.file == null));

/** 是否存在空名称或空值的元数据行（禁止提交） */
const hasInvalidMeta = computed(() =>
  blocks.value.some((b) =>
    b.value.metaEntries?.some((e) => !(e.name ?? '').trim() || !(e.value ?? '').trim())
  )
);

/** 是否允许点击「开始上传」 */
const canStartUpload = computed(
  () =>
    !isUploading.value &&
    blocksWithFile.value.length > 0 &&
    !hasInvalidMeta.value &&
    selectedProviderId.value != null
);

// -----------------------------------------------------------------------------
// 块操作：展开/折叠、添加、删除、标题
// -----------------------------------------------------------------------------
function setExpanded(blockId: string, expanded: boolean) {
  if (expanded) {
    expandedBlockId.value = blockId;
  } else if (expandedBlockId.value === blockId) {
    expandedBlockId.value = null;
  }
}

function addBlock() {
  if (hasBlockWithoutFile.value) {
    notify.warning(t('upload.selectAllFilesBeforeAdd'));
    return;
  }
  const block = createBlock();
  blocks.value.push(block);
  expandedBlockId.value = block.id;
}

function removeBlock(id: string) {
  const next = blocks.value.filter((b) => b.id !== id);
  blocks.value = next;
  if (expandedBlockId.value === id) {
    expandedBlockId.value = next[0]?.id ?? null;
  }
}

function getBlockLabel(block: Block, index: number): string {
  const name = block.value.fileName?.trim() || block.value.file?.name;
  return name || t('upload.blockLabel', { index: index + 1 });
}

// -----------------------------------------------------------------------------
// 上传：校验、组 payload、一次性 POST 批量上传
// -----------------------------------------------------------------------------
function buildMetadataPayload(entries: FileSelectionValue['metaEntries']): string {
  const groups = (entries ?? [])
    .filter((e) => (e.name ?? '').trim() && (e.value ?? '').trim())
    .map((e) => ({
      name: (e.name ?? '').trim(),
      type: e.type,
      value: (e.value ?? '').trim(),
    }));
  return JSON.stringify({ groups });
}

async function startUpload() {
  if (hasInvalidMeta.value) {
    notify.warning(t('upload.metaNameValueRequired'));
    return;
  }
  if (blocksWithFile.value.length === 0) {
    notify.warning(t('upload.noFilesSelected'));
    return;
  }
  const providerId = selectedProviderId.value;
  if (providerId == null) {
    notify.warning(t('upload.storageProviderRequired'));
    return;
  }

  const list = blocksWithFile.value;
  const items = list.map((block) => {
    const { value } = block;
    const file = value.file!;
    const displayName = (value.fileName ?? '').trim() || file.name;
    return {
      file,
      displayName,
      metadataJson: buildMetadataPayload(value.metaEntries ?? []),
    };
  });

  isUploading.value = true;
  try {
    const data = await uploadBatch(providerId, items, selectedCategoryUid.value);
    if (data.length > 1) {
      notify.success(t('upload.successBatch', { count: data.length }));
    } else if (data.length === 1 && data[0]?.name) {
      notify.success(t('upload.successFile', { name: data[0].name }));
    } else {
      notify.success(t('upload.success'));
    }
  } catch (err) {
    if (err && typeof err === 'object' && 'response' in err && (err as { response?: { status?: number } }).response?.status === 401) {
      authStore.clearAuth();
      void router.push({ path: '/login', query: { redirect: router.currentRoute.value.fullPath } });
      return;
    }
    const appErr = handleAxiosError(err);
    notify.error(appErr.message, t('upload.retryHint'));
  } finally {
    isUploading.value = false;
  }
}
</script>

<style lang="scss" scoped>
.upload-page {
  display: flex;
  flex-direction: column;
  gap: var(--ev-space-6);
}

.upload-page__provider-row {
  flex-shrink: 0;
  display: flex;
  flex-wrap: wrap;
  gap: var(--ev-space-4);
}

.upload-page__provider,
.upload-page__category {
  flex: 1;
  min-width: 12rem;
  max-width: var(--ev-content-max-width-form);
}

.upload-page__blocks {
  display: flex;
  flex-direction: column;
  gap: var(--ev-space-2);
}

.upload-page__expansion {
  border-radius: var(--ev-radius-lg);
  overflow: hidden;
  background: var(--ev-color-surface);
  border: 1px solid var(--ev-color-border);
  margin-bottom: var(--ev-space-2);

  &:last-child {
    margin-bottom: 0;
  }

  :deep(.q-item) {
    min-height: var(--ev-expansion-item-min-height);
    padding: var(--ev-space-2) var(--ev-space-4);
  }

  :deep(.q-item__label) {
    font-size: var(--ev-font-size-sm);
    font-weight: var(--ev-font-weight-medium);
    color: var(--ev-color-foreground-muted);
  }

  :deep(.q-expansion-item__container) {
    border-top: 1px solid var(--ev-color-border);
  }

  :deep(.q-expansion-item__content) {
    padding: 0;
  }
}

.upload-page__block-remove {
  color: var(--ev-color-foreground-subtle);
  transition: color var(--ev-transition-fast);

  &:hover {
    color: var(--ev-color-negative);
  }

  &:focus-visible {
    outline: none;
    box-shadow: var(--ev-focus-ring);
  }
}

.upload-page__actions {
  flex-shrink: 0;
}

.upload-page__add-btn {
  color: var(--ev-color-primary-light);
  border-color: var(--ev-color-primary-tint-border);
}


.upload-page__upload-btn {
  width: 100%;
  max-width: var(--ev-content-max-width-form);
  height: var(--ev-button-height);
  font-size: var(--ev-font-size-sm);
  font-weight: var(--ev-font-weight-medium);
}
</style>
