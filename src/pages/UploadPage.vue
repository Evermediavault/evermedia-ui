<template>
  <PageBase :title="t('upload.title')" icon="cloud_upload" content-class="full">
    <div class="upload-page">
      <div class="upload-page__row">
        <div class="upload-page__main">
          <div class="upload-page__card ev-glass-card ev-scrollbar upload-page__card--active">
            <div v-if="isUploading" class="upload-page__overlay">
              <q-spinner-dots color="var(--ev-color-primary-light)" size="var(--ev-spinner-size-lg)" />
              <span class="upload-page__overlay-text">{{ t('upload.uploading') }}</span>
            </div>
            <div v-if="uppy" class="upload-page__dashboard">
              <Dashboard :uppy="uppy" :props="dashboardProps" />
            </div>
          </div>
          <p class="upload-page__hint">
            {{ t('upload.hint') }}
            <span class="upload-page__hint-extra"> · {{ t('upload.hintSize') }}</span>
          </p>
        </div>
        <aside class="upload-page__sidebar">
          <div class="upload-page__sidebar-card ev-glass-card ev-scrollbar">
            <h2 class="upload-page__sidebar-title" id="upload-meta-title">{{ t('upload.metaTitle') }}</h2>
            <q-btn outline no-caps dense class="upload-page__add-btn" :aria-label="t('upload.addGroup')"
              @click="addMetaEntry">
              <q-icon name="add" size="var(--ev-nav-icon-inner)" class="q-mr-1" />
              {{ t('upload.addGroup') }}
            </q-btn>
            <div class="upload-page__meta-groups" aria-labelledby="upload-meta-title">
              <q-expansion-item v-for="(entry, index) in metaEntries" :key="entry.id"
                :label="entry.name || `${t('upload.metaGroupDefault')} ${index + 1}`" icon="folder"
                class="upload-page__expansion" dense default-opened>
                <div class="upload-page__group-body">
                  <q-input v-model="entry.name" outlined dense dark :label="t('upload.metaName')" :rules="nameRules"
                    class="upload-page__meta-field" hide-bottom-space />
                  <q-select v-model="entry.type" :options="metaTypeOptions" outlined dense dark
                    :label="t('upload.metaType')" emit-value map-options options-dense class="upload-page__meta-field"
                    hide-bottom-space />
                  <q-input v-model="entry.value" outlined dense dark :type="getValueInputType(entry.type)"
                    :rows="entry.type === 'text' ? 2 : undefined" :label="t('upload.metaValue')"
                    :rules="getValueRules(entry.type)" class="upload-page__meta-field" hide-bottom-space />
                  <q-btn icon="delete_outline" flat dense round :aria-label="t('upload.removeGroup')"
                    class="upload-page__group-remove" @click="removeMetaEntry(entry.id)" />
                </div>
              </q-expansion-item>
            </div>
            <div class="upload-page__sidebar-footer">
              <q-btn color="primary" icon="cloud_upload" unelevated no-caps
                class="upload-page__upload-btn ev-btn-primary" :loading="isUploading"
                :disable="!uppy || isUploading || hasInvalidMetaEntries || hasNoFiles" :aria-label="t('upload.startButton')"
                :label="t('upload.startButton')" @click="startUpload">
              </q-btn>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </PageBase>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import Dashboard from '@uppy/vue/dashboard';
import PageBase from 'src/components/PageBase.vue';
import { useUppy } from 'src/composables/uppy';
import { useAuthStore } from 'src/stores/auth-store';
import { useNotify } from 'src/utils/notify';
import {
  validateMetaValue,
  META_NAME_MAX_LENGTH,
  META_VALUE_MAX_LENGTH,
  isStringLength,
} from 'src/utils/validation';

import '@uppy/dashboard/css/style.min.css';

export type MetaEntryType = 'url' | 'input' | 'text' | 'number';

export interface MetaEntry {
  id: string;
  name: string;
  type: MetaEntryType;
  value: string;
}

