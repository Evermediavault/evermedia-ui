<template>
  <div class="error-page">
    <div class="error-page__content ev-glass-card">
      <div class="error-page__code" aria-hidden="true">404</div>
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
  padding: var(--ev-space-6);
}

.error-page__content {
  text-align: center;
  padding: var(--ev-space-10) var(--ev-space-10) var(--ev-space-12);
  border-radius: var(--ev-radius-xl);
  max-width: 28rem;
}

.error-page__code {
  font-size: clamp(4rem, 14vh, 8rem);
  font-weight: var(--ev-font-weight-bold);
  line-height: 1;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, var(--ev-color-primary) 0%, var(--ev-color-primary-light) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  opacity: 0.4;
}

.error-page__text {
  margin: var(--ev-space-4) 0 var(--ev-space-10);
  padding: 0 var(--ev-space-4);
  font-size: var(--ev-font-size-lg);
  color: var(--ev-color-foreground-muted);
  line-height: var(--ev-line-height-relaxed);
}

.error-page__btn {
  margin-top: var(--ev-space-2);
}
.error-page__btn:focus-visible {
  outline: none;
  box-shadow: var(--ev-shadow-primary), var(--ev-focus-ring);
}
</style>
