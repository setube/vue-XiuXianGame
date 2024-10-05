const achievement = {
    // 所有成就
    all () {
        return [
            {
                name: '灵宠成就',
                type: 'pet',
                data: this.pet()
            },
            {
                name: '探索成就',
                type: 'monster',
                data: this.monster()
            },
            {
                name: '装备成就',
                type: 'equipment',
                data: this.equipment()
            }
        ]
    },
    // 灵宠相关成就
    pet () {
        return [
            {
                // 成就ID
                id: 1,
                // 成就名称
                name: '气血神宠',
                // 成就奖励
                award: 1000,
                //佩戴奖励
                titleBonus: {
                    health: 5000
                },
                //达成条件
                condition: {
                    dodge: 0,
                    health: 23500,
                    attack: 0,
                    defense: 0,
                    critical: 0
                }
            },
            {
                id: 2,
                name: '攻击神宠',
                award: 1000,
                titleBonus: {
                    attack: 1000
                },
                condition: {
                    dodge: 0,
                    health: 0,
                    attack: 7050,
                    defense: 0,
                    critical: 0
                }
            },
            {
                id: 3,
                name: '防御神宠',
                award: 1000,
                titleBonus: {
                    defense: 100
                },
                condition: {
                    dodge: 0,
                    health: 0,
                    attack: 0,
                    defense: 705,
                    critical: 0
                }
            },
            {
                id: 4,
                name: '闪避神宠',
                award: 1000,
                titleBonus: {
                    dodge: 0.1
                },
                condition: {
                    dodge: 0.47,
                    health: 0,
                    attack: 0,
                    defense: 0,
                    critical: 0
                }
            },
            {
                id: 5,
                name: '暴击神宠',
                award: 1000,
                titleBonus: {
                    critical: 0.1
                },
                condition: {
                    dodge: 0,
                    health: 0,
                    attack: 0,
                    defense: 0,
                    critical: 0.47
                }
            },
            {
                id: 6,
                name: '灵宠天花板',
                titleBonus: {
                    attack: 2500
                },
                award: 10000,
                condition: {
                    dodge: 0.47,
                    health: 23500,
                    attack: 7050,
                    defense: 705,
                    critical: 0.47
                }
            }
        ]
    },
    // 装备相关成就
    equipment () {
        return [];
    },
    // 打怪相关成就
    monster () {
        return [
            {
                id: 7,
                name: '挑战者',
                desc: '通关无尽塔100层',
                titleBonus: {
                    critical: 0.05
                },
                award: 10000,
                condition: {
                    highestTowerFloor: 100
                },
            },
            {
                id: 8,
                name: '征服者',
                desc: '通关无尽塔1000层',
                titleBonus: {
                    critical: 0.1
                },
                award: 10000,
                condition: {
                    highestTowerFloor: 1000
                }
            },
            {
                id: 8,
                name: '长生者',
                desc: '寿元达到1000岁',
                titleBonus: {
                    health: 10000
                },
                award: 10000,
                condition: {
                    age: 1000
                }
            },
            {
                id: 9,
                name: '幸运之星',
                desc: '小游戏胜利超过10次',
                titleBonus: {
                    defense: 0.01
                },
                award: 10000,
                condition: {
                    gameWins: 10
                }
            },
            {
                id: 10,
                name: '天选之子',
                desc: '小游戏胜利超过100次',
                titleBonus: {
                    defense: 0.1
                },
                award: 10000,
                condition: {
                    gameWins: 100
                }
            },
        ];
    }
};
export default achievement;