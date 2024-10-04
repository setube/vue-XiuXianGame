import App from './App.vue';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import 'element-plus/dist/index.css';
import 'normalize.css/normalize.css';
import router from '@/plugins/router';
import { useMainStore } from '@/plugins/store';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import ElementPlus, { ElNotification } from 'element-plus';

const app = createApp(App);

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);
app.use(pinia);

const store = useMainStore();

app.config.productionTip = false;
app.config.globalProperties.$store = store;

app.config.globalProperties.$notifys = (data) => {
    ElNotification.closeAll();
    ElNotification(data);
};

const maxLv = 144;
app.config.globalProperties.$maxLv = maxLv;

app.config.globalProperties.$levelNames = (level) => {
    const levelsPerStage = 9;
    const stageIndex = Math.floor((level - 1) / levelsPerStage);
    const stageLevel = (level - 1) % levelsPerStage + 1;
    const numberName = {
        1: '一', 2: '二', 3: '三', 4: '四',
        5: '五', 6: '六', 7: '七', 8: '八', 9: '九'
    };
    const stageNames = [
        '筑基', '开光', '胎息', '辟谷',
        '金丹', '元婴', '出窍', '分神',
        '合体', '大乘', '渡劫', '地仙',
        '天仙', '金仙', '大罗金仙', '九天玄仙'
    ];
    if (level === 0) return '凡人';
    else if (level >= maxLv) return '九天玄仙九层';
    else return `${stageNames[stageIndex]}${numberName[stageLevel]}层`;
}

const dropdownTypeObject = {
    id: '时间',
    level: '境界',
    score: '评分',
    health: '气血',
    attack: '攻击',
    defense: '防御',
    critical: '暴击',
    dodge: '闪避'
};

app.config.globalProperties.$dropdownType = Object.entries(dropdownTypeObject).map(([type, name]) => ({ type, name }));

app.config.globalProperties.$genre = {
    sutra: '法器',
    armor: '护甲',
    weapon: '神兵',
    accessory: '灵宝'
};

app.config.globalProperties.$isAPP = location.host == 'appassets.androidplatform.net';


app.config.globalProperties.$levels = {
    info: '黄阶',
    pink: '仙阶',
    danger: '神阶',
    purple: '天阶',
    primary: '地阶',
    success: '玄阶',
    warning: '帝阶',
};

app.config.globalProperties.$propItemNames = {
    money: { name: '灵石', desc: '可以通过分解获得装备获得' },
    flying: { name: '传送符', desc: '可以通过赠送礼物给NPC获得' },
    rootBone: { name: '悟性丹', desc: '可以通过击败世界BOSS获得' },
    qingyuan: { name: '情缘', desc: '可以通过赠送礼物给NPC获得' },
    currency: { name: '鸿蒙石', desc: '可以通过击败世界BOSS获得' },
    cultivateDan: { name: '培养丹', desc: '可以通过探索获得' },
    strengtheningStone: { name: '炼器石', desc: '可以通过分解装备获得' }
};

app.config.globalProperties.$formatNumberToChineseUnit = (number) => {
    number = number > 0 ? Math.floor(number) : 0;
    const units = ['', '万', '亿', '兆', '京', '垓', '秭', '穰', '沟', '涧', '正', '载', '极'];
    const bigTenThousand = window.BigInt(10000);
    let num = window.BigInt(number);
    let unitIndex = 0;
    let additionalUnits = '';
    while (num >= bigTenThousand) {
        num /= bigTenThousand;
        unitIndex++;
        if (unitIndex >= units.length - 1) {
            additionalUnits += '极';
            unitIndex = 0;
        }
    }
    return num.toString() + units[unitIndex] + additionalUnits;
};

app.config.globalProperties.$smoothScrollToBottom = (element) => {
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
    const easeInOutCubic = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    window.requestAnimationFrame(scroll);
};

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
}

app.use(router);
app.use(ElementPlus);
app.mount('#app');