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
})
