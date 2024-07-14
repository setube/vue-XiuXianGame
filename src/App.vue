<template>
    <div class="game-container-wrapper" draggable="true">
        <div class="github-corner">
            <a href="https://github.com/setube/vue-XiuXianGame" aria-label="View source on GitHub">
                <svg width="80" height="80" viewBox="0 0 250 250" style="fill:#151513; color:#fff; position: absolute; top: 0; border: 0; right: 0; z-index: 2;" aria-hidden="true">
                    <path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z" />
                    <path d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2" fill="currentColor" style="transform-origin: 130px 106px;" />
                    <path d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z" fill="currentColor" />
                </svg>
            </a>
        </div>
        <div class="game-container">
            <h1>Vue 文字修仙游戏</h1>
            <div class="story">
                <p>{{ storyText }}</p>
            </div>
            <div class="attributes">
                <div class="attribute-box">
                    <el-tag class="attribute">等级: {{ player.level }}</el-tag>
                    <el-tag class="attribute">修为: {{ player.cultivation }}/{{ player.maxCultivation }}</el-tag>
                    <el-tag class="attribute">血量: {{ player.health }}/{{ player.maxHealth }}</el-tag>
                    <el-tag class="attribute">法力: {{ player.mana }}/{{ player.maxMana }}</el-tag>
                    <el-tag class="attribute">攻击: {{ player.attack }}</el-tag>
                    <el-tag class="attribute">防御: {{ player.defense }}</el-tag>
                </div>
            </div>
            <div class="backpack-box">
                <el-tag class="backpack">
                    武器: {{ player.equipment.weapon ? '已装备' : '无' }} | 护甲: {{ player.equipment.armor ? '已装备' : '无' }} |
                    饰品: {{ player.equipment.accessory ? '已装备' : '无' }} | 法宝 {{ player.equipment.sutra ? '已装备' : '无' }}
                </el-tag>
                <el-tag>背包: {{ player.inventory.join(', ') || '空' }}</el-tag>
            </div>
            <div class="actions">
                <el-button v-for="(action, index) in actions" :key="index" @click="action.handler">{{ action.text }}</el-button>
            </div>
        </div>
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
                if (!this.player.cultivation) this.storyText = '欢迎来到《文字修仙游戏》，你的修仙之旅开始了。';
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
        min-height: 90vh;
        -webkit-user-drag:none
    }

    .github-corner {
        position: fixed;
        top: 0;
        right: 0;
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

    .backpack-box {
        margin-top: 4px;
        display: flex;
        flex-direction: column;
    }

    .backpack {
        margin-bottom: 8px;
    }

    .actions {
        margin: 1rem 0;
    }
</style>