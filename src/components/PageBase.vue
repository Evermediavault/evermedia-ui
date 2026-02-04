<template>
  <q-page class="page-base" :class="contentClass">
    <div class="page-base__inner">
      <header v-if="hasHeader" class="page-base__header">
        <div class="page-base__title-block">
          <div v-if="hasIcon" class="page-base__icon-wrap" aria-hidden="true">
            <slot name="icon">
              <q-icon v-if="icon" :name="icon" class="page-base__icon" size="var(--ev-title-icon-size)" />
            </slot>
          </div>
          <div class="page-base__title-text">
            <h1 class="page-base__title">
              <slot name="title">{{ title }}</slot>
            </h1>
          </div>
        </div>
        <div v-if="$slots.actions" class="page-base__actions">
          <slot name="actions" />
        </div>
      </header>
      <div v-if="hasHeader && $slots.default" class="page-base__divider" aria-hidden="true" />
      <main ref="bodyRef" class="page-base__body">
        <q-scroll-area class="page-base__scroll ev-scrollbar" :style="{ height: scrollHeightPx }">
          <div class="page-base__content">
            <slot />
          </div>
        </q-scroll-area>
      </main>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, ref, onMounted, onUnmounted } from 'vue';

const props = withDefaults(
  defineProps<{
    /** 页面标题（也可用 #title 插槽） */
    title?: string;
    /** 标题左侧图标（Quasar 图标名，也可用 #icon 插槽） */
    icon?: string;
    /** 内容区布局：默认 | 居中 | 填满 */
    contentClass?: 'default' | 'centered' | 'full';
  }>(),
  {
    title: '',
    icon: '',
    contentClass: 'default',
  }
);

const inst = getCurrentInstance();

const hasHeader = computed(
  () =>
    !!props.title ||
    !!inst?.slots?.title ||
    !!inst?.slots?.actions
);

const hasIcon = computed(
  () => !!props.icon || !!inst?.slots?.icon
);

const bodyRef = ref<HTMLElement | null>(null);
const scrollHeightPx = ref('0px');

function setScrollHeight() {
  if (!bodyRef.value) return;
  scrollHeightPx.value = `${bodyRef.value.clientHeight}px`;
}

let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  setScrollHeight();
  if (bodyRef.value) {
    resizeObserver = new ResizeObserver(setScrollHeight);
    resizeObserver.observe(bodyRef.value);
  }
});

onUnmounted(() => {
  resizeObserver?.disconnect();
});
</script>

<style lang="scss" scoped>
.page-base {
  background: transparent;
  padding: 0;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.page-base__inner {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.page-base__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--ev-space-6);
  padding: var(--ev-space-6) var(--ev-space-6) var(--ev-space-4);
  flex-wrap: wrap;
  flex-shrink: 0;
}

.page-base__title-block {
  min-width: 0;
  display: flex;
  align-items: flex-start;
  gap: var(--ev-space-4);
}

.page-base__icon-wrap {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--ev-nav-icon-size);
  height: var(--ev-nav-icon-size);
  border-radius: var(--ev-radius-md);
  background: var(--ev-color-primary-tint-bg);
  border: 1px solid var(--ev-color-primary-tint-border);
  color: var(--ev-color-primary-light);
}

.page-base__icon {
  color: inherit;
}

.page-base__title-text {
  min-width: 0;
}

.page-base__title {
  margin: 0;
  font-size: var(--ev-title-display-size);
  font-weight: var(--ev-font-weight-semibold);
  letter-spacing: 0.03em;
  line-height: var(--ev-line-height-tight);
  background: linear-gradient(135deg,
      var(--ev-color-primary) 0%,
      var(--ev-color-primary-light) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 0 12px var(--ev-color-primary-tint-bg));
}

.page-base__actions {
  flex-shrink: 0;
  align-self: center;
}

.page-base__divider {
  margin: 0 var(--ev-space-6) var(--ev-space-6);
  height: 1px;
  flex-shrink: 0;
  background: linear-gradient(90deg,
      transparent 0%,
      var(--ev-color-border) 30%,
      var(--ev-color-primary-tint-border) 50%,
      var(--ev-color-border) 70%,
      transparent 100%);
}

.page-base__body {
  flex: 1;
  min-height: 0;

  .page-base__content {
    padding: var(--ev-space-6) var(--ev-space-6) var(--ev-space-10);
  }
}

.page-base__scroll {
  display: block;
}

:deep(.page-base__scroll .q-scrollarea__content) {
  overflow-x: auto;
  overflow-y: scroll;
}

.page-base.centered .page-base__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.page-base.full .page-base__inner {
  min-height: 60vh;
}
</style>
