import { defineBoot } from '#q-app/wrappers';
import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { getStorage, removeStorage } from 'src/utils/storage';
import { STORAGE_KEY_TOKEN, STORAGE_KEY_USER } from 'src/constants/storage';
import { apiConfig } from 'src/config/api';
import type { BackendErrorResponse } from 'src/types/api';

declare module 'vue' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: AxiosInstance;
  }
}

const api = axios.create({
  baseURL: apiConfig.baseURL,
  timeout: apiConfig.timeout,
  headers: { ...apiConfig.headers },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window === 'undefined') return config;
  const token = getStorage<string>(STORAGE_KEY_TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const res = error?.response;
    const data = res?.data as BackendErrorResponse | undefined;

    if (data?.success === false && typeof data.message === 'string') {
      error.message = data.message;
      error.response = error.response || {
        status: data.status_code,
        data,
        statusText: '',
        headers: {},
        config: error.config,
      };
    }

    if (typeof window !== 'undefined' && res?.status === 401) {
      removeStorage(STORAGE_KEY_TOKEN);
      removeStorage(STORAGE_KEY_USER);
      const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
      const loginPath = `${base}/login`;
      const current = window.location.pathname + window.location.search;
      const redirect =
        current !== loginPath && current !== base && current !== `${base}/`
          ? `?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`
          : '';
      window.location.href = `${window.location.origin}${loginPath}${redirect}`;
    }

    // 保留原始 error（含 response），便于 handleAxiosError 使用
    // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors -- axios error 需保留 response
    return Promise.reject(error);
  }
);

export default defineBoot(({ app }) => {
  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;
});

export { api };
