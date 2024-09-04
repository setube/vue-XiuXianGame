import { createRouter, createWebHashHistory } from 'vue-router';

const routes = [
    {
        path: '/',
        name: 'index',
        meta: {
            keepAlive: false
        },
        component: () => import('@/views/indexPage.vue')
    },
    {
        path: '/home',
        name: 'home',
        meta: {
            keepAlive: false
        },
        component: () => import('@/views/homePage.vue')
    },
    {
        path: '/cultivate',
        name: 'cultivate',
        meta: {
            keepAlive: false
        },
        component: () => import('@/views/cultivatePage.vue')
    },
    {
        path: '/map',
        name: 'map',
        meta: {
            keepAlive: false
        },
        component: () => import('@/views/mapExploration.vue')
    },
    {
        path: '/explore',
        name: 'explore',
        meta: {
            keepAlive: false
        },
        component: () => import('@/views/explorePage.vue')
    },
    {
        path: '/boss',
        name: 'boss',
        meta: {
            keepAlive: false
        },
        component: () => import('@/views/bossPage.vue')
    },
    {
        path: '/equipAll',
        name: 'equipAll',
        meta: {
            keepAlive: true
        },
        component: () => import('@/views/equipAll.vue')
    },
];
const router = createRouter({
    history: createWebHashHistory(),
    routes
});

export default router;
