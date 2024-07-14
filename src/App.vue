<template>
    <div class="game-container-wrapper">
        <el-row class="game-container">
            <h1>仙途奇缘</h1>
            <div class="story">
                <p>{{ storyText }}</p>
            </div>
            <el-row class="attributes">
                <div class="attribute-box">
                    <el-tag class="attribute">等级: {{ player.level }}</el-tag>
                    <el-tag class="attribute">修为: {{ player.cultivation }}/{{ player.maxCultivation }}</el-tag>
                    <el-tag class="attribute">血量: {{ player.health }}/{{ player.maxHealth }}</el-tag>
                    <el-tag class="attribute">法力: {{ player.mana }}/{{ player.maxMana }}</el-tag>
                    <el-tag class="attribute">攻击: {{ player.attack }}</el-tag>
                    <el-tag class="attribute">防御: {{ player.defense }}</el-tag>
                    <el-tag class="attribute">
                        武器: {{ player.equipment.weapon || '无' }} | 护甲: {{ player.equipment.armor || '无' }} |
                        饰品: {{ player.equipment.accessory || '无' }} | 法宝 {{ player.equipment.sutra || '无' }}
                    </el-tag>
                    <el-tag class="attribute">背包: {{ player.inventory.join(', ') || '空' }}</el-tag>
                </div>
            </el-row>
            <el-row class="actions">
                <el-button v-for="(action, index) in actions" :key="index" @click="action.handler">{{ action.text }}</el-button>
            </el-row>
        </el-row>
    </div>
</template>

