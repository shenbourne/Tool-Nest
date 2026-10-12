import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { allTools } from '@/tools/registry';
import { CATEGORY_ANCHOR_OFFSET } from '@/utils/category-anchor';
import { legacyCategoryLocation } from '@/utils/legacy-category';

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
    meta: { showSidebar: true },
  },
  {
    path: '/tools/:category',
    name: 'category',
    component: () => import('@/pages/CategoryPage.vue'),
    meta: { showSidebar: true },
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/pages/SettingsPage.vue'),
    meta: { showSidebar: false },
  },
  {
    path: '/reports/:id',
    name: 'report',
    component: () => import('@/pages/ReportPage.vue'),
    meta: { showSidebar: false },
  },
  // 工具路由（放在 404 之前）
  ...toolRoutes.map(r => ({ ...r, meta: { ...r.meta, showSidebar: true } })),
  // 历史 URL 重定向
  ...redirectRoutes,
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/pages/NotFoundPage.vue'),
    meta: { showSidebar: false },
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to) {
    // A category link carries the section id as its hash; land on that section with
    // the same offset the section keeps for in-place scrolling. Anything else (and a
    // hash whose category renders no section) starts at the top.
    if (to.hash) {
      const el = document.getElementById(to.hash.slice(1));
      if (el) return { el, top: CATEGORY_ANCHOR_OFFSET, behavior: 'smooth' };
    }
    return { top: 0 };
  },
});

router.beforeEach((to) => {
  if (to.name === 'category') return legacyCategoryLocation(String(to.params.category));
  if (to.path === '/' && to.hash.startsWith('#category-')) {
    return legacyCategoryLocation(to.hash.slice('#category-'.length));
  }
});
