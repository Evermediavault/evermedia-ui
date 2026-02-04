<template>
  <article class="file-selection ev-glass-card ev-scrollbar ev-field-theme">
    <!-- 头部：文件名 -->
    <header class="file-selection__header">
      <q-input
        v-model="customFileName"
        outlined
        dark
        :label="t('fileSelection.fileName')"
        :placeholder="t('fileSelection.fileNamePlaceholder')"
        class="file-selection__file-name"
        hide-bottom-space
        :maxlength="255"
        dense
      />
    </header>

    <div class="file-selection__divider" aria-hidden="true" />

    <!-- 主体：选择区 + 元数据 -->
    <div class="file-selection__body">
      <section class="file-selection__picker-section">
        <input
          ref="pickerInputRef"
          type="file"
          class="file-selection__input"
          accept="*"
          @change="onPickerInputChange"
        />
        <div
          v-if="!picker.file.value"
          class="file-selection__dropzone"
          role="button"
          tabindex="0"
          @click="triggerPicker"
          @keydown.enter.space.prevent="triggerPicker"
          @dragover.prevent="picker.onDragOver"
          @drop.prevent="picker.onDrop"
        >
          <q-icon name="cloud_upload" class="file-selection__dropzone-icon" size="2.5rem" />
          <span class="file-selection__dropzone-browse">{{ t('fileSelection.browse') }}</span>
          <span class="file-selection__dropzone-hint">{{ t('fileSelection.dropHint') }}</span>
        </div>
        <div v-else class="file-selection__preview">
          <div
            class="file-selection__preview-thumb"
            :class="previewThumbClass"
            :style="previewThumbStyle"
          >
            <!-- 仅图片、视频使用 Object URL 预览，避免大文件占用内存 -->
            <img
              v-if="previewKind === 'image' && previewUrl"
              :src="previewUrl"
              :alt="picker.file.value?.name"
              class="file-selection__preview-img"
            />
            <video
              v-else-if="previewKind === 'video' && previewUrl"
              :src="previewUrl"
              class="file-selection__preview-media"
              muted
              playsinline
              preload="metadata"
            />
            <!-- 其余类型：图标 + 背景色，不加载文件内容 -->
            <q-icon
              v-else
              :name="fileTypeIcon"
              class="file-selection__preview-icon file-selection__preview-icon--thumb"
              size="2.5rem"
            />
          </div>
          <div class="file-selection__preview-row">
            <span class="file-selection__preview-name" :title="picker.file.value?.name">
              {{ picker.file.value?.name }}
            </span>
            <q-btn
              icon="close"
              flat
              round
              dense
              size="sm"
              class="file-selection__preview-remove"
              :aria-label="t('fileSelection.removeFile')"
              @click.stop="clearFile"
            />
          </div>
        </div>
      </section>

      <section class="file-selection__meta-section">
        <div class="file-selection__meta-head">
          <h2 class="file-selection__meta-title">{{ t('upload.metaTitle') }}</h2>
          <q-btn
            outline
            no-caps
            dense
            size="sm"
            class="file-selection__add-meta"
            :aria-label="t('upload.addGroup')"
            @click="addMetaEntry"
          >
            <q-icon name="add" size="var(--ev-nav-icon-inner)" class="file-selection__add-meta-icon" />
            {{ t('upload.addGroup') }}
          </q-btn>
        </div>
        <div class="file-selection__meta-list">
          <div
            v-for="(entry, index) in metaEntries"
            :key="entry.id"
            class="file-selection__meta-card"
          >
            <div class="file-selection__meta-card-head">
              <span class="file-selection__meta-card-label">
                {{ entry.name || `${t('upload.metaGroupDefault')} ${index + 1}` }}
              </span>
              <q-btn
                icon="delete_outline"
                flat
                round
                dense
                size="sm"
                class="file-selection__meta-card-remove"
                :aria-label="t('upload.removeGroup')"
                @click="removeMetaEntry(entry.id)"
              />
            </div>
            <div class="file-selection__meta-card-body">
              <q-input
                v-model="entry.name"
                outlined
                dark
                dense
                :label="t('upload.metaName')"
                :rules="nameRules"
                class="file-selection__meta-field"
                hide-bottom-space
              />
              <q-select
                v-model="entry.type"
                :options="metaTypeOptions"
                outlined
                dark
                dense
                :label="t('upload.metaType')"
                emit-value
                map-options
                class="file-selection__meta-field"
                hide-bottom-space
              />
              <q-input
                v-model="entry.value"
                outlined
                dark
                dense
                :type="getValueInputType(entry.type)"
                :rows="entry.type === 'text' ? 2 : undefined"
                :label="t('upload.metaValue')"
                :rules="getValueRules(entry.type)"
                class="file-selection__meta-field"
                hide-bottom-space
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  </article>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { ref, computed, watch, onUnmounted } from 'vue';
import { useFilePicker } from 'src/composables/useFilePicker';
import {
  validateMetaValue,
  META_NAME_MAX_LENGTH,
  META_VALUE_MAX_LENGTH,
  isStringLength,
  type MetaEntryType,
} from 'src/utils/validation';
import type { FileSelectionValue } from 'src/components/models';

