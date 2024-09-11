import { defineStore } from 'pinia';
import crypto from '@/plugins/crypto';

export const useMainStore = defineStore('main', {
    state: () => ({
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
            conquer: false,
            defense: 0,
            critical: 0,
            maxhealth: 0
        },
        // 玩家属性
        player: {
            zc: false,
            pet: {},
            dark: false,
            npcs: [],
            wife: {},
            pets: [],
            wifes: [],
            props: {
                money: 0,
                flying: 0,
                qingyuan: 0,
                rootBone: 0,
                currency: 0,
                cultivateDan: 0,
                strengtheningStone: 0
            },
            score: 0,
            level: 0,
            dodge: 0,
            points: 0,
            attack: 10,
            health: 100,
            critical: 0,
            defense: 10,
            taskNum: 0,
            version: 0.8,
            currency: 0,
            maxHealth: 100,
            inventory: [],
            isNewbie: false,
            shopData: [],
            equipment: {
                sutra: {},
                armor: {},
                weapon: {},
                accessory: {}
            },
            achievement: {
                pet: [],
                monster: [],
                equipment: []
            },
            cultivation: 0,
            reincarnation: 0,
            maxCultivation: 100,
            backpackCapacity: 50,
            sellingEquipmentData: []
        },
        mapData: {
            y: 0,
            x: 0,
            map: []
        }
    }),
    actions: {
        setMapData (data) {
            this.mapData = data;
        },
        setBoss (data) {
            this.boss = data;
        },
        setPlayer (data) {
            this.player = data;
        }
    },
    persist: {
        key: 'vuex',
        paths: ['boss', 'player'],
        storage: localStorage,
        serializer: {
            serialize: (state) => {
                return JSON.stringify({
                    boss: crypto.encryption(state.boss),
                    player: crypto.encryption(state.player)
                });
            },
            deserialize: (value) => {
                const state = JSON.parse(value);
                return {
                    boss: crypto.decryption(state.boss),
                    player: crypto.decryption(state.player)
                };
            }
        }
    }
});
