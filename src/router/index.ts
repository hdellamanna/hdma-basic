import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'floor',
    component: () => import('../views/ArcadeFloor.vue'),
  },
  {
    path: '/manual/:id',
    name: 'manual',
    component: () => import('../views/ManualSelect.vue'),
  },
  {
    path: '/play/:manualId/:gameId',
    name: 'play',
    component: () => import('../views/GameRunner.vue'),
  },
  {
    path: '/remastered',
    name: 'remastered',
    component: () => import('../views/LunarCourier.vue'),
  },
  {
    path: '/downloads',
    name: 'downloads',
    component: () => import('../views/Downloads.vue'),
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/About.vue'),
  },
  {
    path: '/:catchAll(.*)',
    redirect: '/',
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, _from, saved) {
    if (saved) return saved
    if (to.hash) return { el: to.hash }
    return { top: 0 }
  },
})
