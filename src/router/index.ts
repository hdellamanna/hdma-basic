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
    path: '/remasters',
    name: 'collection',
    component: () => import('../views/RemasterCollection.vue'),
  },
  {
    path: '/remasters/:id',
    name: 'edition',
    component: () => import('../views/RemasterEdition.vue'),
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

router.beforeEach(async (to) => {
  if (to.name !== 'edition') return
  const { missions } = await import('../remasters/catalog')
  if (!Object.prototype.hasOwnProperty.call(missions, String(to.params.id))) {
    return { name: 'collection' }
  }
})
