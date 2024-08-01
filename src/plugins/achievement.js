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
                //达成条件
                condition: {
                    dodge: 0,
                    health: 22000,
                    attack: 0,
                    defense: 0,
                    critical: 0
                }
            },
            {
                id: 2,
                name: '攻击神宠',
                award: 1000,
                condition: {
                    dodge: 0,
                    health: 0,
                    attack: 6600,
                    defense: 0,
                    critical: 0
                }
            },
            {
                id: 3,
                name: '防御神宠',
                award: 1000,
                condition: {
                    dodge: 0,
                    health: 0,
                    attack: 0,
                    defense: 660,
                    critical: 0
                }
            },
            {
                id: 4,
                name: '闪避神宠',
                award: 1000,
                condition: {
                    dodge: 0.44,
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
                condition: {
                    dodge: 0,
                    health: 0,
                    attack: 0,
                    defense: 0,
                    critical: 0.44
                }
            },
            {
                id: 6,
                name: '灵宠天花板',
                award: 10000,
                condition: {
                    dodge: 0.44,
                    health: 22000,
                    attack: 6600,
                    defense: 660,
                    critical: 0.44
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
        return [];
    }
};
export default achievement;