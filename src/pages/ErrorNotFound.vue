<template>
  <div class="error-page">
    <div class="error-page__content">
      <div class="error-page__code">404</div>
      <p class="error-page__text">{{ t('error.notFound') }}</p>
      <q-btn
        unelevated
        no-caps
        class="ev-btn-primary error-page__btn"
        :label="t('nav.home')"
        to="/"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<style lang="scss" scoped>
.error-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ev-color-background);
  padding: var(--ev-space-4);
}

.error-page__content {
  text-align: center;
}

.error-page__code {
  font-size: clamp(5rem, 18vh, 10rem);
  font-weight: var(--ev-font-weight-bold);
  line-height: 1;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, var(--ev-color-primary) 0%, var(--ev-color-primary-light) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  opacity: 0.35;
}

.error-page__text {
  margin: var(--ev-space-4) 0 var(--ev-space-8);
  font-size: var(--ev-font-size-lg);
  color: var(--ev-color-foreground-muted);
}

.error-page__btn {
  margin-top: var(--ev-space-4);
}
</style>
