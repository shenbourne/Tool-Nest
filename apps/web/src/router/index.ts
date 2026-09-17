import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { allTools } from '@/tools/registry';

// 自动生成工具路由
const toolRoutes: RouteRecordRaw[] = allTools.map((tool) => ({
  path: tool.path,
  name: tool.path.slice(1), // remove leading /
  component: tool.component,
  meta: {
    isTool: true,
    toolPath: tool.path,
    category: tool.category,
  },
}));

// 历史 URL 重定向路由
const redirectRoutes: RouteRecordRaw[] = allTools.flatMap((tool) =>
  (tool.redirectFrom ?? []).map((from) => ({
    path: from,
    redirect: tool.path,
  }))
);

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/pages/HomePage.vue'),
  },
  {
    path: '/tools/:category',
    name: 'category',
    component: () => import('@/pages/CategoryPage.vue'),
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/pages/SettingsPage.vue'),
  },
  {
    path: '/reports/:id',
    name: 'report',
    component: () => import('@/pages/ReportPage.vue'),
  },
  // 工具路由（放在 404 之前）
  ...toolRoutes,
  // 历史 URL 重定向
  ...redirectRoutes,
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/pages/NotFoundPage.vue'),
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
});
