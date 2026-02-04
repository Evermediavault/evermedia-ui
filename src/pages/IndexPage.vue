<template>
  <PageBase content-class="centered">
    <div class="index-page__welcome ev-glass-card">
      <span class="index-page__badge">{{ t('nav.adminSubtitle') }}</span>
      <h1 class="index-page__title">{{ t('nav.appTitle') }}</h1>
      <p class="index-page__subtitle">{{ t('nav.home') }}</p>
      <div class="index-page__divider" />
      <p class="index-page__desc">{{ t('nav.welcomeDesc') }}</p>
    </div>
  </PageBase>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import PageBase from 'src/components/PageBase.vue';

const { t } = useI18n();
</script>

<style lang="scss" scoped>
.index-page__welcome {
  padding: var(--ev-space-10) var(--ev-space-10) var(--ev-space-12);
  border-radius: var(--ev-radius-xl);
  text-align: center;
  box-shadow: var(--ev-shadow-lg);
  max-width: var(--ev-login-card-max-width);
  transition: box-shadow var(--ev-transition-base), transform var(--ev-transition-base);
}
.index-page__welcome:hover {
  box-shadow: var(--ev-shadow-lg), var(--ev-shadow-glow);
  transform: translateY(calc(-1 * var(--ev-button-lift)));
}
@media (prefers-reduced-motion: reduce) {
  .index-page__welcome:hover {
    transform: none;
  }
}

.index-page__badge {
  display: inline-block;
  padding: var(--ev-space-2) var(--ev-space-4);
  font-size: var(--ev-font-size-xs);
  font-weight: var(--ev-font-weight-medium);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--ev-color-primary-light);
  background: var(--ev-color-primary-tint-bg);
  border: 1px solid var(--ev-color-primary-tint-border);
  border-radius: var(--ev-radius-md);
  margin-bottom: var(--ev-space-5);
}

.index-page__title {
  margin: 0 0 var(--ev-space-3);
  font-size: var(--ev-title-display-size);
  font-weight: var(--ev-font-weight-semibold);
  letter-spacing: 0.04em;
  line-height: var(--ev-line-height-tight);
  background: linear-gradient(135deg, var(--ev-color-primary) 0%, var(--ev-color-primary-light) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 0 12px var(--ev-color-primary-tint-bg));
}

.index-page__subtitle {
  margin: 0;
  font-size: var(--ev-font-size-base);
  color: var(--ev-color-foreground-muted);
}

.index-page__divider {
  margin: var(--ev-space-6) 0 var(--ev-space-6);
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--ev-color-border) 30%,
    var(--ev-color-primary-tint-border) 50%,
    var(--ev-color-border) 70%,
    transparent 100%
  );
}

.index-page__desc {
  margin: 0;
  padding: 0 var(--ev-space-2);
  font-size: var(--ev-font-size-sm);
  line-height: var(--ev-line-height-relaxed);
  color: var(--ev-color-foreground-subtle);
}
</style>
