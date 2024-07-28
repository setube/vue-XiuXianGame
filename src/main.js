import Vue from 'vue'
import Vuex from 'vuex';
import App from './App.vue'
import store from '@/plugins/store';
import ElementUI from 'element-ui';
import VueClipboard from 'vue-clipboard2';
import 'element-ui/lib/theme-chalk/index.css';

Vue.use(Vuex).use(ElementUI).use(VueClipboard);

Vue.config.productionTip = false;

new Vue({
    store,
    render: h => h(App),
}).$mount('#app');