<script>
    export default {
        data () {
            return {
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
                    // 当前修为
                    cultivation: 0,
                    // 下个等级所需修为
                    maxCultivation: 100,
                },
                // 野怪属性
                monster: {
                    // 名称
                    name: '',
                    // 血量
                    health: 0,
                    // 攻击
                    attack: 0
                },
                // 按钮
                actions: [
                    { text: '修炼', handler: this.cultivate },
                    { text: '探索', handler: this.explore }
                ],
                storyText: ''
            };
        },
        mounted () {
            if (this.$store.state.player) {
                this.player = this.$store.state.player;
            }
            this.startGame();
        },
        methods: {
            // 初始化游戏
            startGame () {
                if (!this.player.cultivation) this.storyText = '欢迎来到《仙途奇缘》，你的修仙之旅开始了。';
                this.actions = [
                    { text: '修炼', handler: this.cultivate },
                    { text: '探索', handler: this.explore }
                ];
                // 初始化玩家当前血量
                this.player.health = 100;
                this.$store.commit('setPlayer', this.player);
            },
            // 修炼逻辑
            cultivate () {
                // 如果当前修为小于总修为
                if (this.player.cultivation < this.player.maxCultivation) {
                    // 增加当前修为
                    this.player.cultivation += 10;
                    this.storyText = `你开始冥想，吸收周围的灵气。修为提升了！当前修为：${this.player.cultivation}/${this.player.maxCultivation}`;
                    // 如果当前修为大于等于总修为
                    if (this.player.cultivation >= this.player.maxCultivation) {
                        // 增加等级
                        this.player.level++;
                        // 增加攻击
                        this.player.attack += 5;
                        // 初始化血量
                        this.player.health = 100;
                        // 增加玩家法力
                        this.player.mana = this.player.maxMana;
                        // 增加玩家总修为
                        this.player.maxCultivation = Math.floor(100 * Math.pow(2, this.player.level));
                        this.storyText = `恭喜你突破了！当前等级：${this.player.level}，修为：${this.player.cultivation}/${this.player.maxCultivation}`;
                        this.$store.commit('setPlayer', this.player);
                    }
                } else {
                    this.storyText = '你已经达到了当前等级的修为上限，需要突破到下一个等级。';
                }
                this.actions = [
                    { text: '修炼', handler: this.cultivate },
                    { text: '探索', handler: this.explore }
                ];
            },
            // 探索逻辑
            explore () {
                if (Math.random() < 0.5) {
                    // 遇到怪物
                    this.encounterMonster();
                } else {
                    // 发现道具
                    this.findTreasure();
                }
            },
            // 遇怪逻辑
            encounterMonster () {
                // 玩家等级
                const level = this.player.level;
                // 野怪名称
                const names = ['蛟龙', '梦魇', '狐妖', '雷鸟', '妖狐', '狻猊', '螭吻', '车尾', '蛤蟆精', '白泽'];
                // 野怪属性
                this.monster = {
                    // 名称
                    name: `${names[Math.floor(Math.random() * names.length)]}`,
                    // 血量
                    health: 100 * level,
                    // 攻击
                    attack: 30 * level,
                    // 防御
                    defense: 15 * level
                };
                this.storyText = `你遇到了一只${this.monster.name}！`;
                this.actions = [
                    { text: '攻击', handler: () => this.fightMonster(this.monster) },
                    { text: '逃跑', handler: this.runAway }
                ];
            },
            // 战斗
            fightMonster (monster) {
                // 野怪伤害计算
                const monsterAttack = monster.attack; // 野怪攻击
                const playerDefense = this.player.defense; // 玩家防御
                const monsterHarm = Math.max(0, Math.floor(monsterAttack - playerDefense)); // 野怪伤害
                this.player.health -= monsterHarm; // 扣除玩家血量

                // 玩家伤害计算
                const playerAttack = this.player.attack; // 玩家攻击
                const monsterDefense = monster.defense; // 野怪防御
                const playerHarm = Math.max(0, Math.floor(playerAttack - monsterDefense)); // 野怪伤害
                monster.health -= playerHarm; // 扣除野怪血量
                this.player.mana--; //扣除玩家法力
                this.$store.commit('setPlayer', this.player);
                if (!this.player.mana) {
                    this.storyText = '你的法力已经用光了, 请回家升级补充法力';
                    this.actions = [
                        { text: '回到家里', handler: this.startGame }
                    ];
                    return;
                }
                // 野怪血量小于等于0
                if (monster.health <= 0) {
                    this.storyText = `你击败了${monster.name}！获得了一些修为和一颗灵丹。`;
                    this.actions = [
                        { text: '探索', handler: this.explore },
                        { text: '修炼', handler: this.cultivate },
                        { text: `食用灵丹`, handler: () => this.equipItem('灵丹') }
                    ];
                    // 玩家血量小于等于0
                } else if (this.player.health <= 0) {
                    this.storyText = '你被击败了。';
                    this.actions = [
                        { text: '回到家里', handler: this.startGame }
                    ];
                    // 继续攻击
                } else {
                    this.storyText = `你攻击了${monster.name}，造成了${playerHarm}点伤害。${monster.name}攻击了你，造成了${monsterHarm}点伤害。`;
                    this.actions = [
                        { text: '攻击', handler: () => this.fightMonster(monster) },
                        { text: '逃跑', handler: () => this.runAway(monster) }
                    ];
                }
            },
            // 逃跑
            runAway () {
                if (Math.random() < 0.5) {
                    this.storyText = '逃跑失败，请继续战斗。';
                    this.actions = [
                        { text: '攻击', handler: () => this.fightMonster(this.monster) }
                    ];
                } else {
                    this.storyText = '你选择了逃跑，安全返回了修炼地点。';
                    this.actions = [
                        { text: '修炼', handler: this.cultivate },
                        { text: '探索', handler: this.explore }
                    ];
                }
            },
            // 发现道具
            findTreasure () {
                // 道具列表
                const treasures = ['法宝', '灵丹', '武器', '护甲', '饰品'];
                // 随机道具
                const foundTreasure = treasures[Math.floor(Math.random() * treasures.length)];
                this.storyText = `你发现了一个宝箱，打开后获得了${foundTreasure}。`;
                // 玩家获得道具
                this.player.inventory.push(foundTreasure);
                this.actions = [
                    { text: '探索', handler: this.explore },
                    { text: '修炼', handler: this.cultivate },
                    { text: `${foundTreasure == '灵丹' ? '食用' : '装备'}${foundTreasure}`, handler: () => this.equipItem(foundTreasure) }
                ];
                this.$store.commit('setPlayer', this.player);
            },
            // 穿装备
            equipItem (item) {
                // 判断是否装备了这些装备
                if (['武器', '护甲', '饰品', '法宝'].includes(item)) {
                    if (item === '武器') {
                        this.player.attack += 10;
                        this.player.equipment.weapon = item;
                    } else if (item === '护甲') {
                        this.player.defense += 10;
                        this.player.equipment.armor = item;
                    } else if (item === '饰品') {
                        this.player.attack += 5;
                        this.player.defense += 5;
                        this.player.equipment.accessory = item;
                    } else if (item === '法宝') {
                        this.player.attack += 10;
                        this.player.defense += 10;
                        this.player.equipment.sutra = item;
                    }
                    this.player.inventory = this.player.inventory.filter(i => i !== item);
                    this.storyText = `你装备了${item}。`;
                } else {
                    // 随机数字
                    const event = Math.random();
                    if (event < 0.25) {
                        //增加攻击
                        this.player.attack += 5;
                        this.storyText = `你食用灵丹后增加了5攻击`;
                    } else if (event < 0.5) {
                        // 发现防御
                        this.player.defense += 5;
                        this.storyText = `你食用灵丹后增加了5防御`;
                    } else {
                        this.player.maxMana += 10;
                        this.storyText = `你食用灵丹后法力总量增加了10`;
                    }
                    this.player.inventory = this.player.inventory.filter(i => i !== item);
                }
                this.$store.commit('setPlayer', this.player);
                this.actions = [
                    { text: '修炼', handler: this.cultivate },
                    { text: '探索', handler: this.explore }
                ];
            }
        }
    };
</script>

<style scoped>
    .game-container-wrapper {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
    }

    .game-container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        background-color: #fff;
        border-radius: 10px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        text-align: center;
    }

    .attributes {
        display: flex;
        justify-content: center;
    }

    .attribute {
        width: calc(50% - 8px);
        margin: 4px;
    }

    .actions {
        margin: 1rem 0;
    }
</style>