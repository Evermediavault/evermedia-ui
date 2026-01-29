<template>
  <PageBase :title="t('upload.title')" icon="cloud_upload" content-class="full">
    <div class="upload-page">
      <p class="upload-page__hint">{{ t('upload.hint') }}</p>

      <div class="upload-page__card ev-glass-card ev-scrollbar upload-page__card--active">
        <div v-if="uppy" class="upload-page__dashboard">
          <Dashboard :uppy="uppy" :props="dashboardProps" />
        </div>
      </div>
    </div>
  </PageBase>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';
import Dashboard from '@uppy/vue/dashboard';
import PageBase from 'src/components/PageBase.vue';
import { useUppy } from 'src/composables/uppy';

import '@uppy/dashboard/css/style.min.css';

const { t } = useI18n();
const { uppy } = useUppy({ limit: 4 });

const dashboardProps = computed(() => ({
  inline: true,
  width: '100%',
  height: 480,
  theme: 'dark' as const,
  showProgressDetails: true,
  proudlyDisplayPoweredByUppy: false,
}));
</script>

<style lang="scss" scoped>
@use '../css/uppy-theme.scss' as uppy;

.upload-page {
  display: flex;
  flex-direction: column;
  gap: var(--ev-space-6);
  min-height: 0;
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
