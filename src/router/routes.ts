import type { RouteRecordRaw } from 'vue-router';

/** 公开路由：无需登录即可访问（登录页、404 等） */
export const ROUTE_META_PUBLIC = 'public';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'upload', component: () => import('pages/UploadPage.vue') },
    ],
  },
  {
    path: '/login',
    component: () => import('layouts/LoginLayout.vue'),
    meta: { [ROUTE_META_PUBLIC]: true },
    children: [{ path: '', component: () => import('pages/LoginPage.vue') }],
  },

  // Always leave this as last one
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
    meta: { [ROUTE_META_PUBLIC]: true },
  },
];

export default routes;
