<template>
  <PageBase :title="t('accountSettings.title')" icon="settings" content-class="default">
    <div class="account-settings-page">
      <div class="account-settings-page__card ev-glass-card">
        <div class="account-settings-page__accent" aria-hidden="true" />
        <div class="account-settings-page__glow" aria-hidden="true" />
        <section class="account-settings-page__section">
          <div class="account-settings-page__row">
            <div class="account-settings-page__label-wrap">
              <q-icon name="language" class="account-settings-page__icon" size="1.25rem" aria-hidden="true" />
              <span class="account-settings-page__label">{{ t('accountSettings.language') }}</span>
            </div>
            <div class="account-settings-page__lang-wrap">
              <button
                v-for="lang in supportedLanguages"
                :key="lang.value"
                type="button"
                :class="['account-settings-page__lang-btn', { 'account-settings-page__lang-btn--active': currentLanguage === lang.value }]"
                @click="changeLanguage(lang.value)"
              >
                {{ lang.nativeLabel }}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  </PageBase>
</template>

<script setup lang="ts">
import { useI18n } from 'src/utils/i18n/composables';
import { getSupportedLanguages } from 'src/utils/i18n';
import PageBase from 'src/components/PageBase.vue';

const { t, currentLanguage, changeLanguage } = useI18n();
const supportedLanguages = getSupportedLanguages();
</script>

<style lang="scss" scoped>
.account-settings-page {
  max-width: var(--ev-content-max-width-sm);
}

.account-settings-page__card {
  position: relative;
  padding: var(--ev-space-6) var(--ev-space-5);
  border-radius: var(--ev-radius-xl);
  box-shadow: var(--ev-shadow-md);
  overflow: hidden;
  transition: box-shadow var(--ev-transition-base), transform var(--ev-transition-base);
}

.account-settings-page__card:hover {
  box-shadow: var(--ev-shadow-lg), var(--ev-shadow-glow);
  transform: translateY(calc(-1 * var(--ev-button-lift)));
}

@media (prefers-reduced-motion: reduce) {
  .account-settings-page__card:hover {
    transform: none;
  }
}

.account-settings-page__accent {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  border-radius: var(--ev-radius-xl) 0 0 var(--ev-radius-xl);
  background: linear-gradient(180deg,
      var(--ev-color-primary) 0%,
      var(--ev-color-primary-light) 50%,
      var(--ev-color-primary) 100%);
  opacity: 0.85;
  pointer-events: none;
}

.account-settings-page__glow {
  position: absolute;
  right: -15%;
  bottom: -20%;
  width: 60%;
  height: 60%;
  background: radial-gradient(ellipse closest-side,
      var(--ev-color-primary-tint-bg) 0%,
      transparent 70%);
  opacity: 0.5;
  pointer-events: none;
}

.account-settings-page__section {
  position: relative;
  z-index: 1;
}

.account-settings-page__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ev-space-4);
  flex-wrap: wrap;
}

.account-settings-page__label-wrap {
  display: flex;
  align-items: center;
  gap: var(--ev-space-3);
}

.account-settings-page__icon {
  color: var(--ev-color-primary-light);
  flex-shrink: 0;
}

.account-settings-page__label {
  font-size: var(--ev-font-size-sm);
  font-weight: var(--ev-font-weight-medium);
  color: var(--ev-color-foreground-muted);
}

.account-settings-page__lang-wrap {
  display: flex;
  gap: var(--ev-space-1);
}

.account-settings-page__lang-btn {
  font-size: var(--ev-font-size-sm);
  font-weight: var(--ev-font-weight-medium);
  color: var(--ev-color-foreground-muted);
  padding: var(--ev-space-1) var(--ev-space-3);
  border-radius: var(--ev-radius-lg);
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
  transition: color var(--ev-transition-fast), border-color var(--ev-transition-fast), background var(--ev-transition-fast), box-shadow var(--ev-transition-fast);

  &:hover {
    color: var(--ev-color-foreground);
    background: var(--ev-color-surface-hover);
  }

  &.account-settings-page__lang-btn--active {
    color: var(--ev-color-primary-light);
    background: var(--ev-color-primary-tint-bg);
    border-color: var(--ev-color-primary-tint-border);
    box-shadow: var(--ev-nav-active-glow);
  }

  &:focus-visible {
    outline: none;
    box-shadow: var(--ev-focus-ring);
  }
}
</style>
