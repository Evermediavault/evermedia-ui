<template>
  <PageBase content-class="full">
    <div class="index-page__welcome ev-glass-card">
      <div class="index-page__welcome-accent" aria-hidden="true" />
      <div class="index-page__welcome-glow" aria-hidden="true" />
      <span class="index-page__badge">{{ t('nav.adminSubtitle') }}</span>
      <h1 class="index-page__title">{{ t('nav.appTitle') }}</h1>
      <p class="index-page__subtitle">{{ t('nav.home') }}</p>
      <div class="index-page__divider" />
      <p class="index-page__desc">{{ t('nav.welcomeDesc') }}</p>
    </div>
    <section v-if="wallet" class="index-page__wallet-section">
      <div class="index-page__wallet-card">
        <div class="index-page__wallet-card-glow" aria-hidden="true" />
        <div class="index-page__wallet-card-inner">
          <header class="index-page__wallet-header">
            <div class="index-page__wallet-title-wrap">
              <span class="index-page__wallet-icon-wrap">
                <q-icon name="account_balance_wallet" class="index-page__wallet-icon" aria-hidden="true" />
              </span>
              <h2 class="index-page__wallet-title">{{ t('indexPage.synapseWallet.title') }}</h2>
            </div>
            <span class="index-page__wallet-network">{{ wallet.network }}</span>
          </header>
          <div class="index-page__wallet-main">
            <span class="index-page__wallet-main-value">
              {{ formatWei(wallet.payments_available_funds_wei) }}
              <span class="index-page__wallet-main-unit">USDFC</span>
            </span>
          </div>
          <div class="index-page__wallet-divider" />
          <div class="index-page__wallet-details">
            <div class="index-page__wallet-detail">
              <span class="index-page__wallet-detail-key">{{ t('indexPage.synapseWallet.walletFil') }}</span>
              <span class="index-page__wallet-detail-val">{{ formatWei(wallet.wallet_fil_wei) }} FIL</span>
            </div>
            <div class="index-page__wallet-detail">
              <span class="index-page__wallet-detail-key">{{ t('indexPage.synapseWallet.walletUsdfc') }}</span>
              <span class="index-page__wallet-detail-val">{{ formatWei(wallet.wallet_usdfc_wei) }} USDFC</span>
            </div>
          </div>
          <footer class="index-page__wallet-footer">
            <q-btn
              unelevated
              no-caps
              color="primary"
              class="ev-btn-primary index-page__wallet-recharge-btn"
              :label="t('indexPage.synapseWallet.recharge')"
              @click="showRechargeModal = true"
            />
          </footer>
        </div>
      </div>
    </section>

    <div class="index-page__stats">
      <div v-for="item in statItems" :key="item.key" class="index-page__stat-card ev-glass-card">
        <div class="index-page__stat-accent" aria-hidden="true" />
        <div class="index-page__stat-glow" aria-hidden="true" />
        <div class="index-page__stat-icon-wrap">
          <q-icon :name="item.icon" class="index-page__stat-icon" aria-hidden="true" />
        </div>
        <span class="index-page__stat-value">{{ item.value }}</span>
        <span class="index-page__stat-label">{{ item.label }}</span>
      </div>
    </div>


    <EvModal
      v-model="showRechargeModal"
      :title="t('indexPage.synapseWallet.rechargeModalTitle')"
      persistent
      max-width="28rem"
      @close="resetRechargeForm"
    >
      <q-form ref="rechargeFormRef" class="index-page__recharge-form ev-field-theme" @submit.prevent="onSubmitRecharge">
        <q-input
          v-model="rechargeAmount"
          outlined
          dark
          type="text"
          inputmode="decimal"
          :label="t('indexPage.synapseWallet.rechargeAmountLabel')"
          :placeholder="t('indexPage.synapseWallet.rechargeAmountPlaceholder')"
          hide-bottom-space
          class="index-page__recharge-field"
          :disabled="rechargeSubmitting"
          :rules="[rechargeAmountRule]"
        />
      </q-form>
      <template #actions>
        <q-btn flat no-caps :label="t('common.cancel')" color="grey" @click="showRechargeModal = false" />
        <q-btn
          unelevated
          no-caps
          color="primary"
          class="ev-btn-primary"
          :label="t('indexPage.synapseWallet.recharge')"
          :loading="rechargeSubmitting"
          :disable="rechargeSubmitting"
          @click="onSubmitRecharge"
        />
      </template>
    </EvModal>

    <q-inner-loading :showing="loading || walletLoading" color="primary" class="index-page__loading" />
  </PageBase>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { computed, ref } from 'vue';
