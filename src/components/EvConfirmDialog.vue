<template>
  <EvModal
    :model-value="modelValue"
    title=""
    persistent
    :max-width="maxWidth"
    @update:model-value="onModelValueUpdate"
    @close="onClose"
  >
    <div class="ev-confirm-dialog__body">
      <div v-if="icon" class="ev-confirm-dialog__icon-wrap" :class="iconWrapClass">
        <q-icon :name="icon" class="ev-confirm-dialog__icon" />
      </div>
      <p v-if="description" class="ev-confirm-dialog__description">{{ description }}</p>
      <slot v-else name="description" />
    </div>
    <template #actions>
      <div class="ev-confirm-dialog__actions">
        <q-btn flat no-caps :label="cancelLabel" class="ev-confirm-dialog__btn ev-confirm-dialog__btn--cancel"
          :disable="loading" @click="onCancel" />
        <q-btn unelevated no-caps :color="confirmColor" class="ev-confirm-dialog__btn ev-confirm-dialog__btn--confirm"
          :label="confirmLabel" :loading="loading" :disable="loading" @click="onConfirm" />
      </div>
    </template>
  </EvModal>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import EvModal from 'src/components/EvModal.vue';

const props = withDefaults(
  defineProps<{
    /** v-model 控制显隐 */
    modelValue: boolean;
    /** 图标名（Quasar 图标） */
    icon?: string;
    /** 图标颜色类（如 negative 表示危险操作） */
    iconColor?: 'primary' | 'negative' | 'warning' | 'grey';
    /** 标题 */
    title?: string;
    /** 描述文案（也可用 #description 插槽） */
    description?: string;
    /** 取消按钮文案 */
    cancelLabel?: string;
    /** 确认按钮文案 */
    confirmLabel?: string;
    /** 确认按钮颜色 */
    confirmColor?: string;
    /** 确认中（禁用按钮并显示 loading） */
    loading?: boolean;
    /** 弹层最大宽度 */
    maxWidth?: string;
  }>(),
  {
    iconColor: 'primary',
    cancelLabel: '取消',
    confirmLabel: '确认',
    confirmColor: 'primary',
    loading: false,
    maxWidth: '28rem',
  }
);

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  confirm: [];
  cancel: [];
  close: [];
}>();

const iconWrapClass = computed(() => `ev-confirm-dialog__icon-wrap--${props.iconColor}`);

function onModelValueUpdate(value: boolean) {
  emit('update:modelValue', value);
}

function onClose() {
  emit('close');
  emit('cancel');
}

function onCancel() {
  emit('update:modelValue', false);
  emit('cancel');
}

function onConfirm() {
  emit('confirm');
}
</script>

<style lang="scss" scoped>
.ev-confirm-dialog__body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--ev-space-6);
  text-align: center;
  padding: var(--ev-space-2) 0 var(--ev-space-4);
}

.ev-confirm-dialog__icon-wrap {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ev-confirm-dialog__icon-wrap--primary {
  background: var(--ev-color-primary-tint-bg, rgba(6, 186, 217, 0.12));
  box-shadow: 0 0 0 1px var(--ev-color-primary-tint-border, rgba(6, 186, 217, 0.25));
  .ev-confirm-dialog__icon {
    color: var(--ev-color-primary);
  }
}

.ev-confirm-dialog__icon-wrap--negative {
  background: var(--ev-negative-tint, rgba(193, 0, 21, 0.12));
  box-shadow: 0 0 0 1px rgba(193, 0, 21, 0.2);
  .ev-confirm-dialog__icon {
    color: var(--ev-color-negative, #c10015);
  }
}

.ev-confirm-dialog__icon-wrap--warning {
  background: rgba(242, 192, 55, 0.12);
  box-shadow: 0 0 0 1px rgba(242, 192, 55, 0.25);
  .ev-confirm-dialog__icon {
    color: var(--ev-color-warning, #f2c037);
  }
}

.ev-confirm-dialog__icon-wrap--grey {
  background: rgba(255, 255, 255, 0.06);
  box-shadow: 0 0 0 1px var(--ev-color-border);
  .ev-confirm-dialog__icon {
    color: var(--ev-color-foreground-muted);
  }
}

.ev-confirm-dialog__icon {
  font-size: 2rem;
}

.ev-confirm-dialog__description {
  margin: 0;
  font-size: var(--ev-font-size-base);
  line-height: var(--ev-line-height-relaxed);
  color: var(--ev-color-foreground-muted);
  max-width: 20rem;
  letter-spacing: 0.01em;
}

.ev-confirm-dialog__actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--ev-space-4);
  width: 100%;
}

.ev-confirm-dialog__btn {
  min-height: var(--ev-button-height);
  min-width: 5.5rem;
  font-weight: var(--ev-font-weight-medium);
  border-radius: var(--ev-radius-lg);
}

.ev-confirm-dialog__btn--cancel {
  color: var(--ev-color-foreground-muted);
  &:hover:not(:disabled) {
    background: var(--ev-color-surface-hover, rgba(255, 255, 255, 0.08));
    color: var(--ev-color-foreground);
  }
}

.ev-confirm-dialog__btn--confirm {
  box-shadow: var(--ev-shadow-sm);
  &:hover:not(:disabled) {
    filter: brightness(1.08);
  }
}
</style>
