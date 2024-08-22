import VueRouter from 'vue-router';
import map from '../views/mapExploration.vue';
import boss from '../views/bossPage.vue';
import home from '../views/homePage.vue';
import index from '../views/indexPage.vue';
import equipAll from '../views/equipAll.vue';
import explore from '../views/explorePage.vue';
import cultivate from '../views/cultivatePage.vue';

let originalPush = VueRouter.prototype.push;
let originalRepace = VueRouter.prototype.replace;

VueRouter.prototype.push = function push (location) {
    return originalPush.call(this, location).catch(e => e);
};

VueRouter.prototype.replace = function replace (location) {
    return originalRepace.call(this, location).catch(e => e);
};

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
            keepAlive: true
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
        path: '/equipAll',
        name: 'equipAll',
        meta: {
            keepAlive: true
        },
        component: equipAll
    },
];

const router = new VueRouter({
    routes
});

export default router;