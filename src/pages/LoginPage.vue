<template>
  <div class="login-page">
    <header class="login-page__header">
      <q-img src="/logo.png" height="80px" width="80px" />
      <h1 class="login-page__title">{{ t('nav.appTitle') }}</h1>
      <div class="login-page__divider" />
    </header>

    <q-form class="login-page__form ev-field-theme" @submit.prevent="onSubmit">
      <q-input v-model="username" outlined :label="t('auth.usernameOrEmail')" class="login-page__field"
        :rules="[(v: string) => !!v || t('common.required')]" hide-bottom-space dark :disabled="loading" />
      <q-input v-model="password" outlined type="password" :label="t('auth.password')" class="login-page__field"
        :rules="[(v: string) => !!v || t('common.required')]" hide-bottom-space dark :disabled="loading" />
      <q-btn type="submit" color="primary" unelevated no-caps class="ev-btn-primary login-page__submit"
        :label="t('auth.login')" :loading="loading" :disable="loading" />
    </q-form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from 'src/stores/auth-store';
import { handleAxiosError } from 'src/utils/error/handler';
import { useNotify } from 'src/utils/notify';

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const notify = useNotify();
const authStore = useAuthStore();

const username = ref('');
const password = ref('');
const loading = ref(false);

const redirectTo = computed(() => {
  const r = route.query.redirect;
  return typeof r === 'string' && r && r !== '/login' ? r : '/';
});

async function onSubmit() {
  const u = username.value.trim();
  const p = password.value;
  if (!u || !p) return;
  loading.value = true;
  try {
    await authStore.login(u, p);
    notify.success(t('success.login'));
    await router.push(redirectTo.value);
  } catch (err) {
    const appErr = handleAxiosError(err);
    notify.error(appErr.message);
  } finally {
    loading.value = false;
  }
}
</script>

<style lang="scss" scoped>
.login-page {
  text-align: center;
  padding: var(--ev-space-2) 0 0;
}

.login-page__header {
  margin-bottom: var(--ev-space-8);
  padding: 0 var(--ev-space-4);
}

.login-page__title {
  margin: 0 0 var(--ev-space-2);
  font-size: var(--ev-title-display-size);
  font-weight: var(--ev-font-weight-semibold);
  letter-spacing: 0.06em;
  background: linear-gradient(135deg, var(--ev-color-primary) 0%, var(--ev-color-primary-light) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.login-page__divider {
  margin-top: var(--ev-space-6);
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--ev-color-border-strong), transparent);
}

.login-page__form {
  display: flex;
  flex-direction: column;
  gap: var(--ev-space-5);
  margin-top: 0;
  padding: 0 var(--ev-space-2);
}

.login-page__submit {
  margin-top: var(--ev-space-2);
  padding: 0 var(--ev-space-4);
}
</style>
