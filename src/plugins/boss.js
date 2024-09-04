const boss = {
    drawPrize (lv) {
        const bossInfo = this.boss_Names();
        // 血量
        const health = this.getRandomInt(50000, 100000) * lv;
        // 攻击
        const attack = this.getRandomInt(5000, 10000) * lv;
        // 防御
        const defense = this.getRandomInt(1000, 10000) * lv;
        // 闪避
        const dodge = this.getRandomFloatInRange(0.1, 0.8);
        // 暴击
        const critical = this.getRandomFloatInRange(0.1, 1);
        return {
            name: bossInfo.name,
            text: this.boss_Text(),
            time: Math.floor(Date.now() / 1000),
            desc: bossInfo.description,
            level: 144,
            dodge,
            attack,
            health,
            defense,
            conquer: false,
            critical,
            maxhealth: health
        };
    },
    // boss掉落
    boss_Equip (lv) {
        const weapon = [
            '赤焰凤凰剑', '血玉红莲枪', '烈焰焚天弓', '赤霄神火戟', '火舞流云扇',
            '朱雀炎翼鞭', '赤龙焚世刃', '炎狱魔瞳镰', '炽血星辰杖', '红莲业火轮'
        ];
        const armor = [
            '烈焰红莲战甲', '赤霄火凤云裳', '朱雀焚天织锦', '赤焰龙鳞宝衣', '血色蔷薇华服',
            '丹霞流光长袍', '炎阳炽烈战袍', '炽火红莲披风', '火舞凤凰羽衣', '红莲业火锦衣'
        ];
        const accessory = [
            '赤焰凤凰翎', '血珀琉璃坠', '烈焰红宝石链', '朱雀之翼耳环', '红莲业火镯',
            '丹霄火凤戒', '玛瑙赤焰项链', '炽天使之泪珮', '绯红织锦手环', '火凤涅槃珠链'
        ];
        const sutra = [
            '炽焰灵珠阵图', '火凤涅槃炉鼎', '红莲业火净世碑', '血玉轮回盘', '朱雀翔天翼',
            '烈焰焚天炉', '丹霄火域图', '赤龙炼魂珠', '火灵炽心镜', '九转炎灵祭坛'
        ];
        const weaponTypes = {
            weapon: { names: weapon, probability: 25 },
            armor: { names: armor, probability: 25 },
            accessory: { names: accessory, probability: 25 },
            sutra: { names: sutra, probability: 25 }
        };
        const totalProbability = Object.values(weaponTypes).reduce((acc, { probability }) => acc + probability, 0);
        const random = Math.floor(Math.random() * totalProbability);
        let cumulativeProbability = 0;
        for (const [quality, { names, probability }] of Object.entries(weaponTypes)) {
            cumulativeProbability += probability;
            if (random < cumulativeProbability) {
                const dodge = this.getRandomFloatInRange(0.05, 0.1);
                const Attack = this.getRandomInt(500, 1000) * lv * 10;
                const Health = this.getRandomInt(5000, 10000) * lv * 10;
                const defense = this.getRandomInt(500, 1000) * lv * 10;
                const Criticalhitrate = this.getRandomFloatInRange(0.05, 0.1);
                return {
                    id: Date.now(), // 装备ID
                    name: names[Math.floor(Math.random() * names.length)], //装备名字
                    type: quality, // 装备类型
                    level: lv, // 装备等级
                    score: this.calculateEquipmentScore(dodge, Attack, Health, Criticalhitrate, defense), // 装备评分
                    dodge: ['accessory', 'sutra'].includes(quality) ? dodge : 0, // 闪避率
                    attack: ['weapon', 'accessory', 'sutra'].includes(quality) ? Attack : 0, // 攻击力
                    health: ['armor', 'accessory', 'sutra'].includes(quality) ? Health : 0, // 血量
                    quality: 'danger', // 装备品质
                    // 初始数据
                    initial: {
                        dodge: ['accessory', 'sutra'].includes(quality) ? dodge : 0, // 闪避率
                        attack: ['weapon', 'accessory', 'sutra'].includes(quality) ? Attack : 0, // 攻击力
                        health: ['armor', 'accessory', 'sutra'].includes(quality) ? Health : 0, // 血量
                        defense: ['accessory', 'sutra'].includes(quality) ? defense : 0, // 装备防御
                        critical: ['weapon', 'accessory', 'sutra'].includes(quality) ? Criticalhitrate : 0, // 暴击率
                    },
                    defense: ['accessory', 'sutra'].includes(quality) ? defense : 0, // 装备防御
                    critical: ['weapon', 'accessory', 'sutra'].includes(quality) ? Criticalhitrate : 0 // 暴击率
                };
            }
        }
    },
    // boss语录
    boss_Text () {
        const text = [
            '你的时代已经结束，现在，是我主宰一切的时候了。',
            '你的努力，终究只是为我铺就了通往胜利的道路。',
            '战胜你，对我来说不过是举手之劳，你的实力，不过如此。',
            '你的生命，在我的手中如蝼蚁般脆弱，你的死亡，只是我计划中的一环。',
            '你的失败，证明了我的智慧与力量无可匹敌，而你，只是我的垫脚石。',
            '你的存在，曾让我感到一丝威胁，但现在，你已成为我脚下的尘埃。',
            '你的勇气可嘉，但可惜，勇气并不能改变结果，你最终还是败在了我的脚下。',
            '你的死，将是我传奇中的一笔，而你，将永远被我踩在脚下。',
            '你的挣扎与反抗，不过是徒劳无功，你的命运，早已注定。',
            '你的终结，是我迈向更高峰的开始，你的存在，对我来说已无任何意义。',
            '你的死亡，将证明我的强大与不可战胜，而你，将永远成为我的手下败将。',
            '你的遗言，对我来说毫无意义，因为你已经无法再影响我的计划。',
            '你的逝去，只是宇宙间的一次微小波动，而我，将继续书写我的传奇。',
            '你的失败，是我成功路上的一个注脚，而你，将永远无法摆脱这个污点。',
            '你的生命之火已经熄灭，而我，将继续燃烧，照亮整个世界。',
            '你的死亡，让我更加坚信自己的道路是正确的，而你，只是我路上的一个过客。',
            '你的存在，曾让我有过一丝犹豫，但现在，我已经没有任何顾虑，因为我已经彻底战胜了你。',
            '你的终结，是我力量的证明，而你，将永远无法逃脱这个宿命。',
            '你的死亡，将是我成就伟大事业的基石，而你，将永远被世人遗忘。',
            '你的挑战，虽然激烈，但终究无法撼动我的地位，你的死亡，只是我辉煌人生中的一个注脚。'
        ];
        return text[Math.floor(Math.random() * text.length)];
    },
    boss_Names () {
        const boss = [
            { name: '烛龙神尊', description: '乃钟山之神，睁眼为昼，闭眼为夜，呼吸间风云变幻，掌控着时间的流转。' },
            { name: '幽冥鬼帝', description: '传说中幽冥界的至高统治者，掌管生死轮回，其力量深不可测，能召唤万千亡灵为其所用。' },
            { name: '苍穹魔尊', description: '诞生于九天之上，因贪恋凡间情感而堕入魔道，拥有操控天地元素、撕裂虚空的能力。' },
            { name: '龙皇傲天', description: '龙族中的至尊，身披璀璨龙鳞，掌握着古老龙族的所有秘辛与力量，其威严令万兽臣服。' },
            { name: '凤舞九天', description: '凤凰一族的女王，拥有不死之身与涅槃重生的能力，其羽翼轻挥，即可掀起滔天火焰，焚尽一切。' },
            { name: '雷神天尊', description: '天界雷神转世，手持雷神锤，能召唤九天神雷，一击之下，山河破碎，万物寂灭。' },
            { name: '幽冥血皇', description: '幽冥界中的古老存在，以鲜血为食，其力量源自于无尽的杀戮与怨念，令人闻风丧胆。' },
            { name: '玄冰龙神', description: '来自极北之地的神秘生物，融合了龙与冰元素的力量，其身躯坚不可摧，能冻结世间万物。' },
            { name: '金翅大鹏王', description: '大鹏一族中的王者，拥有遮天蔽日的双翼，速度之快，可瞬息万里，其利爪足以撕裂空间。' },
            { name: '混沌魔君', description: '诞生于混沌之初的古老魔物，其力量源自于宇宙的本源，能够扭曲现实，吞噬万物，是天地间最可怕的存在之一。' }
        ];
        return boss[Math.floor(Math.random() * boss.length)];
    },
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
            dodge * weights.dodgeRate +
            attack * weights.attack +
            (health / 100) * weights.health +
            defense * weights.defense +
            critical * weights.critRate
        );
        return Math.floor(score);
    }
};
export default boss;