import PageBase from 'src/components/PageBase.vue';
import EvModal from 'src/components/EvModal.vue';
import { useDashboardStats } from 'src/composables/useDashboardStats';
import { useSynapseWallet, formatWei } from 'src/composables/useSynapseWallet';
import { useNotify } from 'src/utils/notify';
import { handleAxiosError } from 'src/utils/error';

const { t } = useI18n();
const notify = useNotify();
const { stats, loading } = useDashboardStats();
const { wallet, loading: walletLoading, approveDeposit } = useSynapseWallet();

const showRechargeModal = ref(false);
const rechargeAmount = ref('');
const rechargeSubmitting = ref(false);
const rechargeFormRef = ref<{ validate: (value?: boolean) => Promise<boolean>; resetValidation: () => void } | null>(null);

const rechargeAmountRule = (v: string) => {
  if (v == null || v.trim() === '') return true;
  return /^\d+(\.\d+)?$/.test(v.trim()) && Number(v.trim()) > 0 || t('validation.positive');
};

function resetRechargeForm() {
  rechargeAmount.value = '';
  rechargeFormRef.value?.resetValidation();
}

async function onSubmitRecharge() {
  const valid = await rechargeFormRef.value?.validate(true);
  if (!valid) return;
  rechargeSubmitting.value = true;
  try {
    await approveDeposit(rechargeAmount.value.trim() || undefined);
    notify.success(t('indexPage.synapseWallet.rechargeSuccess'));
    showRechargeModal.value = false;
    resetRechargeForm();
  } catch (e) {
    const appErr = handleAxiosError(e);
    notify.error(appErr.message);
  } finally {
    rechargeSubmitting.value = false;
  }
}

const statItems = computed(() => {
  const s = stats.value;
  return [
    {
      key: 'files',
      icon: 'description',
      label: t('indexPage.stats.files'),
      value: s ? String(s.file_count) : '—',
    },
    {
      key: 'users',
      icon: 'people',
      label: t('indexPage.stats.users'),
      value: s && s.user_count !== undefined ? String(s.user_count) : '—',
    },
    {
      key: 'categories',
      icon: 'category',
      label: t('indexPage.stats.categories'),
      value: s ? String(s.category_count) : '—',
    },
  ];
});
</script>

<style lang="scss" scoped>
// ---------- 欢迎卡 ----------
.index-page__welcome {
  position: relative;
  padding: var(--ev-space-10) var(--ev-space-10) var(--ev-space-12);
  border-radius: var(--ev-radius-xl);
  text-align: center;
  box-shadow: var(--ev-shadow-lg);
  overflow: hidden;
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

.index-page__welcome-accent {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  border-radius: var(--ev-radius-xl) var(--ev-radius-xl) 0 0;
  background: linear-gradient(90deg,
      transparent 0%,
      var(--ev-color-primary) 20%,
      var(--ev-color-primary-light) 50%,
      var(--ev-color-primary) 80%,
      transparent 100%);
  opacity: 0.9;
  pointer-events: none;
}

.index-page__welcome-glow {
  position: absolute;
  right: -10%;
  top: -20%;
  width: 50%;
  height: 60%;
  background: radial-gradient(ellipse closest-side,
      var(--ev-color-primary-tint-bg) 0%,
      transparent 70%);
  opacity: 0.7;
  pointer-events: none;
}

.index-page__badge {
  position: relative;
  z-index: 1;
  display: inline-block;
  padding: var(--ev-space-2) var(--ev-space-4);
  font-size: var(--ev-font-size-xs);
  font-weight: var(--ev-font-weight-semibold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ev-color-primary-light);
  background: linear-gradient(135deg,
      var(--ev-color-primary-tint-bg) 0%,
      var(--ev-color-primary-tint-bg-subtle) 100%);
  border: 1px solid var(--ev-color-primary-tint-border);
  border-radius: var(--ev-radius-md);
  margin-bottom: var(--ev-space-5);
  box-shadow: 0 0 var(--ev-glow-size-sm) var(--ev-glow-opacity-subtle) var(--ev-color-primary-tint-border);
}

.index-page__title {
  position: relative;
  z-index: 1;
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
  position: relative;
  z-index: 1;
  margin: 0;
  font-size: var(--ev-font-size-base);
  color: var(--ev-color-foreground-muted);
}

.index-page__divider {
  position: relative;
  z-index: 1;
  margin: var(--ev-space-6) 0 var(--ev-space-6);
  height: 1px;
  background: linear-gradient(90deg,
      transparent 0%,
      var(--ev-color-border-strong) 25%,
      var(--ev-color-primary-tint-border) 50%,
      var(--ev-color-border-strong) 75%,
      transparent 100%);
}

.index-page__desc {
  position: relative;
  z-index: 1;
  margin: 0;
  padding: 0 var(--ev-space-2);
  font-size: var(--ev-font-size-sm);
  line-height: var(--ev-line-height-relaxed);
  color: var(--ev-color-foreground-subtle);
}

// ---------- 统计卡片 ----------
.index-page__stats {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--ev-space-6);
  margin-top: var(--ev-space-8);
  position: relative;
}

