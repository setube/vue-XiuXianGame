const shop = {
    drawPrize (lv) {
        const types = [
            { type: 'weapon', data: this.equipWeapons() },
            { type: 'armor', data: this.equipArmors() },
            { type: 'accessory', data: this.equipAccessories() },
            { type: 'sutra', data: this.equipSutras() }
        ];
        const genre = { sutra: '法器', armor: '护甲', weapon: '兵器', accessory: '灵宝' };
        const getAttribute = (type, lv, attribute) => {
            // 根据装备品质调整装备属性值
            const multiplier = 15;
            const Attack = 1000 * lv;
            const Health = 10000 * lv;
            const CriticalHitrate = 0.1;
            const attrs = {
                attack: ['weapon', 'accessory', 'sutra'].includes(type) ? Attack * multiplier : 0,
                health: ['armor', 'accessory', 'sutra'].includes(type) ? Health * multiplier : 0,
                critical: ['weapon', 'accessory', 'sutra'].includes(type) ? CriticalHitrate * multiplier : 0,
                dodge: ['accessory', 'sutra'].includes(type) ? CriticalHitrate * multiplier : 0,
                defense: ['accessory', 'sutra'].includes(type) ? Attack * multiplier : 0
            };
            return attrs[attribute];
        };
        return types.map(({ type, data }) => ({
            type,
            name: genre[type],
            data: data.flatMap((name) => ({
                id: Date.now(),
                name,
                type,
                lock: true,
                level: lv,
                attack: getAttribute(type, lv, 'attack'),
                health: getAttribute(type, lv, 'health'),
                critical: getAttribute(type, lv, 'critical'),
                dodge: getAttribute(type, lv, 'dodge'),
                defense: getAttribute(type, lv, 'defense'),
                quality: 'pink'
            }))
        }));
    },
    equipWeapons () {
        return ['粉晶月刃剑', '樱花吹雪弓', '蔷薇缠绕鞭', '蜜桃梦境杖', '粉蝶幻光刃', '粉晶流光扇', '甜梦水晶枪', '粉樱魔法杖', '粉钻心语弩', '柔粉蔷薇盾'];
    },
    equipArmors () {
        return ['粉樱绮梦裳', '甜梦粉蝶衣', '蜜桃恋曲裙', '粉晶流光铠', '樱花恋歌袍', '柔粉蔷薇甲', '粉蝶翩翩袖', '甜梦羽织衣', '粉晶幻彩裙', '蜜桃梦境袍'];
    },
    equipAccessories () {
        return ['粉晶梦蝶链', '樱花恋曲簪', '甜梦蔷薇戒', '蜜桃绮梦环', '粉蝶轻舞坠', '粉晶甜蜜链', '柔粉心语珥', '樱花绮梦镯', '蜜桃梦境簪', '粉蝶幻彩带'];
    },
    equipSutras () {
        return ['粉樱梦幻笛', '甜心粉蝶壶', '蜜桃恋语镜', '粉晶流光珠', '柔粉绮梦石', '樱花纷飞扇', '甜梦绮罗盘', '蜜桃幻影灯', '粉蝶织梦琴', '粉樱守护符'];
    }
};
export default shop;