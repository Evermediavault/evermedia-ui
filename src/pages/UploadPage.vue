<template>
  <PageBase :title="t('upload.title')" icon="cloud_upload" content-class="full">
    <div class="upload-page">
      <div class="upload-page__row">
        <div class="upload-page__main">
          <div class="upload-page__card ev-glass-card ev-scrollbar upload-page__card--active">
            <div v-if="uppy" class="upload-page__dashboard">
              <Dashboard :uppy="uppy" :props="dashboardProps" />
            </div>
          </div>
          <p class="upload-page__hint">{{ t('upload.hint') }}</p>
        </div>
        <aside class="upload-page__sidebar">
          <div class="upload-page__sidebar-card ev-glass-card ev-scrollbar">
            <h2 class="upload-page__sidebar-title" id="upload-meta-title">{{ t('upload.metaTitle') }}</h2>
            <q-btn
              outline
              no-caps
              dense
              class="upload-page__add-btn"
              :aria-label="t('upload.addGroup')"
              @click="addMetaEntry"
            >
              <q-icon name="add" size="1.25rem" class="q-mr-1" />
              {{ t('upload.addGroup') }}
            </q-btn>
            <div class="upload-page__meta-groups" aria-labelledby="upload-meta-title">
              <q-expansion-item
                v-for="(entry, index) in metaEntries"
                :key="entry.id"
                :label="entry.name || `${t('upload.metaGroupDefault')} ${index + 1}`"
                icon="folder"
                class="upload-page__expansion"
                dense
                default-opened
              >
                <div class="upload-page__group-body">
                  <q-input
                    v-model="entry.name"
                    outlined
                    dense
                    dark
                    :label="t('upload.metaName')"
                    :rules="nameRules"
                    class="upload-page__meta-field"
                    hide-bottom-space
                  />
                  <q-select
                    v-model="entry.type"
                    :options="metaTypeOptions"
                    outlined
                    dense
                    dark
                    :label="t('upload.metaType')"
                    emit-value
                    map-options
                    options-dense
                    class="upload-page__meta-field"
                    hide-bottom-space
                  />
                  <q-input
                    v-model="entry.value"
                    outlined
                    dense
                    dark
                    :type="getValueInputType(entry.type)"
                    :rows="entry.type === 'text' ? 2 : undefined"
                    :label="t('upload.metaValue')"
                    :rules="getValueRules(entry.type)"
                    class="upload-page__meta-field"
                    hide-bottom-space
                  />
                  <q-btn
                    icon="delete_outline"
                    flat
                    dense
                    round
                    :aria-label="t('upload.removeGroup')"
                    class="upload-page__group-remove"
                    @click="removeMetaEntry(entry.id)"
                  />
                </div>
              </q-expansion-item>
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
import Dashboard from '@uppy/vue/dashboard';
import PageBase from 'src/components/PageBase.vue';
import { useUppy } from 'src/composables/uppy';
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
const { uppy } = useUppy({ limit: 4 });

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

const dashboardProps = computed(() => ({
  inline: true,
  width: '100%',
  height: 480,
  theme: 'dark' as const,
  showProgressDetails: true,
  proudlyDisplayPoweredByUppy: false,
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
  max-height: min(80vh, 640px);

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
    min-height: 2.75rem;
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
    border-color: var(--ev-color-primary-light);
    border-width: 2px;
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

.upload-page__hint {
  margin: 0 0 var(--ev-space-2);
  padding: 0 var(--ev-space-1);
  font-size: var(--ev-font-size-sm);
  color: var(--ev-color-foreground-subtle);
  letter-spacing: 0.02em;
  line-height: var(--ev-line-height-relaxed);
  transition: color var(--ev-transition-fast);
}

.upload-page__card {
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
  min-height: 480px;
  border-radius: var(--ev-radius-lg);
  overflow: hidden;
  margin: 0 var(--ev-space-1);

  @include uppy.ev-uppy-theme;
}
</style>