const { t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();
const notify = useNotify();

const isUploading = ref(false);

const { uppy, fileCount } = useUppy({
  limit: 4,
  callbacks: {
    onUploadStart() {
      isUploading.value = true;
    },
    onUploadSuccess(file, response) {
      const name = file.name ?? 'file';
      const msg = response?.body?.message;
      notify.success(t('upload.successFile', { name }), msg ?? undefined);
    },
    onUploadError(file, _error, response) {
      if (response?.status === 401) {
        authStore.clearAuth();
        void router.push({ path: '/login', query: { redirect: router.currentRoute.value.fullPath } });
        return;
      }
      const name = file.name ?? 'file';
      const reason =
        response?.body?.detail?.reason ??
        response?.body?.message ??
        t('upload.error');
      notify.error(t('upload.errorFile', { name, reason }), t('upload.retryHint'));
    },
    onComplete() {
      isUploading.value = false;
    },
  },
});

const metaEntries = ref<MetaEntry[]>([]);

const metaTypeOptions = computed(() => [
  { value: 'url' as const, label: t('upload.metaTypeUrl') },
  { value: 'input' as const, label: t('upload.metaTypeInput') },
  { value: 'text' as const, label: t('upload.metaTypeText') },
  { value: 'number' as const, label: t('upload.metaTypeNumber') },
]);

const nameRules = [
  (v: string) =>
    isStringLength(v ?? '', 0, META_NAME_MAX_LENGTH) || t('upload.metaNameLength'),
];

function getValueInputType(
  type: MetaEntryType
): 'text' | 'textarea' | 'url' | 'number' {
  if (type === 'text') return 'textarea';
  if (type === 'url') return 'url';
  if (type === 'number') return 'number';
  return 'text';
}

function getValueRules(type: MetaEntryType) {
  if (type === 'url') {
    return [
      (v: string) =>
        !(v ?? '').trim() || validateMetaValue(v, 'url') || t('upload.metaValueUrlInvalid'),
    ];
  }
  if (type === 'number') {
    return [
      (v: string) =>
        !(v ?? '').trim() || validateMetaValue(v, 'number') || t('upload.metaValueNumberInvalid'),
    ];
  }
  return [
    (v: string) =>
      isStringLength(v ?? '', 0, META_VALUE_MAX_LENGTH) || t('upload.metaValueLength'),
  ];
}

// 与 _theme-tokens $dashboard-height (30rem = 480px) 一致，Uppy 需要数字 px
const DASHBOARD_HEIGHT_PX = 480;
const dashboardProps = computed(() => ({
  inline: true,
  width: '100%',
  height: DASHBOARD_HEIGHT_PX,
  theme: 'dark' as const,
  showProgressDetails: true,
  proudlyDisplayPoweredByUppy: false,
  hideUploadButton: true,
}));

function addMetaEntry() {
  metaEntries.value.push({
    id: crypto.randomUUID(),
    name: '',
    type: 'input',
    value: '',
  });
}

function removeMetaEntry(id: string) {
  metaEntries.value = metaEntries.value.filter((e) => e.id !== id);
}

/** 存在任一条目名称为空或值为空时禁止提交 */
const hasInvalidMetaEntries = computed(() =>
  metaEntries.value.some(
    (e) => !(e.name ?? '').trim() || !(e.value ?? '').trim()
  )
);

const hasNoFiles = computed(() => fileCount.value === 0);

/** 将右侧元数据组转为后端可用的 JSON 对象（groups 数组），仅包含名称与值均非空的条目 */
function buildMetadataPayload(): string {
  const groups = metaEntries.value
    .filter((e) => (e.name ?? '').trim() && (e.value ?? '').trim())
    .map((e) => ({ name: (e.name ?? '').trim(), type: e.type, value: (e.value ?? '').trim() }));
  return JSON.stringify({ groups });
}

function startUpload() {
  if (hasInvalidMetaEntries.value) {
    notify.warning(t('upload.metaNameValueRequired'));
    return;
  }
  const instance = uppy.value;
  if (!instance) return;
  if (instance.getFiles().length === 0) {
    notify.warning(t('upload.noFilesSelected'));
    return;
  }
  const metadataJson = buildMetadataPayload();
  instance.getFiles().forEach((file) => {
    instance.setFileState(file.id, {
      meta: { ...file.meta, metadata: metadataJson },
    });
  });
  void instance.upload();
}
</script>

<style lang="scss" scoped>
@use '../css/uppy-theme.scss' as uppy;

.upload-page {
  display: flex;
  flex-direction: column;
  gap: var(--ev-space-6);
  min-height: 0;
}

.upload-page__row {
  display: flex;
  gap: var(--ev-space-6);
  min-height: 0;
  flex: 1;
}

.upload-page__main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--ev-space-6);
}

