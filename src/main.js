import Vue from 'vue'
import Vuex from 'vuex';
import App from './App.vue'
import VueRouter from 'vue-router';
import ElementUI, { Notification } from 'element-ui';
import store from '@/plugins/store';
import router from '@/plugins/router';
import VueClipboard from 'vue-clipboard2';
import 'element-ui/lib/theme-chalk/index.css';

Vue.use(Vuex).use(VueRouter).use(ElementUI).use(VueClipboard);

Vue.prototype.$notify = (data) => {
    Notification.closeAll();
    Notification(data);
}

Vue.config.productionTip = false;

// 最高等级
Vue.prototype.$maxLv = 40;
// 境界名称
Vue.prototype.$levelNames = [
    '凡人', '筑基', '开光', '胎息', '辟谷',
    '金丹', '元婴', '出窍', '分神',
    '合体', '大乘', '渡劫', '地仙',
    '天仙', '金仙', '大罗金仙', '九天玄仙',
    '仙君', '仙帝', '仙尊', '仙祖',
    '圣仙', '至仙', '无上仙', '道仙',
    '鸿蒙仙', '混沌仙', '天尊', '始祖天尊',
    '无上天尊', '大道天尊', '永恒仙尊', '宇宙仙祖',
    '虚空道祖', '超脱者', '至高神', '创世神',
    '纪元之主', '无上主宰', '鸿蒙主宰', '混沌主宰'
];
// 装备类型
Vue.prototype.$genre = {
    sutra: '法器',
    armor: '护甲',
    weapon: '神兵',
    accessory: '灵宝'
};
// 装备品阶
Vue.prototype.$levels = {
    info: '黄阶',
    pink: '仙阶',
    danger: '神阶',
    purple: '天阶',
    primary: '地阶',
    success: '玄阶',
    warning: '帝阶',
};

// 单位转换
Vue.prototype.$formatNumberToChineseUnit = (number) => {
    number = number > 0 ? number : 0;
    // 中文单位数组，从小到大
    const units = ['', '万', '亿', '兆', '京', '垓', '秭', '穰', '沟', '涧', '正', '载', '极'];
    // 定义 1 万（10000）的 BigInt 形式
    const bigTenThousand = window.BigInt(10000);
    // 将输入的数字转换为 BigInt 类型
    let num = window.BigInt(number);
    let unitIndex = 0; // 单位的索引
    let additionalUnits = ''; // 额外单位字符串
    // 当 num 大于等于 1 万时，进行循环处理
    while (num >= bigTenThousand) {
        num /= bigTenThousand; // 将数字除以 1 万
        unitIndex++; // 增加单位索引
        // 如果单位索引超过了定义的单位范围，则添加“极”并重置索引
        if (unitIndex >= units.length - 1) {
            additionalUnits += '极';
            unitIndex = 0;
        }
    }
    // 将数字转换为字符串，并加上对应的中文单位
    let result = num.toString() + units[unitIndex] + additionalUnits;
    return result;
};

// 平滑至底
Vue.prototype.$smoothScrollToBottom = (element) => {
    const start = element.scrollTop;
    const end = element.scrollHeight;
    const duration = 300;
    const startTime = performance.now();
    const scroll = () => {
        const currentTime = performance.now();
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);
        element.scrollTop = start + (end - start) * easeInOutCubic(progress);
        if (progress < 1) window.requestAnimationFrame(scroll);
    }
    const easeInOutCubic = (t) => {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    window.requestAnimationFrame(scroll);
},

new Vue({
    store,
    router,
    render: h => h(App),
}).$mount('#app');