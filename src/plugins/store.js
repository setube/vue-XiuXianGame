import Vue from 'vue';
import Vuex from 'vuex';
import crypto from '@/plugins/crypto';
import persistedState from 'vuex-persistedstate';

Vue.use(Vuex);

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
                // 已击杀数量
                taskNum: 0,
                // 总血量
                maxHealth: 100,
                // 背包道具
                inventory: [],
                // 新手礼包
                isNewbie: false,
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
                        boss: crypto.encryption(val.boss),
                        player: crypto.encryption(val.player)
                    };
                }
            })
        ]
    }
);
