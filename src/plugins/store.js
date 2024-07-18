import Vue from 'vue';
import Vuex from 'vuex';
import persistedState from 'vuex-persistedstate';
import CryptoJS from 'crypto-js';

Vue.use(Vuex);

export default new Vuex.Store(
    {
        state: {
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
            setPlayer (state, data) {
                state.player = data;
            }
        },
        plugins: [
            persistedState({
                storage: window.localStorage,
                reducer (val) {
                    const encryptedPlayerData = CryptoJS.AES.encrypt(JSON.stringify(val.player), 'YourEncryptionKe', {
                        iv: 'YourEncryptionKe',
                        mode: CryptoJS.mode.CBC,
                        padding: CryptoJS.pad.Pkcs7
                    });
                    return {
                        player: encryptedPlayerData.toString()
                    };
                }
            })
        ]
    }
);