.upload-page__sidebar {
  flex-shrink: 0;
  width: 20rem;
}

.upload-page__sidebar-card {
  display: flex;
  flex-direction: column;
  padding: var(--ev-space-6);
  border-radius: var(--ev-radius-xl);
  box-shadow: var(--ev-shadow-lg);
  transition: box-shadow var(--ev-transition-base), background var(--ev-transition-base);
  max-height: min(80vh, var(--ev-dashboard-max-height));

  &:hover {
    box-shadow: var(--ev-shadow-lg), var(--ev-shadow-glow);
  }
}

.upload-page__sidebar-title {
  margin: 0 0 var(--ev-space-4);
  font-size: var(--ev-font-size-lg);
  font-weight: var(--ev-font-weight-semibold);
  color: var(--ev-color-foreground-muted);
  letter-spacing: 0.02em;
  line-height: var(--ev-line-height-tight);
}

.upload-page__add-btn {
  margin-bottom: var(--ev-space-4);
  padding: var(--ev-space-2) var(--ev-space-4);
  border-radius: var(--ev-radius-lg);
  font-size: var(--ev-font-size-sm);
  font-weight: var(--ev-font-weight-medium);
  color: var(--ev-color-primary-light);
  border-color: var(--ev-color-primary-tint-border);
  transition: background var(--ev-transition-fast), border-color var(--ev-transition-fast);

  &:hover {
    background: var(--ev-color-primary-tint-bg);
    border-color: var(--ev-color-primary-tint-border-strong);
  }
}

