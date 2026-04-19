import map from '../views/mapExploration.vue'
import boss from '../views/bossPage.vue'
import home from '../views/homePage.vue'
import index from '../views/indexPage.vue'
import explore from '../views/explorePage.vue'
import cultivate from '../views/cultivatePage.vue'
import endlesstower from '../views/endlessPage.vue'
import game from '../views/game/game.vue'
import login from '../views/loginPage.vue'
import profile from '../views/profilePage.vue'
import friendsRank from '../views/friendsRank.vue'
import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'index',
    meta: {
      keepAlive: false
    },
    component: index
  },
  {
    path: '/login',
    name: 'login',
    meta: {
      keepAlive: false,
      title: '微信登录'
    },
    component: login
  },
  {
    path: '/profile',
    name: 'profile',
    meta: {
      keepAlive: false,
      title: '个人信息'
    },
    component: profile
  },
  {
    path: '/friends-rank',
    name: 'friendsRank',
    meta: {
      keepAlive: false,
      title: '好友排行榜'
    },
    component: friendsRank
  },
  {
    path: '/home',
    name: 'home',
    meta: {
      keepAlive: false
    },
    component: home
  },
  {
    path: '/cultivate',
    name: 'cultivate',
    meta: {
      keepAlive: false
    },
    component: cultivate
  },
  {
    path: '/map',
    name: 'map',
    meta: {
      keepAlive: false
    },
    component: map
  },
  {
    path: '/explore',
    name: 'explore',
    meta: {
      keepAlive: false
    },
    component: explore
  },
  {
    path: '/boss',
    name: 'boss',
    meta: {
      keepAlive: false
    },
    component: boss
  },
  {
    path: '/endlesstower',
    name: 'endlesstower',
    meta: {
      keepAlive: false
    },
    component: endlesstower
  },
  {
    path: '/game',
    name: 'game',
    meta: {
      keepAlive: false
    },
    component: game
  }
]
const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
