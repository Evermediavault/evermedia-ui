<template>
  <q-layout view="hHh lpR fFf" class="login-layout">
    <div class="login-layout__bg" aria-hidden="true">
      <div class="login-layout__grid" />
      <div class="login-layout__glow login-layout__glow--1" />
      <div class="login-layout__glow login-layout__glow--2" />
      <div class="login-layout__glow login-layout__glow--3" />
    </div>
    <q-page-container class="login-layout__container">
      <div class="login-layout__card ev-glass-card">
        <router-view />
      </div>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
// 登录专用布局：全屏居中、无导航，玻璃卡 + 背景光晕与网格
</script>

<style lang="scss" scoped>
.login-layout {
  background: var(--ev-color-background);
  min-height: 100vh;
  position: relative;
}

.login-layout__bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.login-layout__grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(var(--ev-glass-grid) 1px, transparent 1px),
    linear-gradient(90deg, var(--ev-glass-grid) 1px, transparent 1px);
  background-size: var(--ev-space-8) var(--ev-space-8);
  mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 70%);
  -webkit-mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 70%);
}

.login-layout__glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(var(--ev-blur-glow));
  opacity: var(--ev-glow-opacity);
  transition: opacity var(--ev-transition-base);
}
.login-layout__glow--1 {
  width: var(--ev-glow-size-lg);
  height: var(--ev-glow-size-lg);
  background: var(--ev-color-primary);
  top: calc(-1 * var(--ev-space-12));
  right: calc(-1 * var(--ev-space-8));
}
.login-layout__glow--2 {
  width: var(--ev-glow-size-md);
  height: var(--ev-glow-size-md);
  background: var(--ev-color-accent);
  bottom: calc(-1 * var(--ev-space-8));
  left: calc(-1 * var(--ev-space-6));
}
.login-layout__glow--3 {
  width: var(--ev-glow-size-sm);
  height: var(--ev-glow-size-sm);
  background: var(--ev-color-primary-light);
  bottom: var(--ev-glow-3-bottom);
  right: var(--ev-glow-3-right);
  opacity: var(--ev-glow-opacity-subtle);
}

.login-layout__container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: var(--ev-space-6);
}

.login-layout__card {
  width: 100%;
  max-width: var(--ev-login-card-max-width);
  padding: var(--ev-space-10) var(--ev-space-8) var(--ev-space-12);
  border-radius: var(--ev-radius-xl);
  box-shadow: var(--ev-shadow-lg);
  transition: box-shadow var(--ev-transition-base);
}
.login-layout__card:hover {
  box-shadow: var(--ev-shadow-lg), var(--ev-shadow-glow);
}
</style>