.upload-page__meta-groups {
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

.upload-page__sidebar-footer {
  flex-shrink: 0;
  margin-top: var(--ev-space-4);
  padding-top: var(--ev-space-4);
  border-top: 1px solid var(--ev-color-border);
}

.upload-page__upload-btn {
  width: 100%;
  height: var(--ev-button-height);
  font-size: var(--ev-font-size-sm);
  font-weight: var(--ev-font-weight-medium);
}

.upload-page__expansion {
  margin-bottom: var(--ev-space-3);
  border-radius: var(--ev-radius-lg);
  overflow: hidden;
  background: var(--ev-color-surface-hover);
  border: 1px solid var(--ev-color-border);
  transition: border-color var(--ev-transition-fast), box-shadow var(--ev-transition-fast);

  &:last-child {
    margin-bottom: 0;
  }

  &:hover {
    border-color: var(--ev-color-border-strong);
  }

  :deep(.q-item) {
    min-height: var(--ev-nav-item-height);
    padding: var(--ev-space-2) var(--ev-space-3);
  }

  :deep(.q-focus-helper) {
    display: none;
  }

  :deep(.q-item__label) {
    font-size: var(--ev-font-size-sm);
    font-weight: var(--ev-font-weight-medium);
    color: var(--ev-color-foreground-muted);
    letter-spacing: 0.02em;
  }

  :deep(.q-expansion-item__container) {
    border-top: 1px solid var(--ev-color-border);
  }

  :deep(.q-item__section--side) {
    color: var(--ev-color-primary-light);
  }

  :deep(.q-expansion-item__toggle-icon) {
    color: var(--ev-color-foreground-subtle);
    transition: transform var(--ev-transition-fast), color var(--ev-transition-fast);
  }

  :deep(.q-expansion-item--expanded .q-expansion-item__toggle-icon) {
    color: var(--ev-color-primary-light);
  }
}

.upload-page__group-body {
  display: flex;
  flex-direction: column;
  gap: var(--ev-space-4);
  padding: var(--ev-space-4);
  background: var(--ev-color-background-elevated);
  border-top: 1px solid var(--ev-color-border);
}

.upload-page__group-remove {
  align-self: flex-end;
  margin-top: var(--ev-space-1);
  color: var(--ev-color-foreground-subtle);
  transition: color var(--ev-transition-fast);

  &:hover {
    color: var(--ev-color-negative);
  }
}

.upload-page__meta-field {
  flex: 1 1 auto;
  min-width: 0;

  :deep(.q-field) {
    --q-color-primary: var(--ev-color-primary-light);
    --q-color-negative: var(--ev-color-negative);
  }

  :deep(.q-field__control) {
    &::before {
      border-color: var(--ev-color-border);
    }

    &:hover::before {
      border-color: var(--ev-color-border-strong);
    }
  }

  :deep(.q-field--outlined .q-field__control::before) {
    border-width: 1px;
  }

  :deep(.q-field__control) {
    border-radius: var(--ev-radius-md);
  }

  :deep(.q-field__label) {
    color: var(--ev-color-foreground-muted);
    font-size: var(--ev-font-size-xs);
  }

  :deep(.q-field__native),
  :deep(.q-field__input) {
    color: var(--ev-color-foreground);
    font-size: var(--ev-font-size-sm);
  }

  :deep(.q-field--focused .q-field__control::after) {
    border-color: var(--ev-color-primary-tint-border-strong);
    border-width: 1px;
  }

  :deep(.q-field--focused .q-field__label) {
    color: var(--ev-color-primary-light);
  }

  :deep(.q-field--error .q-field__control::before),
  :deep(.q-field--error .q-field__control::after) {
    border-color: var(--ev-color-negative);
  }

  :deep(.q-field--error .q-field__label) {
    color: var(--ev-color-negative);
  }

  :deep(.q-field__bottom) {
    font-size: var(--ev-font-size-xs);
    color: var(--ev-color-negative);
  }
}

.upload-page__card {
  position: relative;
  padding: var(--ev-space-6) var(--ev-space-6) var(--ev-space-8);
  border-radius: var(--ev-radius-xl);
  box-shadow: var(--ev-shadow-lg);
  transition: box-shadow var(--ev-transition-base), background var(--ev-transition-base);

  &--active {
    background: var(--ev-color-surface-hover);

    &::before {
      opacity: 1;
    }
  }

  &:hover {
    box-shadow: var(--ev-shadow-lg), var(--ev-shadow-glow);
  }
}

.upload-page__dashboard {
  min-height: calc(20 * var(--ev-space-6));
  border-radius: var(--ev-radius-lg);
  overflow: hidden;
  margin: 0 var(--ev-space-1);

  @include uppy.ev-uppy-theme;
}

.upload-page__overlay {
  position: absolute;
  inset: 0;
  z-index: var(--ev-z-sticky);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--ev-space-3);
  border-radius: inherit;
  background: var(--ev-overlay-bg);
  transition: opacity var(--ev-transition-base);
}

.upload-page__overlay-text {
  font-size: var(--ev-font-size-sm);
  font-weight: var(--ev-font-weight-medium);
  color: var(--ev-color-foreground);
}

.upload-page__hint {
  margin: 0 0 var(--ev-space-2);
  padding: 0 var(--ev-space-1);
  font-size: var(--ev-font-size-sm);
  color: var(--ev-color-foreground-subtle);
  letter-spacing: 0.02em;
  line-height: var(--ev-line-height-relaxed);
  transition: color var(--ev-transition-fast);
}

.upload-page__hint-extra {
  color: var(--ev-color-foreground-muted);
}
</style>
