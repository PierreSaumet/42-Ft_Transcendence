import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import ProfilView from '@/views/ProfilView.vue'
import EditView from '@/views/EditView.vue'
import GameView from '@/views/GameView.vue'
import TwoFactorView from '@/views/TwoFactorView.vue'
import SubProfilViewVue from '@/views/SubProfilView.vue'
/* eslint-disable */
import store from '@/store';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfilView,
    props: true
  },
  {
    path: '/profile/:username',
    name: 'sub',
    component: SubProfilViewVue,
    props: true
  },
  {
    path: '/game/:id',
    name: 'game',
    component: GameView,
  },
  {
    path: '/game',
    name: 'lobby',
    component: GameView,
  },
  {
    path: '/edit',
    name: 'edit',
    component: EditView,
  },
  {
    path: '/twofactor',
    name: 'TwoFactor',
    component: TwoFactorView,
  },
  {
    path: '/:cachAll(.*)',
    name: 'NotFound',
    component: ProfilView,
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to: any, from: any, next: any) => {
  if (
    to.name !== 'TwoFactor' &&
    store.state.user.isTwoFactorAuthentificationEnabled === true &&
    store.state.isEnterCode === false
    ) next({ name: 'TwoFactor' })
  else next()
})


export default router
