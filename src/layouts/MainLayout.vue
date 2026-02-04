<template>
  <q-layout view="hhh LpR fFf" class="main-layout" dark>
    <q-drawer v-model="leftDrawerOpen" show-if-above class="main-layout__drawer" :width="drawerWidthPx">
      <div class="main-layout__drawer-inner">
        <div class="flex items-center justify-center py-4">
          <q-img src="/logo.png" height="80px" width="80px" />
        </div>
        <nav class="main-layout__nav-wrap" aria-label="Main">
          <q-list class="main-layout__nav ev-scrollbar" dense>
            <q-item v-for="item in navItems" :key="item.path" clickable :active="isActive(item.path)"
              active-class="main-layout__nav-item--active" :to="item.path" class="main-layout__nav-item">
              <q-item-section avatar class="main-layout__nav-icon-wrap">
                <span class="main-layout__nav-icon">
                  <q-icon :name="item.icon" :size="navIconSize" />
                </span>
              </q-item-section>
              <q-item-section>
                <q-item-label class="main-layout__nav-text">{{ item.title }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </nav>
        <div class="main-layout__user-block">
          <span class="main-layout__user-pill">{{ userInitial }}</span>
          <span class="main-layout__user-name">{{ authStore.displayName }}</span>
          <q-btn flat dense no-caps :label="t('auth.logout')" class="main-layout__logout" @click="onLogout" />
        </div>
      </div>
    </q-drawer>

    <q-page-container class="main-layout__page">
      <div class="main-layout__page-inner">
        <div class="main-layout__bg" aria-hidden="true">
          <div class="main-layout__nodes" />
          <div class="main-layout__glow main-layout__glow--1" />
          <div class="main-layout__glow main-layout__glow--2" />
          <div class="main-layout__glow main-layout__glow--3" />
        </div>
        <router-view />
      </div>
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
// 与 _theme-tokens $drawer-width (15rem) 一致，q-drawer 需要数字 px
const drawerWidthPx = 240;
const navIconSize = '1.25rem'; // 与 --ev-nav-icon-inner 一致

const userInitial = computed(() => {
  const name = authStore.displayName;
  return name ? name.charAt(0).toUpperCase() : '?';
});

const isAdmin = computed(() => (authStore.currentUser?.role ?? '').toLowerCase() === 'admin');

const navItems = computed(() => {
  const items = [
    { path: '/', title: t('nav.home'), icon: 'home' },
    { path: '/files', title: t('nav.files'), icon: 'folder' },
    { path: '/upload', title: t('nav.upload'), icon: 'cloud_upload' },
  ];
  if (isAdmin.value) {
    items.push({ path: '/users', title: t('nav.users'), icon: 'people' });
  }
  return items;
});

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
  height: 100vh;
  min-height: 100vh;
}

.main-layout__drawer {
  background: var(--ev-color-background-elevated) !important;
  border-right: 1px solid var(--ev-color-border-strong);

  :deep(.q-drawer__content) {
    display: flex;
    flex-direction: column;
    padding: 0;
    background: var(--ev-color-background-elevated) !important;
  }
}

.main-layout__drawer-inner {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  min-width: 0;
}

.main-layout__nav-wrap {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: var(--ev-space-4);
  padding: var(--ev-space-5) 0 var(--ev-space-4);
}

.main-layout__user-block {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: var(--ev-space-3);
  padding: var(--ev-space-4) var(--ev-space-4) var(--ev-space-5);
  border-top: 1px solid var(--ev-color-border-strong);
}

.main-layout__user-pill {
  width: var(--ev-avatar-size);
  height: var(--ev-avatar-size);
  flex-shrink: 0;
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
  flex: 1;
  min-width: 0;
  font-size: var(--ev-font-size-sm);
  color: var(--ev-color-foreground-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.main-layout__logout {
  flex-shrink: 0;
  font-size: var(--ev-font-size-sm);
  color: var(--ev-color-foreground-muted);
  padding: var(--ev-space-1) var(--ev-space-3);
  border-radius: var(--ev-radius-md);
  border: 1px solid transparent;
  transition: color var(--ev-transition-fast), border-color var(--ev-transition-fast), background var(--ev-transition-fast), box-shadow var(--ev-transition-fast);

  &:hover {
    color: var(--ev-color-primary-light);
    border-color: var(--ev-color-primary-tint-border-strong);
    background: var(--ev-color-primary-tint-hover);
  }

  &:focus-visible {
    outline: none;
    border-color: var(--ev-color-primary-tint-border-strong);
    box-shadow: var(--ev-focus-ring);
  }
}

.main-layout__nav {
  padding: var(--ev-space-4) var(--ev-space-3) 0;
  margin: 0 var(--ev-space-1) 0 0;
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
    width: var(--ev-nav-indicator-width);
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
    box-shadow: var(--ev-nav-active-glow);

    &::before {
      height: var(--ev-nav-indicator-height);
    }
  }

  &:focus-visible {
    outline: none;
    box-shadow: var(--ev-nav-active-glow), 0 0 0 2px var(--ev-color-primary-tint-border);
  }
}

:deep(.main-layout__nav-icon-wrap) {
  min-width: var(--ev-nav-icon-size);
  margin-right: 0;
}

:deep(.main-layout__nav-icon) {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--ev-nav-icon-size);
  height: var(--ev-nav-icon-size);
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
  position: relative;
  background: var(--ev-color-background);
  height: 100%;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.main-layout__page-inner {
  position: relative;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.main-layout__bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

/* 去中心化节点：散布点阵，弱化常规网格感，贴合存储/节点意象 */
.main-layout__nodes {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle at center, var(--ev-node-dot) 1px, transparent 1px),
    radial-gradient(circle at center, var(--ev-node-dot) 1px, transparent 1px);
  background-size: var(--ev-space-12) var(--ev-space-12);
  background-position: 0 0, var(--ev-space-6) var(--ev-space-6);
  mask-image: radial-gradient(ellipse 70% 70% at 85% 50%, black 10%, transparent 65%);
  -webkit-mask-image: radial-gradient(ellipse 70% 70% at 85% 50%, black 10%, transparent 65%);
}

.main-layout__glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(var(--ev-blur-glow));
  opacity: var(--ev-glow-opacity-subtle);
  transition: opacity var(--ev-transition-base);
}

.main-layout__glow--1 {
  width: var(--ev-glow-size-md);
  height: var(--ev-glow-size-md);
  background: var(--ev-color-primary);
  top: calc(-1 * var(--ev-space-8));
  right: calc(-1 * var(--ev-space-6));
}

.main-layout__glow--2 {
  width: var(--ev-glow-size-sm);
  height: var(--ev-glow-size-sm);
  background: var(--ev-color-accent);
  bottom: 15%;
  right: 10%;
}

.main-layout__glow--3 {
  width: var(--ev-glow-size-sm);
  height: var(--ev-glow-size-sm);
  background: var(--ev-color-primary-light);
  bottom: calc(-1 * var(--ev-space-4));
  left: 20%;
  opacity: var(--ev-glow-opacity-subtle);
}

.main-layout__page-inner> :not(.main-layout__bg) {
  position: relative;
  z-index: 1;
  flex: 1 1 0;
  min-height: 0;
}
</style>