.index-page__stat-card {
  position: relative;
  padding: var(--ev-space-6) var(--ev-space-5);
  border-radius: var(--ev-radius-xl);
  box-shadow: var(--ev-shadow-md);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--ev-space-4);
  text-align: left;
  overflow: hidden;
  transition: box-shadow var(--ev-transition-base), transform var(--ev-transition-base);
}

.index-page__stat-card:hover {
  box-shadow: var(--ev-shadow-lg), var(--ev-shadow-glow);
  transform: translateY(calc(-1 * var(--ev-button-lift)));
}

@media (prefers-reduced-motion: reduce) {
  .index-page__stat-card:hover {
    transform: none;
  }
}

.index-page__stat-accent {
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

.index-page__stat-glow {
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

.index-page__stat-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--ev-radius-lg);
  background: linear-gradient(135deg,
      var(--ev-color-primary-tint-bg) 0%,
      var(--ev-color-primary-tint-border) 100%);
  border: 1px solid var(--ev-color-primary-tint-border);
  box-shadow:
    0 0 0 1px var(--ev-color-primary-tint-border),
    0 0 var(--ev-glow-size-sm) var(--ev-glow-opacity-subtle) var(--ev-color-primary-tint-bg);
}

.index-page__stat-icon {
  font-size: var(--ev-nav-icon-inner);
  width: var(--ev-nav-icon-inner);
  height: var(--ev-nav-icon-inner);
  color: var(--ev-color-primary-light);
}

.index-page__stat-value {
  position: relative;
  z-index: 1;
  font-size: var(--ev-font-size-2xl);
  font-weight: var(--ev-font-weight-bold);
  line-height: var(--ev-line-height-tight);
  letter-spacing: 0.02em;
  color: var(--ev-color-foreground);
}

.index-page__stat-label {
  position: relative;
  z-index: 1;
  font-size: var(--ev-font-size-sm);
  font-weight: var(--ev-font-weight-medium);
  color: var(--ev-color-foreground-muted);
  letter-spacing: 0.02em;
}

// Synapse 钱包：单独区块，置于统计卡片下方
.index-page__wallet-section {
  margin-top: var(--ev-space-8);
  width: 100%;
  max-width: 28rem;
}

.index-page__wallet-card {
  position: relative;
  border-radius: var(--ev-radius-xl);
  padding: 1px;
  background: var(--ev-card-border-gradient);
  box-shadow:
    var(--ev-shadow-lg),
    0 0 var(--ev-glow-size-lg) var(--ev-glow-opacity-subtle) var(--ev-color-primary-tint-bg);
  transition: box-shadow var(--ev-transition-base), transform var(--ev-transition-base);
  overflow: hidden;
}

.index-page__wallet-card:hover {
  box-shadow:
    var(--ev-shadow-lg),
    var(--ev-shadow-glow),
    0 0 var(--ev-glow-size-lg) var(--ev-glow-opacity) var(--ev-color-primary-tint-bg);
  transform: translateY(calc(-1 * var(--ev-button-lift)));
}

@media (prefers-reduced-motion: reduce) {
  .index-page__wallet-card:hover {
    transform: none;
  }
}

.index-page__wallet-card-glow {
  position: absolute;
  right: -20%;
  bottom: -30%;
  width: 80%;
  height: 80%;
  background: radial-gradient(ellipse closest-side,
      var(--ev-color-primary-tint-bg) 0%,
      transparent 70%);
  opacity: 0.6;
  pointer-events: none;
}

.index-page__wallet-card-inner {
  position: relative;
  z-index: 1;
  padding: var(--ev-space-6) var(--ev-space-6) var(--ev-space-5);
  border-radius: calc(var(--ev-radius-xl) - 1px);
  background: linear-gradient(152deg,
      var(--ev-glass-bg) 0%,
      var(--ev-color-primary-tint-bg-subtle) 45%,
      var(--ev-glass-bg) 100%);
  backdrop-filter: blur(var(--ev-glass-blur));
  -webkit-backdrop-filter: blur(var(--ev-glass-blur));
  display: flex;
  flex-direction: column;
  align-items: stretch;
  text-align: left;
}

.index-page__wallet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ev-space-3);
  margin-bottom: var(--ev-space-4);
}

.index-page__wallet-title-wrap {
  display: flex;
  align-items: center;
  gap: var(--ev-space-3);
}

