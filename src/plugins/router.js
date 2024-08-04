import VueRouter from 'vue-router';
import boss from '../views/bossPage.vue';
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
            keepAlive: true
        },
        component: index
    },
    {
        path: '/cultivate',
        name: 'cultivate',
        meta: {
            keepAlive: true
        },
        component: cultivate
    },
    {
        path: '/explore',
        name: 'explore',
        meta: {
            keepAlive: true
        },
        component: explore
    },
    {
        path: '/boss',
        name: 'boss',
        meta: {
            keepAlive: true
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