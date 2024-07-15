import Vue from 'vue';
import Vuex from 'vuex';
import persistedState from 'vuex-persistedstate';

Vue.use(Vuex);

export default new Vuex.Store(
    {
        state: {
            // 玩家属性
            player: {
                // 当前法力
                mana: 50,
                // 等级
                level: 1,
                // 攻击
                attack: 10,
                // 当前血量
                health: 100,
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
            persistedState(
                {
                    storage: window.localStorage,
                    reducer (val) {
                        return {
                            player: val.player
                        };
                    }
                }
            )
        ]
    }
);
