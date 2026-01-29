<template>
  <q-page class="page-base" :class="contentClass">
    <header v-if="hasHeader" class="page-base__header">
      <div class="page-base__title-wrap">
        <h1 class="page-base__title">
          <slot name="title">{{ title }}</slot>
        </h1>
        <p v-if="hasSubtitle" class="page-base__subtitle">
          <slot name="subtitle">{{ subtitle }}</slot>
        </p>
      </div>
      <div v-if="$slots.actions" class="page-base__actions">
        <slot name="actions" />
      </div>
    </header>
    <div class="page-base__body">
      <slot />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance } from 'vue';

const props = withDefaults(
  defineProps<{
    /** 页面标题（也可用 #title 插槽） */
    title?: string;
    /** 副标题（也可用 #subtitle 插槽） */
    subtitle?: string;
    /** 内容区布局：默认 | 居中 | 填满 */
    contentClass?: 'default' | 'centered' | 'full';
  }>(),
  {
    title: '',
    subtitle: '',
    contentClass: 'default',
  }
);

const inst = getCurrentInstance();

const hasHeader = computed(
  () =>
    !!props.title ||
    !!props.subtitle ||
    !!inst?.slots?.title ||
    !!inst?.slots?.subtitle ||
    !!inst?.slots?.actions
);

const hasSubtitle = computed(
  () => props.subtitle !== '' || !!inst?.slots?.subtitle
);
</script>

<style lang="scss" scoped>
.page-base {
  background: transparent;
}

.page-base__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--ev-space-4);
  margin-bottom: var(--ev-space-6);
  flex-wrap: wrap;
}

.page-base__title-wrap {
  min-width: 0;
}

.page-base__title {
  margin: 0 0 var(--ev-space-1);
  font-size: var(--ev-font-size-2xl);
  font-weight: var(--ev-font-weight-semibold);
  letter-spacing: 0.04em;
  background: linear-gradient(135deg, var(--ev-color-primary) 0%, var(--ev-color-primary-light) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  transition: filter var(--ev-transition-fast);
}

.page-base__subtitle {
  margin: 0;
  font-size: var(--ev-font-size-base);
  color: var(--ev-color-foreground-muted);
}

.page-base__actions {
  flex-shrink: 0;
}

.page-base__body {
  min-height: 0;
}

/* 内容区布局变体 */
.page-base.centered .page-base__body {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.page-base.full .page-base__body {
  min-height: 60vh;
}
</style>
