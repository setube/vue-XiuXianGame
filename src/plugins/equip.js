const equips = {
    drawPrize (lv, type, names_a, names_b, names_c, names_d, names_e, names_f, isNewbie) {
        // 如果玩家等级为0 生成的装备等级最低为1, 如果玩家等级低于40级的话就随机生成当前等级和低于当前等级的装备
        lv = lv == 0 ? 1 : lv;
        // 如果已领取新手礼包
        if (isNewbie) lv = this.getRandomInt(1, lv);
        // 装备的抽中概率
        const weaponTypes = {
            info: { names: names_a, probability: 50 }, // 白装
            success: { names: names_b, probability: 20 }, // 绿装
            primary: { names: names_c, probability: 15 }, // 蓝装
            purple: { names: names_d, probability: 9 }, // 紫装
            warning: { names: names_e, probability: 5 }, // 金装
            danger: { names: names_f, probability: 1 } // 红装
        };
        const totalProbability = Object.values(weaponTypes).reduce((acc, { probability }) => acc + probability, 0);
        const random = Math.floor(Math.random() * totalProbability);
        let cumulativeProbability = 0;
        for (const [quality, { names, probability }] of Object.entries(weaponTypes)) {
            cumulativeProbability += probability;
            if (random < cumulativeProbability) {
                // 根据装备品质调整装备属性值
                const qualityMultiplier = { info: 1.2, success: 2, primary: 3, purple: 5, warning: 7, danger: 10 };
                const multiplier = qualityMultiplier[quality];
                const dodge = ['accessory', 'sutra'].includes(type) ? this.equip_Criticalhitrate(lv) : 0;
                const attack = ['weapon', 'accessory', 'sutra'].includes(type) ? Math.floor(this.equip_Attack(lv) * multiplier) : 0;
                const health = ['armor', 'accessory', 'sutra'].includes(type) ? Math.floor(this.equip_Health(lv) * multiplier) : 0;
                const defense = ['armor', 'accessory', 'sutra'].includes(type) ? Math.floor(this.equip_Attack(lv) * multiplier) : 0;
                const critical = ['weapon', 'accessory', 'sutra'].includes(type) ? this.equip_Criticalhitrate(lv) : 0;
                const baseEquip = {
                    id: Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2), // 随机生成装备ID
                    name: names[Math.floor(Math.random() * names.length)], //装备名字
                    type, // 装备类型
                    lock: false,
                    level: lv, // 装备等级
                    score: this.calculateEquipmentScore(dodge, attack, health, critical, defense), // 装备评分
                    dodge, // 闪避率
                    attack, // 攻击力
                    health, // 血量
                    defense, // 防御
                    critical, // 暴击率
                    // 初始数据
                    initial: {
                        dodge, // 闪避率
                        attack, // 攻击力
                        health, // 血量
                        defense, // 装备防御
                        critical // 暴击率
                    },
                    quality,
                    strengthen: 0 // 炼器等级
                };
                return baseEquip;
            }
        }
    },
    equip_Weapons (lv, isNewbie = false) {
        const names_a = [
            '白玉净尘剑', '雪魄寒冰枪', '白龙吟风弓', '月华流光扇', '白玉玄灵笛',
            '霜雪无痕鞭', '云隐白凰刃', '净世白莲杖', '冰魄寒光轮', '白玉玲珑塔'
        ];
        const names_b = [
            '翠玉青藤剑', '碧影灵蛇鞭', '绿叶风暴弓', '青木长生杖', '翡翠灵犀刃',
            '藤蔓缠绕索', '翠竹清风扇', '生命之泉壶', '绿野仙踪笛', '森罗万象轮'
        ];
        const names_c = [
            '寒冰破晓剑', '碧海潮生笛', '蓝玉冰魄弓', '苍穹蓝龙枪', '冰魄寒光剑',
            '鲛人织梦扇', '深海之怒戟', '碧波凌霄杖', '幽蓝蝶舞鞭', '银河落霜刃'
        ];
        const names_d = [
            '紫霄龙吟剑', '幽冥紫蝶刃', '星河紫电枪', '紫玉寒冰弓', '紫焰凤凰琴',
            '苍穹紫雷锤', '紫莲幽光扇', '紫晶破晓戟', '幽冥紫影鞭', '紫霄凌虚杖'
        ];
        const names_e = [
            '金煌剑', '炽焰长枪', '琥珀流光弓', '龙鳞金斧', '破晓黄玉锤',
            '炎阳鞭', '流光扇', '战神金戟', '黄芒闪电刃', '日曜乾坤轮'
        ];
        const names_f = [
            '赤焰凤凰剑', '血玉红莲枪', '烈焰焚天弓', '赤霄神火戟', '火舞流云扇',
            '朱雀炎翼鞭', '赤龙焚世刃', '炎狱魔瞳镰', '炽血星辰杖', '红莲业火轮'
        ];
        return this.drawPrize(lv, 'weapon', names_a, names_b, names_c, names_d, names_e, names_f, isNewbie);
    },
    equip_Armors (lv, isNewbie = false) {
        const names_a = [
            '瑶池仙绡羽衣', '广寒玉兔霜甲', '昆仑玉璧战袍', '白龙吐珠云裳', '九天玄女素绫',
            '瑶光星辰织锦', '冰魄银丝战衣', '凌霄琼华宝衣', '雪域神女雪绒', '云隐龙鳞轻铠'
        ];
        const names_b = [
            '翠竹幽兰轻衫', '碧落青藤云裳', '碧眼麒麟战衣', '青鸾翔翼织锦', '苍梧古木灵袍',
            '绿野仙踪羽衣', '灵蛇翠蔓软甲', '翡翠琉璃长裙', '松风竹影轻裘', '春水碧于天衣'
        ];
        const names_c = [
            '寒冰护甲衣', '碧波守护铠', '蓝玉冰心链甲', '苍穹蓝灵披风', '深海蛟龙鳞甲',
            '冰魄幽光战铠', '蓝蝶轻舞护腕', '银河之盾胸甲', '鲛人织梦护腿', '碧波凌波靴'
        ];
        const names_d = [
            '紫云织锦袍', '幽冥紫霜甲', '星河紫霞衣', '紫玉冰心链甲', '紫焰凤凰披风',
            '苍穹紫雷战铠', '紫莲幽光护腕', '紫晶凌霄战裙', '幽冥紫影护腿', '紫霄逐风靴'
        ];
        const names_e = [
            '金辉流光锦袍', '琥珀流光战衣', '黄土龙纹长袍', '日炎金鳞铠甲', '秋菊金缎华服',
            '蜜蜡黄绸云裳', '凤凰涅槃黄衫', '黄沙漫天披风', '金穗流光纱裙', '辉煌金羽战袍'
        ];
        const names_f = [
            '烈焰红莲战甲', '赤霄火凤云裳', '朱雀焚天织锦', '赤焰龙鳞宝衣', '血色蔷薇华服',
            '丹霞流光长袍', '炎阳炽烈战袍', '炽火红莲披风', '火舞凤凰羽衣', '红莲业火锦衣'
        ];
        return this.drawPrize(lv, 'armor', names_a, names_b, names_c, names_d, names_e, names_f, isNewbie);
    },
    equip_Accessorys (lv, isNewbie = false) {
        const names_a = [
            '瑶池白玉簪', '月华流光坠', '寒霜凝露链', '九天玄女玉佩', '云锦织梦镯',
            '龙涎润雪环', '白鹤衔珠珮', '仙山雪莲花链', '瑶台仙露耳环', '银河织梦项链'
        ];
        const names_b = [
            '翠竹凝露簪', '碧泉幽兰链', '青藤绕梦镯', '翡翠灵叶耳环', '灵山仙草玉佩',
            '松柏长青戒', '翠影轻舞项链', '绿野仙踪手环', '碧波荡漾珠链', '春回大地玉珮'
        ];
        const names_c = [
            '碧海珊瑚簪', '冰魄幽蓝链', '深海珍珠耳环', '蓝田玉髓镯', '苍穹蓝宝坠',
            '鲛人泪滴珠', '碧波荡漾戒', '银河之心项链', '蓝蝶飞舞手环', '深海龙鳞珮'
        ];
        const names_d = [
            '紫霄流光戒', '幽冥紫蝶项链', '星河紫玉耳环', '紫玉冰心手链', '紫焰凤凰簪',
            '苍穹紫雷吊坠', '紫莲幽光发带', '紫晶破晓护符', '幽冥紫影指环', '紫霄凌虚玉佩'
        ];
        const names_e = [
            '金辉日冕簪', '琥珀流光链', '黄粱一梦镯', '皇天后土玉佩', '蜜蜡福瑞戒',
            '秋收万颗项链', '暖阳照耀耳环', '炎黄子孙玉珮', '金色麦田手环', '盛世繁华珠链'
        ];
        const names_f = [
            '赤焰凤凰翎', '血珀琉璃坠', '烈焰红宝石链', '朱雀之翼耳环', '红莲业火镯',
            '丹霄火凤戒', '玛瑙赤焰项链', '炽天使之泪珮', '绯红织锦手环', '火凤涅槃珠链'
        ];
        return this.drawPrize(lv, 'accessory', names_a, names_b, names_c, names_d, names_e, names_f, isNewbie);
    },
    equip_Sutras (lv, isNewbie = false) {
        const names_a = [
            '白玉净瓶', '寒霜琉璃镜', '瑶池雪莲珠', '九天玄冰尺', '月华宝莲灯',
            '白云隐龙笛', '玉清昆仑扇', '净世白莲座', '银河落雪琴', '碧落瑶光盘'
        ];
        const names_b = [
            '翠玉葫芦', '青木长生杖', '碧落灵珠', '幽冥鬼藤鞭', '万木回春图',
            '绿绮琴音笛', '青鸾火凤羽扇', '翠影追魂剑', '草木皆兵符', '碧泉灵泉壶'
        ];
        const names_c = [
            '碧波神珠', '冰魄寒玉葫', '深海龙息珠', '苍穹蓝灵珠', '鲛人织梦灯',
            '银河落霜瓶', '蓝玉冰心镜', '寒冰净世莲', '碧波幽兰笛', '深海龙吟佩'
        ];
        const names_d = [
            '紫霄神雷珠', '幽冥紫蝶翼', '星河紫玉壶', '紫玉冰心镜', '紫焰凤凰翎',
            '苍穹紫雷鼎', '紫莲幽光轮', '紫晶破晓琴', '幽冥紫影幡', '紫霄凌虚印'
        ];
        const names_e = [
            '金蛟剪', '乾坤圈', '黄金玲珑塔', '戊己杏黄旗', '轩辕黄帝鼎',
            '镇妖伏魔镜', '落日熔金轮', '万寿无疆葫芦', '金翅大鹏羽扇', '地黄玄玉珠'
        ];
        const names_f = [
            '炽焰灵珠阵图', '火凤涅槃炉鼎', '红莲业火净世碑', '血玉轮回盘', '朱雀翔天翼',
            '烈焰焚天炉', '丹霄火域图', '赤龙炼魂珠', '火灵炽心镜', '九转炎灵祭坛'
        ];
        return this.drawPrize(lv, 'sutra', names_a, names_b, names_c, names_d, names_e, names_f, isNewbie);
    },
    equip_Attack (lv) {
        return this.getRandomInt(10, 50) * lv;
    },
    equip_Health (lv) {
        return this.getRandomInt(100, 500) * lv;
    },
    equip_Criticalhitrate () {
        return this.getRandomFloatInRange(0.01, 0.05);
    },
    // equip_Defense (lv, isNewbie = true) {
    //     if (lv >= 1 && lv <= 5) {
    //         return this.getRandomInt(15, 150) * lv;
    //     } else if (lv >= 6 && lv <= 10) {
    //         return this.getRandomInt(150, 300) * lv;
    //     } else {
    //         return this.getRandomInt(300, 500) * lv;
    //     }
    // },
    getRandomInt (min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    getRandomFloatInRange (min, max) {
        return Math.random() * (max - min) + min;
    },
    // 计算装备评分
    calculateEquipmentScore (dodge = 0, attack = 0, health = 0, critical = 0, defense = 0) {
        // 评分权重
        const weights = {
            attack: 1.5, // 攻击
            health: 1.0, // 气血
            defense: 1.2, // 防御
            critRate: 1.8, // 暴击
            dodgeRate: 1.6 //闪避
        };
        // 计算评分
        const score = (
            dodge * weights.dodgeRate * 100 +
            attack * weights.attack +
            (health / 100) * weights.health +
            defense * weights.defense +
            critical * weights.critRate * 100
        );
        return Math.floor(score);
    }
};
export default equips;
