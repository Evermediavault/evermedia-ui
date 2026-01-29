/**
 * 认证状态：token、用户信息，与本地 storage 同步，供路由守卫与 axios 使用
 */
import { defineStore } from 'pinia';
import { getStorage, setStorage, removeStorage } from 'src/utils/storage';
import { STORAGE_KEY_TOKEN, STORAGE_KEY_USER } from 'src/constants/storage';
import { api } from 'src/boot/axios';
import type { AuthUser, BackendSuccessResponse, LoginData } from 'src/types/api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null as string | null,
    user: null as AuthUser | null,
  }),

  getters: {
    isLoggedIn(state): boolean {
      return !!state.token;
    },
    displayName(state): string {
      return state.user?.username ?? '';
    },
    currentUser(state): AuthUser | null {
      return state.user;
    },
  },

  actions: {
    setAuth(token: string, user: AuthUser) {
      this.token = token;
      this.user = user;
      setStorage(STORAGE_KEY_TOKEN, token);
      setStorage(STORAGE_KEY_USER, user);
    },

    clearAuth() {
      this.token = null;
      this.user = null;
      removeStorage(STORAGE_KEY_TOKEN);
      removeStorage(STORAGE_KEY_USER);
    },

    /** 从 storage 恢复（刷新后或首次进入） */
    initFromStorage() {
      if (typeof window === 'undefined') return;
      const token = getStorage<string>(STORAGE_KEY_TOKEN);
      const user = getStorage<AuthUser>(STORAGE_KEY_USER);
      if (token && user) {
        this.token = token;
        this.user = user;
      } else {
        this.clearAuth();
      }
    },

    /**
     * 登录：调用后端 POST /auth/admin/login，成功则写入 state 与 storage
     * @returns 成功返回 data，失败抛出
     */
    async login(username: string, password: string): Promise<LoginData> {
      const res = await api.post<BackendSuccessResponse<LoginData>>('/auth/admin/login', {
        username: username.trim(),
        password,
      });
      const body = res.data;
      if (!body.success || !body.data) {
        throw new Error(body.message || 'Login failed');
      }
      const { token, user } = body.data;
      this.setAuth(token, user);
      return body.data;
    },

    logout() {
      this.clearAuth();
    },
  },
});
