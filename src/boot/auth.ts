/**
 * 启动时从 storage 恢复登录状态，供路由守卫与页面使用
 */
import { defineBoot } from '#q-app/wrappers';
import { useAuthStore } from 'src/stores/auth-store';

export default defineBoot(() => {
  const authStore = useAuthStore();
  authStore.initFromStorage();
});
