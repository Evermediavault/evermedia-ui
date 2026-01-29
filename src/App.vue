<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from 'src/stores/auth-store';

onMounted(() => {
  useAuthStore().initFromStorage();
});
</script>