.index-page__wallet-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: var(--ev-radius-md);
  background: linear-gradient(135deg,
      var(--ev-color-primary-tint-bg) 0%,
      var(--ev-color-primary-tint-border) 100%);
  box-shadow:
    0 0 0 1px var(--ev-color-primary-tint-border),
    0 0 var(--ev-glow-size-sm) var(--ev-glow-opacity-subtle) var(--ev-color-primary-light);
}

.index-page__wallet-icon {
  font-size: 1.25rem;
  width: 1.25rem;
  height: 1.25rem;
  color: var(--ev-color-primary-light);
  flex-shrink: 0;
}

.index-page__wallet-title {
  margin: 0;
  font-size: var(--ev-font-size-lg);
  font-weight: var(--ev-font-weight-semibold);
  letter-spacing: 0.02em;
  background: linear-gradient(135deg,
      var(--ev-color-foreground) 0%,
      var(--ev-color-foreground-muted) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: var(--ev-line-height-tight);
}

.index-page__wallet-network {
  font-size: var(--ev-font-size-xs);
  font-weight: var(--ev-font-weight-semibold);
  padding: var(--ev-space-2) var(--ev-space-4);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--ev-color-primary-light);
  background: linear-gradient(135deg,
      var(--ev-color-primary-tint-bg) 0%,
      transparent 100%);
  border: 1px solid var(--ev-color-primary-tint-border);
  border-radius: var(--ev-radius-lg);
  box-shadow: 0 0 var(--ev-glow-size-sm) var(--ev-glow-opacity-subtle) var(--ev-color-primary-tint-border);
}

.index-page__wallet-main {
  display: block;
}

.index-page__wallet-main-value {
  font-size: clamp(1.75rem, 4vw, 2.25rem);
  font-weight: var(--ev-font-weight-bold);
  line-height: var(--ev-line-height-tight);
  letter-spacing: 0.02em;
  background: linear-gradient(135deg,
      var(--ev-color-primary-light) 0%,
      var(--ev-color-primary) 50%,
      var(--ev-color-primary-light) 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 0 12px var(--ev-color-primary-tint-bg)) drop-shadow(0 0 24px var(--ev-glow-opacity-subtle) var(--ev-color-primary-light));
}

@media (prefers-reduced-motion: no-preference) {
  .index-page__wallet-main-value {
    animation: index-page__wallet-value-shine 6s ease-in-out infinite;
  }
}

@keyframes index-page__wallet-value-shine {

  0%,
  100% {
    background-position: 0% center;
  }

  50% {
    background-position: 100% center;
  }
}

.index-page__wallet-main-unit {
  font-size: var(--ev-font-size-base);
  font-weight: var(--ev-font-weight-medium);
  margin-left: var(--ev-space-2);
  color: var(--ev-color-foreground-muted);
  -webkit-text-fill-color: var(--ev-color-foreground-muted);
  background: none;
  filter: none;
}

.index-page__wallet-divider {
  height: 1px;
  margin: var(--ev-space-4) 0;
  background: linear-gradient(90deg,
      transparent 0%,
      var(--ev-color-primary-tint-border) 20%,
      var(--ev-color-border-strong) 50%,
      var(--ev-color-primary-tint-border) 80%,
      transparent 100%);
  opacity: 0.9;
}

.index-page__wallet-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--ev-space-3) var(--ev-space-6);
}

.index-page__wallet-detail {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: var(--ev-space-2);
  font-size: var(--ev-font-size-sm);
  padding: var(--ev-space-2) var(--ev-space-3);
  border-radius: var(--ev-radius-md);
  background: var(--ev-color-primary-tint-bg-subtle);
  border: 1px solid transparent;
  transition: border-color var(--ev-transition-fast), box-shadow var(--ev-transition-fast);
}

.index-page__wallet-detail:hover {
  border-color: var(--ev-color-primary-tint-border);
  box-shadow: 0 0 var(--ev-glow-size-sm) var(--ev-glow-opacity-subtle) var(--ev-color-primary-tint-border);
}

.index-page__wallet-detail-key {
  color: var(--ev-color-foreground-muted);
  flex-shrink: 0;
}

.index-page__wallet-detail-val {
  color: var(--ev-color-foreground);
  font-weight: var(--ev-font-weight-semibold);
}

.index-page__wallet-footer {
  margin-top: var(--ev-space-4);
  padding-top: var(--ev-space-4);
  border-top: 1px solid var(--ev-color-border);
}

.index-page__wallet-recharge-btn {
  width: 100%;
}

.index-page__recharge-form {
  padding: 0;
}

.index-page__recharge-field {
  margin-bottom: var(--ev-space-4);
}

.index-page__loading {
  background: transparent !important;
}

@media (max-width: 640px) {
  .index-page__stats {
    grid-template-columns: 1fr;
  }

  .index-page__wallet-details {
    grid-template-columns: 1fr;
  }
}
</style>
