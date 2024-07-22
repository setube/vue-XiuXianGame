import Vue from 'vue';
import Vuex from 'vuex';
import persistedState from 'vuex-persistedstate';
import CryptoJS from 'crypto-js';

Vue.use(Vuex);

const encryption = (val) => {
    return CryptoJS.AES.encrypt(JSON.stringify(val), window.d, {
        iv: window.d,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    }).toString();
};

export default new Vuex.Store(
    {
        state: {
            // boss属性
            boss: {
                name: '',
                text: '',
                time: 0,
                desc: '',
                level: 0,
                dodge: 0,
                attack: 0,
                health: 0,
                defense: 0,
                critical: 0,
                maxhealth: 0
            },
            // 玩家属性
            player: {
                // 当前法力
                mana: 50,
                // 等级
                level: 0,
                // 闪避
                dodge: 0,
                // 攻击
                attack: 10,
                // 当前血量
                health: 100,
                // 暴击率
                critical: 0,
                // 防御
                defense: 10,
                // 总法力
                maxMana: 50,
                // 总血量
                maxHealth: 100,
                // 背包道具
                inventory: [],
                // 装备
                equipment: {
                    // 法宝
                    sutra: null,
                    // 护甲
                    armor: null,
                    // 武器
                    weapon: null,
                    // 饰品
                    accessory: null
                },
                // 离线时间戳
                offline: 0,
                // 当前修为
                cultivation: 0,
                // 下个等级所需修为
                maxCultivation: 100,
            }
        },
        mutations: {
            setBoss (state, data) {
                state.boss = data;
            },
            setPlayer (state, data) {
                state.player = data;
            }
        },
        plugins: [
            persistedState({
                storage: window.localStorage,
                reducer (val) {
                    return {
                        boss: encryption(val.boss),
                        player: encryption(val.player)
                    };
                }
            })
        ]
    }
);
