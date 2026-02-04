<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    :persistent="persistent"
    :maximized="maximized"
    :transition-show="transitionShow"
    :transition-hide="transitionHide"
    class="ev-modal"
    content-class="ev-modal__content"
    @hide="emit('close')"
  >
    <div class="ev-modal__card" :style="contentStyle">
      <div class="ev-modal__card-glow" aria-hidden="true" />
      <div class="ev-modal__card-border" aria-hidden="true" />
      <header v-if="$slots.title || title" class="ev-modal__header">
        <div class="ev-modal__header-accent" aria-hidden="true" />
        <slot name="title">
          <h2 class="ev-modal__title">{{ title }}</h2>
        </slot>
      </header>
      <div v-if="$slots.default" class="ev-modal__body">
        <div class="ev-modal__body-bg" aria-hidden="true" />
        <div class="ev-modal__body-inner">
          <slot />
        </div>
      </div>
      <footer v-if="$slots.actions" class="ev-modal__actions">
        <slot name="actions" />
      </footer>
    </div>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    /** v-model 控制显隐 */
    modelValue: boolean;
    /** 标题（也可用 #title 插槽） */
    title?: string;
    /** 点击遮罩不关闭 */
    persistent?: boolean;
    /** 全屏 */
    maximized?: boolean;
    /** 内容区最大宽度（如 28rem） */
    maxWidth?: string;
    transitionShow?: string;
    transitionHide?: string;
  }>(),
  { persistent: false, maximized: false }
);

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  close: [];
}>();

const contentStyle = computed(() =>
  props.maxWidth ? { maxWidth: props.maxWidth } : {}
);
</script>

<style lang="scss" scoped>
.ev-modal {
  :deep(.q-dialog__backdrop) {
    background: var(--ev-modal-backdrop);
    backdrop-filter: blur(var(--ev-glass-blur));
    -webkit-backdrop-filter: blur(var(--ev-glass-blur));
    z-index: calc(var(--ev-z-modal) - 1);
    transition: opacity var(--ev-transition-base);
  }

  :deep(.q-dialog__inner) {
    z-index: var(--ev-z-modal);
  }
}

.ev-modal__content {
  padding: var(--ev-space-6);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
}

.ev-modal__card {
  position: relative;
  width: 100%;
  max-height: min(90vh, var(--ev-dashboard-max-height));
  display: flex;
  flex-direction: column;
  border-radius: var(--ev-radius-xl);
  overflow: hidden;
  background: var(--ev-glass-bg);
  backdrop-filter: blur(var(--ev-glass-blur));
  -webkit-backdrop-filter: blur(var(--ev-glass-blur));
  border: 1px solid var(--ev-glass-border-subtle);
  box-shadow:
    var(--ev-shadow-lg),
    0 0 0 1px rgba(255, 255, 255, 0.04) inset,
    var(--ev-shadow-modal-card);
  transition: box-shadow var(--ev-transition-base);
  animation: ev-modal-card-in var(--ev-transition-base) cubic-bezier(0.34, 1.2, 0.64, 1) forwards;
}

@media (prefers-reduced-motion: reduce) {
  .ev-modal__card {
    animation: none;
  }
}

@keyframes ev-modal-card-in {
  from {
    opacity: 0;
    transform: scale(0.97);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.ev-modal__card-glow {
  position: absolute;
  inset: -40%;
  pointer-events: none;
  background: radial-gradient(
    ellipse 70% 50% at 50% -20%,
    var(--ev-color-primary-tint-bg) 0%,
    transparent 55%
  );
  opacity: 0.6;
}

.ev-modal__card-border {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: var(--ev-card-border-gradient);
  -webkit-mask:
    linear-gradient(var(--ev-mask-light) 0 0) content-box,
    linear-gradient(var(--ev-mask-light) 0 0);
  mask:
    linear-gradient(var(--ev-mask-light) 0 0) content-box,
    linear-gradient(var(--ev-mask-light) 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
  opacity: 0.9;
}

.ev-modal__header {
  position: relative;
  flex-shrink: 0;
  padding: var(--ev-space-6) var(--ev-space-6) var(--ev-space-5);
  border-bottom: 1px solid transparent;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.03) 0%,
    transparent 100%
  );
}

.ev-modal__header-accent {
  position: absolute;
  left: 0;
  top: var(--ev-space-4);
  bottom: var(--ev-space-4);
  width: var(--ev-nav-indicator-width);
  border-radius: var(--ev-radius-indicator);
  background: linear-gradient(
    180deg,
    var(--ev-color-primary) 0%,
    var(--ev-color-primary-light) 50%,
    var(--ev-color-accent) 100%
  );
  box-shadow: 0 0 12px var(--ev-color-primary-tint-border);
}

.ev-modal__title {
  margin: 0;
  padding-left: var(--ev-space-4);
  font-size: var(--ev-font-size-xl);
  font-weight: var(--ev-font-weight-semibold);
  letter-spacing: 0.04em;
  line-height: var(--ev-line-height-tight);
  background: linear-gradient(
    135deg,
    var(--ev-color-primary) 0%,
    var(--ev-color-primary-light) 50%,
    var(--ev-color-foreground) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 0 20px var(--ev-color-primary-tint-bg));
}

.ev-modal__body {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: var(--ev-space-6);
}

.ev-modal__body-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: var(--ev-grid-size) var(--ev-grid-size);
  opacity: 0.8;
}

.ev-modal__body-inner {
  position: relative;
  z-index: 1;
}

.ev-modal__actions {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--ev-space-4);
  padding: var(--ev-space-5) var(--ev-space-6);
  border-top: 1px solid var(--ev-color-border);
  background: linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.15) 0%,
    transparent 100%
  );
}
</style>
