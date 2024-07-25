const All = {
    drawPrize (lv) {
        const types = [
            { type: 'weapon', data: this.equipWeapons() },
            { type: 'armor', data: this.equipArmors() },
            { type: 'accessory', data: this.equipAccessories() },
            { type: 'sutra', data: this.equipSutras() }
        ];
        const prize = { info: 50, success: 20, primary: 15, purple: 9, warning: 5, danger: 1, pink: 0 };
        const genre = { sutra: '法器', armor: '护甲', weapon: '兵器', accessory: '灵宝' };
        const quality = Object.keys(prize);
        const getAttribute = (type, lv, attribute, quality) => {
            // 根据装备品质调整装备属性值
            const qualityMultiplier = { info: 1.2, success: 2, primary: 3, purple: 5, warning: 7, danger: 10, pink: 15 };
            const multiplier = qualityMultiplier[quality];
            const Attack = this.calculateCompoundGrowth(1000 * lv, 20, 0.1);
            const Health = this.calculateCompoundGrowth(10000 * lv, 20, 0.1);
            const CriticalHitrate = this.calculateCompoundGrowth(0.1, 20, 0.1);
            const attrs = {
                hit: ['accessory', 'sutra'].includes(type) ? CriticalHitrate * multiplier : 0,
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
            data: data.flatMap((subtype, kk) =>
                subtype.map(name => ({
                    hit: getAttribute(type, lv, 'hit', quality[kk]),
                    name,
                    type,
                    level: lv,
                    prize: prize[quality[kk]],
                    attack: getAttribute(type, lv, 'attack', quality[kk]),
                    health: getAttribute(type, lv, 'health', quality[kk]),
                    critical: getAttribute(type, lv, 'critical', quality[kk]),
                    dodge: getAttribute(type, lv, 'dodge', quality[kk]),
                    defense: getAttribute(type, lv, 'defense', quality[kk]),
                    quality: quality[kk],
                    strengthen: 20
                }))
            )
        }));
    },
    equipWeapons () {
        return [
            ['白玉净尘剑', '雪魄寒冰枪', '白龙吟风弓', '月华流光扇', '白玉玄灵笛', '霜雪无痕鞭', '云隐白凰刃', '净世白莲杖', '冰魄寒光轮', '白玉玲珑塔'],
            ['翠玉青藤剑', '碧影灵蛇鞭', '绿叶风暴弓', '青木长生杖', '翡翠灵犀刃', '藤蔓缠绕索', '翠竹清风扇', '生命之泉壶', '绿野仙踪笛', '森罗万象轮'],
            ['寒冰破晓剑', '碧海潮生笛', '蓝玉冰魄弓', '苍穹蓝龙枪', '冰魄寒光剑', '鲛人织梦扇', '深海之怒戟', '碧波凌霄杖', '幽蓝蝶舞鞭', '银河落霜刃'],
            ['紫霄龙吟剑', '幽冥紫蝶刃', '星河紫电枪', '紫玉寒冰弓', '紫焰凤凰琴', '苍穹紫雷锤', '紫莲幽光扇', '紫晶破晓戟', '幽冥紫影鞭', '紫霄凌虚杖'],
            ['金煌剑', '炽焰长枪', '琥珀流光弓', '龙鳞金斧', '破晓黄玉锤', '炎阳鞭', '流光扇', '战神金戟', '黄芒闪电刃', '日曜乾坤轮'],
            ['赤焰凤凰剑', '血玉红莲枪', '烈焰焚天弓', '赤霄神火戟', '火舞流云扇', '朱雀炎翼鞭', '赤龙焚世刃', '炎狱魔瞳镰', '炽血星辰杖', '红莲业火轮'],
            ['粉晶月刃剑', '樱花吹雪弓', '蔷薇缠绕鞭', '蜜桃梦境杖', '粉蝶幻光刃', '粉晶流光扇', '甜梦水晶枪', '粉樱魔法杖', '粉钻心语弩', '柔粉蔷薇盾']
        ];
    },
    equipArmors () {
        return [
            ['瑶池仙绡羽衣', '广寒玉兔霜甲', '昆仑玉璧战袍', '白龙吐珠云裳', '九天玄女素绫', '瑶光星辰织锦', '冰魄银丝战衣', '凌霄琼华宝衣', '雪域神女雪绒', '云隐龙鳞轻铠'],
            ['翠竹幽兰轻衫', '碧落青藤云裳', '碧眼麒麟战衣', '青鸾翔翼织锦', '苍梧古木灵袍', '绿野仙踪羽衣', '灵蛇翠蔓软甲', '翡翠琉璃长裙', '松风竹影轻裘', '春水碧于天衣'],
            ['寒冰护甲衣', '碧波守护铠', '蓝玉冰心链甲', '苍穹蓝灵披风', '深海蛟龙鳞甲', '冰魄幽光战铠', '蓝蝶轻舞护腕', '银河之盾胸甲', '鲛人织梦护腿', '碧波凌波靴'],
            ['紫云织锦袍', '幽冥紫霜甲', '星河紫霞衣', '紫玉冰心链甲', '紫焰凤凰披风', '苍穹紫雷战铠', '紫莲幽光护腕', '紫晶凌霄战裙', '幽冥紫影护腿', '紫霄逐风靴'],
            ['金辉流光锦袍', '琥珀流光战衣', '黄土龙纹长袍', '日炎金鳞铠甲', '秋菊金缎华服', '蜜蜡黄绸云裳', '凤凰涅槃黄衫', '黄沙漫天披风', '金穗流光纱裙', '辉煌金羽战袍'],
            ['烈焰红莲战甲', '赤霄火凤云裳', '朱雀焚天织锦', '赤焰龙鳞宝衣', '血色蔷薇华服', '丹霞流光长袍', '炎阳炽烈战袍', '炽火红莲披风', '火舞凤凰羽衣', '红莲业火锦衣'],
            ['粉樱绮梦裳', '甜梦粉蝶衣', '蜜桃恋曲裙', '粉晶流光铠', '樱花恋歌袍', '柔粉蔷薇甲', '粉蝶翩翩袖', '甜梦羽织衣', '粉晶幻彩裙', '蜜桃梦境袍']
        ];
    },
    equipAccessories () {
        return [
            ['瑶池白玉簪', '月华流光坠', '寒霜凝露链', '九天玄女玉佩', '云锦织梦镯', '龙涎润雪环', '白鹤衔珠珮', '昆仑雪莲花链', '瑶台仙露耳环', '银河织梦项链'],
            ['翠竹凝露簪', '碧泉幽兰链', '青藤绕梦镯', '翡翠灵叶耳环', '灵山仙草玉佩', '松柏长青戒', '翠影轻舞项链', '绿野仙踪手环', '碧波荡漾珠链', '春回大地玉珮'],
            ['碧海珊瑚簪', '冰魄幽蓝链', '深海珍珠耳环', '蓝田玉髓镯', '苍穹蓝宝坠', '鲛人泪滴珠', '碧波荡漾戒', '银河之心项链', '蓝蝶飞舞手环', '深海龙鳞珮'],
            ['紫霄流光戒', '幽冥紫蝶项链', '星河紫玉耳环', '紫玉冰心手链', '紫焰凤凰簪', '苍穹紫雷吊坠', '紫莲幽光发带', '紫晶破晓护符', '幽冥紫影指环', '紫霄凌虚玉佩'],
            ['金辉日冕簪', '琥珀流光链', '黄粱一梦镯', '皇天后土玉佩', '蜜蜡福瑞戒', '秋收万颗项链', '暖阳照耀耳环', '炎黄子孙玉珮', '金色麦田手环', '盛世繁华珠链'],
            ['赤焰凤凰翎', '血珀琉璃坠', '烈焰红宝石链', '朱雀之翼耳环', '红莲业火镯', '丹霄火凤戒', '玛瑙赤焰项链', '炽天使之泪珮', '绯红织锦手环', '火凤涅槃珠链'],
            ['粉晶梦蝶链', '樱花恋曲簪', '甜梦蔷薇戒', '蜜桃绮梦环', '粉蝶轻舞坠', '粉晶甜蜜链', '柔粉心语珥', '樱花绮梦镯', '蜜桃梦境簪', '粉蝶幻彩带']
        ];
    },
    equipSutras () {
        return [
            ['白玉净瓶', '寒霜琉璃镜', '瑶池雪莲珠', '九天玄冰尺', '月华宝莲灯', '白云隐龙笛', '玉清昆仑扇', '净世白莲座', '银河落雪琴', '碧落瑶光盘'],
            ['翠玉葫芦', '青木长生杖', '碧落灵珠', '幽冥鬼藤鞭', '万木回春图', '绿绮琴音笛', '青鸾火凤羽扇', '翠影追魂剑', '草木皆兵符', '碧泉灵泉壶'],
            ['碧波神珠', '冰魄寒玉葫', '深海龙息珠', '苍穹蓝灵珠', '鲛人织梦灯', '银河落霜瓶', '蓝玉冰心镜', '寒冰净世莲', '碧波幽兰笛', '深海龙吟佩'],
            ['紫霄神雷珠', '幽冥紫蝶翼', '星河紫玉壶', '紫玉冰心镜', '紫焰凤凰翎', '苍穹紫雷鼎', '紫莲幽光轮', '紫晶破晓琴', '幽冥紫影幡', '紫霄凌虚印'],
            ['金蛟剪', '乾坤圈', '黄金玲珑塔', '戊己杏黄旗', '轩辕黄帝鼎', '镇妖伏魔镜', '落日熔金轮', '万寿无疆葫芦', '金翅大鹏羽扇', '地黄玄玉珠'],
            ['炽焰灵珠阵图', '火凤涅槃炉鼎', '红莲业火净世碑', '血玉轮回盘', '朱雀翔天翼', '烈焰焚天炉', '丹霄火域图', '赤龙炼魂珠', '火灵炽心镜', '九转炎灵祭坛'],
            ['粉樱梦幻笛', '甜心粉蝶壶', '蜜桃恋语镜', '粉晶流光珠', '柔粉绮梦石', '樱花纷飞扇', '甜梦绮罗盘', '蜜桃幻影灯', '粉蝶织梦琴', '粉樱守护符']
        ];
    },
    // 计算炼器后的数值
    calculateCompoundGrowth (baseValue, growthTimes, growthRate = 0.1) {
        // 计算复合增长后的值  
        let result = baseValue;
        for (let i = 0; i < growthTimes; i++) {
            result *= (1 + growthRate);
        }
        return result;
    }
};
export default All;