export type { FileSelectionValue } from './models';

defineProps<{
  modelValue?: FileSelectionValue | null;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: FileSelectionValue];
}>();

const { t } = useI18n();
const picker = useFilePicker();
const pickerInputRef = picker.inputRef;

type PreviewKind = 'image' | 'video' | 'audio' | 'pdf' | 'other';

function getPreviewKind(file: File | null): PreviewKind {
  if (!file?.type) return 'other';
  const t = file.type;
  if (t.startsWith('image/')) return 'image';
  if (t.startsWith('video/')) return 'video';
  if (t.startsWith('audio/')) return 'audio';
  if (t === 'application/pdf') return 'pdf';
  return 'other';
}

const previewKind = computed<PreviewKind>(() => getPreviewKind(picker.file.value));

const previewUrl = ref('');
/** 仅图片、视频创建 Object URL，避免 PDF/音频等大文件占用内存 */
const needsObjectUrl = computed(
  () => previewKind.value === 'image' || previewKind.value === 'video'
);
watch(
  () => [picker.file.value, needsObjectUrl.value] as const,
  ([f, need]) => {
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value);
      previewUrl.value = '';
    }
    if (f && need) previewUrl.value = URL.createObjectURL(f);
  },
  { immediate: true }
);

/** 按类型返回图标（非预览时显示） */
const fileTypeIcon = computed(() => {
  const f = picker.file.value;
  if (!f?.type) return 'insert_drive_file';
  const t = f.type;
  if (t === 'application/pdf') return 'picture_as_pdf';
  if (
    t === 'application/msword' ||
    t === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  )
    return 'description';
  if (
    t === 'application/vnd.ms-excel' ||
    t === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  )
    return 'table_chart';
  if (t.startsWith('audio/')) return 'audiotrack';
  if (t.startsWith('text/') || t === 'application/json' || t === 'application/xml')
    return 'description';
  return 'insert_drive_file';
});

/** 非预览时的缩略图背景色（PDF 红、Word 蓝等），仅非 image/video 时生效 */
const FILE_TYPE_BG: Record<string, string> = {
  pdf: 'rgba(193, 0, 21, 0.22)',
  word: 'rgba(43, 87, 154, 0.28)',
  excel: 'rgba(33, 115, 70, 0.28)',
  audio: 'rgba(139, 92, 246, 0.2)',
  text: 'rgba(255, 255, 255, 0.08)',
  other: 'rgba(255, 255, 255, 0.06)',
};
function getFileTypeBgKey(file: File | null): string {
  if (!file?.type) return 'other';
  const t = file.type;
  if (t === 'application/pdf') return 'pdf';
  if (
    t === 'application/msword' ||
    t === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  )
    return 'word';
  if (
    t === 'application/vnd.ms-excel' ||
    t === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  )
    return 'excel';
  if (t.startsWith('audio/')) return 'audio';
  if (t.startsWith('text/') || t === 'application/json' || t === 'application/xml')
    return 'text';
  return 'other';
}
const previewThumbClass = computed(() => {
  if (previewKind.value === 'image' || previewKind.value === 'video') return '';
  return 'file-selection__preview-thumb--icon';
});
const previewThumbStyle = computed((): Record<string, string> => {
  if (previewKind.value === 'image' || previewKind.value === 'video') return {};
  const bgKey = getFileTypeBgKey(picker.file.value);
  const bg = FILE_TYPE_BG[bgKey] ?? FILE_TYPE_BG.other ?? 'rgba(255,255,255,0.06)';
  return { '--ev-file-thumb-bg': bg };
});

