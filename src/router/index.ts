import { defineRouter } from '#q-app/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import { getStorage } from 'src/utils/storage';
import { STORAGE_KEY_TOKEN } from 'src/constants/storage';
import routes, { ROUTE_META_PUBLIC } from './routes';

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  Router.beforeEach((to, _from, next) => {
    if (process.env.SERVER || typeof window === 'undefined') {
      next();
      return;
    }
    const isPublic = to.matched.some((r) => r.meta?.[ROUTE_META_PUBLIC]);
    const token = getStorage<string>(STORAGE_KEY_TOKEN);
    if (isPublic) {
      if (to.path === '/login' && token) {
        const redirect = (to.query.redirect as string) || '/';
        next({ path: redirect, query: {} });
        return;
      }
      next();
      return;
    }
    if (!token) {
      next({ path: '/login', query: { redirect: to.fullPath } });
      return;
    }
    next();
  });

  return Router;
});
