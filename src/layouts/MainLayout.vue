<template>
  <q-layout view="hHh lpR fFf" class="main-layout" dark>
    <q-header class="main-layout__header" elevated>
      <q-toolbar class="main-layout__toolbar">
        <q-btn flat dense round icon="menu" aria-label="Menu" class="main-layout__menu-btn"
          @click="leftDrawerOpen = !leftDrawerOpen" />
        <q-toolbar-title class="main-layout__title">
          {{ t('nav.appTitle') }}
        </q-toolbar-title>
        <q-space />
        <div class="main-layout__user">
          <span class="main-layout__user-pill">{{ userInitial }}</span>
          <span class="main-layout__user-name">{{ authStore.displayName }}</span>
          <q-btn flat dense no-caps :label="t('auth.logout')" class="main-layout__logout" @click="onLogout" />
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above class="main-layout__drawer" :width="260">
      <nav class="main-layout__nav-wrap" aria-label="Main">
        <p class="main-layout__nav-label">{{ t('nav.home') }}</p>
        <q-list class="main-layout__nav ev-scrollbar" dense>
          <q-item v-for="item in navItems" :key="item.path" clickable :active="isActive(item.path)"
            active-class="main-layout__nav-item--active" :to="item.path" class="main-layout__nav-item">
            <q-item-section avatar class="main-layout__nav-icon-wrap">
              <span class="main-layout__nav-icon">
                <q-icon :name="item.icon" size="20px" />
              </span>
            </q-item-section>
            <q-item-section>
              <q-item-label class="main-layout__nav-text">{{ item.title }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </nav>
    </q-drawer>

    <q-page-container class="main-layout__page">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from 'src/stores/auth-store';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const leftDrawerOpen = ref(false);

const userInitial = computed(() => {
  const name = authStore.displayName;
  return name ? name.charAt(0).toUpperCase() : '?';
});

const navItems = computed(() => [
  { path: '/', title: t('nav.home'), icon: 'home' },
]);

function isActive(path: string) {
  if (path === '/') return route.path === '/';
  return route.path.startsWith(path);
}

function onLogout() {
  authStore.logout();
  void router.push('/login');
}
</script>

<style lang="scss" scoped>
.main-layout {
  background: var(--ev-color-background);
}

.main-layout__header {
  background: var(--ev-color-background-elevated);
  border-bottom: 1px solid var(--ev-color-border);
  box-shadow: 0 1px 0 0 var(--ev-color-primary-header-glow);
}

.main-layout__toolbar {
  min-height: var(--ev-header-height);
  padding: 0 var(--ev-space-4);
}

.main-layout__menu-btn {
  color: var(--ev-color-foreground-muted);
  transition: color var(--ev-transition-fast), background var(--ev-transition-fast);

  &:hover {
    color: var(--ev-color-primary-light);
    background: var(--ev-color-surface-hover);
  }
}

.main-layout__title {
  font-size: var(--ev-font-size-lg);
  font-weight: var(--ev-font-weight-semibold);
  letter-spacing: 0.04em;
  background: linear-gradient(135deg, var(--ev-color-primary) 0%, var(--ev-color-primary-light) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.main-layout__user {
  display: flex;
  align-items: center;
  gap: var(--ev-space-3);
}

.main-layout__user-pill {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--ev-font-size-sm);
  font-weight: var(--ev-font-weight-semibold);
  color: var(--ev-color-primary-light);
  background: var(--ev-color-primary-tint-bg);
  border-radius: var(--ev-radius-lg);
  border: 1px solid var(--ev-color-primary-tint-border);
}

.main-layout__user-name {
  font-size: var(--ev-font-size-sm);
  color: var(--ev-color-foreground-muted);
}

.main-layout__logout {
  font-size: var(--ev-font-size-sm);
  color: var(--ev-color-foreground-muted);
  padding: var(--ev-space-1) var(--ev-space-3);
  border-radius: var(--ev-radius-md);
  border: 1px solid transparent;
  transition: color var(--ev-transition-fast), border-color var(--ev-transition-fast), background var(--ev-transition-fast);

  &:hover {
    color: var(--ev-color-primary-light);
    border-color: var(--ev-color-primary-tint-border-strong);
    background: var(--ev-color-primary-tint-hover);
  }
}

.main-layout__drawer {
  background: var(--ev-color-background-elevated) !important;
  border-right: 1px solid var(--ev-color-border);

  :deep(.q-drawer__content) {
    display: flex;
    flex-direction: column;
    padding: var(--ev-space-4) 0;
    background: var(--ev-color-background-elevated) !important;
  }
}

.main-layout__nav-wrap {
  display: flex;
  flex-direction: column;
  gap: var(--ev-space-4);
  min-width: 0;
}

.main-layout__nav-label {
  margin: 0;
  padding: 0 var(--ev-space-4);
  font-size: var(--ev-font-size-xs);
  font-weight: var(--ev-font-weight-medium);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ev-color-foreground-subtle);
  opacity: 0.85;
}

.main-layout__nav {
  padding: 0 var(--ev-space-3);
}

:deep(.main-layout__nav-item) {
  position: relative;
  min-height: var(--ev-nav-item-height);
  padding: 0 var(--ev-space-3);
  margin-bottom: var(--ev-space-1);
  border-radius: var(--ev-radius-lg);
  color: var(--ev-color-foreground-muted);
  transition: color var(--ev-transition-fast), background var(--ev-transition-fast);

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 0;
    border-radius: 0 var(--ev-radius-sm) var(--ev-radius-sm) 0;
    background: var(--ev-color-primary-light);
    transition: height var(--ev-transition-fast);
  }

  &:hover {
    color: var(--ev-color-foreground);
    background: var(--ev-color-surface-hover);
  }

  &.q-router-link--active,
  &.main-layout__nav-item--active {
    color: var(--ev-color-primary-light);
    background: var(--ev-color-primary-tint-bg);

    &::before {
      height: 1.25rem;
    }
  }
}

:deep(.main-layout__nav-icon-wrap) {
  min-width: 36px;
  margin-right: 0;
}

:deep(.main-layout__nav-icon) {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--ev-radius-md);
  background: transparent;
  transition: background var(--ev-transition-fast);
}

:deep(.main-layout__nav-item:hover .main-layout__nav-icon) {
  background: var(--ev-color-surface-hover);
}
:deep(.main-layout__nav-item--active .main-layout__nav-icon),
:deep(.main-layout__nav-item.q-router-link--active .main-layout__nav-icon) {
  background: var(--ev-color-primary-tint-border);
}

:deep(.main-layout__nav-text) {
  font-size: var(--ev-font-size-sm);
  font-weight: var(--ev-font-weight-medium);
}

.main-layout__page {
  background: var(--ev-color-background);
  padding: var(--ev-space-6);
  min-height: 100vh;
}
</style>