function triggerPicker() {
  pickerInputRef.value?.click();
}

function onPickerInputChange(e: Event) {
  picker.onInputChange(e);
}

function clearFile() {
  picker.setFile(null);
}

onUnmounted(() => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
});

interface MetaEntry {
  id: string;
  name: string;
  type: MetaEntryType;
  value: string;
}

const customFileName = ref('');
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

function getValueInputType(type: MetaEntryType): 'text' | 'textarea' | 'url' | 'number' {
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
        !(v ?? '').trim() ||
        validateMetaValue(v, 'number') ||
        t('upload.metaValueNumberInvalid'),
    ];
  }
  return [
    (v: string) =>
      isStringLength(v ?? '', 0, META_VALUE_MAX_LENGTH) || t('upload.metaValueLength'),
  ];
}

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

function buildValue(): FileSelectionValue {
  const f = picker.file.value;
  const groups = metaEntries.value.map((e) => ({
    name: e.name ?? '',
    type: e.type,
    value: e.value ?? '',
  }));
  return {
    fileName: customFileName.value.trim(),
    metaEntries: groups,
    file: f ?? null,
  };
}

function emitValue() {
  emit('update:modelValue', buildValue());
}

watch([customFileName, metaEntries], emitValue, { deep: true });
watch(() => picker.fileCount.value, () => emitValue(), { immediate: true });
</script>

<style lang="scss" scoped>
.file-selection {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 0;
  border-radius: var(--ev-radius-xl);
  overflow: hidden;
  transition:
    box-shadow var(--ev-transition-base),
    background var(--ev-transition-base),
    border-color var(--ev-transition-base);

  &:hover {
    box-shadow: var(--ev-shadow-lg), var(--ev-shadow-glow);
  }
}

.file-selection__header {
  flex-shrink: 0;
  padding: var(--ev-space-4) var(--ev-space-5);
}

.file-selection__file-name {
  width: 100%;
  min-width: 0;
}

.file-selection__divider {
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--ev-color-border) 15%,
    var(--ev-color-border-strong) 50%,
    var(--ev-color-border) 85%,
    transparent 100%
  );
}

.file-selection__body {
  display: grid;
  grid-template-columns: minmax(0, var(--ev-picker-column-width)) 1fr;
  min-height: 0;
  gap: 0;
}

.file-selection__picker-section {
  flex-shrink: 0;
  padding: var(--ev-space-4);
  border-right: 1px solid var(--ev-color-border);
  display: flex;
  flex-direction: column;
  min-height: 0;
  position: relative;
}

.file-selection__input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  pointer-events: none;
}

.file-selection__dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--ev-space-2);
  min-height: var(--ev-dropzone-min-height);
  padding: var(--ev-space-4);
  border: 2px dashed var(--ev-color-border);
  border-radius: var(--ev-radius-lg);
  background: var(--ev-color-surface);
  color: var(--ev-color-foreground-muted);
  cursor: pointer;
  transition:
    border-color var(--ev-transition-fast),
    color var(--ev-transition-fast),
    background var(--ev-transition-fast);

  &:hover {
    border-color: var(--ev-color-primary-tint-border);
    color: var(--ev-color-primary-light);
    background: var(--ev-color-primary-tint-hover);
  }
  &:focus-visible {
    outline: none;
    box-shadow: var(--ev-focus-ring);
  }
}

.file-selection__dropzone-icon {
  opacity: 0.7;
}

.file-selection__dropzone-browse {
  font-size: var(--ev-font-size-sm);
  font-weight: var(--ev-font-weight-medium);
  color: var(--ev-color-primary-light);
}

.file-selection__dropzone-hint {
  font-size: var(--ev-font-size-xs);
  color: var(--ev-color-foreground-subtle);
}

.file-selection__preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--ev-space-2);
  min-height: var(--ev-dropzone-min-height);
  padding: var(--ev-space-4);
  border: 1px solid var(--ev-color-border);
  border-radius: var(--ev-radius-lg);
  background: var(--ev-color-surface);
}

.file-selection__preview-thumb {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: var(--ev-preview-thumb-min-height);
  border-radius: var(--ev-radius-md);
  background: var(--ev-color-surface-hover);
  overflow: hidden;
}
.file-selection__preview-thumb--icon {
  background: var(--ev-file-thumb-bg, var(--ev-color-surface-hover));
}
.file-selection__preview-icon--thumb {
  color: var(--ev-color-foreground-muted);
}

.file-selection__preview-img {
  max-width: 100%;
  max-height: var(--ev-preview-media-max-height);
  object-fit: contain;
}

.file-selection__preview-media {
  max-width: 100%;
  max-height: var(--ev-preview-media-max-height);
  object-fit: contain;
  display: block;
}

.file-selection__preview-icon {
  color: var(--ev-color-foreground-subtle);
}

.file-selection__preview-row {
  display: flex;
  align-items: center;
  gap: var(--ev-space-2);
  width: 100%;
  min-width: 0;
}

.file-selection__preview-name {
  flex: 1;
  min-width: 0;
  font-size: var(--ev-font-size-xs);
  color: var(--ev-color-foreground-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-selection__preview-remove {
  flex-shrink: 0;
  color: var(--ev-color-foreground-subtle);
  &:hover {
    color: var(--ev-color-negative);
  }
  &:focus-visible {
    outline: none;
    box-shadow: var(--ev-focus-ring);
  }
}

.file-selection__meta-section {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  padding: var(--ev-space-4);
}

.file-selection__meta-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ev-space-3);
  flex-shrink: 0;
  margin-bottom: var(--ev-space-3);
}

.file-selection__meta-title {
  margin: 0;
  font-size: var(--ev-font-size-sm);
  font-weight: var(--ev-font-weight-semibold);
  letter-spacing: 0.02em;
  color: var(--ev-color-foreground-muted);
}

.file-selection__add-meta {
  flex-shrink: 0;
  padding: var(--ev-space-1) var(--ev-space-3);
  border-radius: var(--ev-radius-md);
  font-size: var(--ev-font-size-xs);
  font-weight: var(--ev-font-weight-medium);
  color: var(--ev-color-primary-light);
  border-color: var(--ev-color-primary-tint-border);
  transition:
    color var(--ev-transition-fast),
    border-color var(--ev-transition-fast),
    background var(--ev-transition-fast);
  &:hover {
    color: var(--ev-color-foreground);
    border-color: var(--ev-color-primary-light);
    background: var(--ev-color-primary-tint-hover);
  }
  &:focus-visible {
    outline: none;
    box-shadow: var(--ev-focus-ring);
  }
}

.file-selection__add-meta-icon {
  margin-right: var(--ev-space-1);
}

.file-selection__meta-list {
  overflow-y: auto;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: var(--ev-space-3);
}

.file-selection__meta-card {
  border-radius: var(--ev-radius-lg);
  border: 1px solid var(--ev-color-border);
  background: var(--ev-color-surface);
  overflow: hidden;
  transition:
    border-color var(--ev-transition-fast),
    box-shadow var(--ev-transition-fast);
  &:hover {
    border-color: var(--ev-color-border-strong);
    box-shadow: var(--ev-shadow-sm);
  }
}

.file-selection__meta-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ev-space-2);
  padding: var(--ev-space-2) var(--ev-space-3);
  background: var(--ev-color-surface-hover);
  border-bottom: 1px solid var(--ev-color-border);
}

.file-selection__meta-card-label {
  font-size: var(--ev-font-size-xs);
  font-weight: var(--ev-font-weight-medium);
  color: var(--ev-color-foreground-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-selection__meta-card-remove {
  color: var(--ev-color-foreground-subtle);
  flex-shrink: 0;
  transition: color var(--ev-transition-fast);
  &:hover {
    color: var(--ev-color-negative);
  }
  &:focus-visible {
    outline: none;
    box-shadow: var(--ev-focus-ring);
  }
}

.file-selection__meta-card-body {
  display: flex;
  flex-direction: column;
  gap: var(--ev-space-2);
  padding: var(--ev-space-3);
}

@media (max-width: var(--ev-breakpoint-sm)) {
  .file-selection__body {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }
  .file-selection__picker-section {
    border-right: none;
    border-bottom: 1px solid var(--ev-color-border);
  }
}

@media (prefers-reduced-motion: reduce) {
  .file-selection,
  .file-selection__add-meta,
  .file-selection__meta-card-remove,
  .file-selection__meta-card {
    transition: none;
  }
}
</style>
