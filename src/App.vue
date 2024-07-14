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
                <p v-html="storyText" v-if="ismonster" @click="openMonsterInfo"></p>
                <p v-else>{{ storyText }}</p>
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
                    武器: <el-tag :type="player.equipment.weapon?.level" :closable="player.equipment.weapon?.name ? true : false" @close="equipmentClose('weapon')" @click="equipmentInfo('weapon')">{{ player.equipment.weapon?.name || '无'}}</el-tag>
                    护甲: <el-tag :type="player.equipment.armor?.level" :closable="player.equipment.armor?.name ? true : false" @close="equipmentClose('armor')" @click="equipmentInfo('armor')">{{ player.equipment.armor?.name || '无'}}</el-tag>
                    饰品: <el-tag :type="player.equipment.accessory?.level" :closable="player.equipment.accessory?.name ? true : false" @close="equipmentClose('accessory')" @click="equipmentInfo('accessory')">{{ player.equipment.accessory?.name || '无'}}</el-tag>
                    法宝: <el-tag :type="player.equipment.sutra?.level" :closable="player.equipment.sutra?.name ? true : false" @close="equipmentClose('sutra')" @click="equipmentInfo('sutra')">{{ player.equipment.sutra?.name || '无'}}</el-tag>
                </el-tag>
                <el-tag class="inventory-box" v-if="player.inventory.length > 0">
                    背包: <el-tag class="inventory-item" :type="item?.level" v-for="(item, index) in player.inventory" :key="index" closable @close="inventoryClose(index)" @click="inventory(index, item.type)">{{item?.name}}</el-tag>
                </el-tag>
                <el-tag v-else>背包: 空</el-tag>
            </div>
            <div class="actions">
                <el-button v-for="(action, index) in actions" :key="index" @click="action.handler">{{ action.text }}</el-button>
            </div>
        </div>
    </div>
</template>

<script>
    import monster from '@/plugins/monster';
    import equip from '@/plugins/equip';

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
                        sutra: {
                            name: '',
                            type: '',
                            level: '',
                            attack: 0,
                            health: 0,
                            defense: 0,
                        },
                        // 护甲
                        armor: {
                            name: '',
                            type: '',
                            level: '',
                            attack: 0,
                            health: 0,
                            defense: 0,
                        },
                        // 武器
                        weapon: {
                            name: '',
                            type: '',
                            level: '',
                            attack: 0,
                            health: 0,
                            defense: 0,
                        },
                        // 饰品
                        accessory: {
                            name: '',
                            type: '',
                            level: '',
                            attack: 0,
                            health: 0,
                            defense: 0,
                        }
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
                storyText: '',
                ismonster: false
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
                this.player.health = this.player.maxHealth;
                this.$store.commit('setPlayer', this.player);
            },
            // 修炼逻辑
            cultivate () {
                this.ismonster = false;
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
                // 野怪属性
                this.monster = {
                    // 名称
                    name: monster.monster_Names(level),
                    // 血量
                    health: monster.monster_Health(level),
                    // 攻击
                    attack: monster.monster_Attack(level),
                    // 防御
                    defense: monster.monster_Attack(level)
                };
                this.ismonster = true;
                this.storyText = `你遇到了<span class="el-tag el-tag--danger">${this.monster.name}</span>`;
                this.actions = [
                    { text: '发起攻击', handler: () => this.fightMonster(this.monster) },
                    { text: '立马逃跑', handler: this.runAway }
                ];
            },
            openMonsterInfo () {
                this.$alert('', this.monster.name, {
                    message: `<div class="monsterinfo">
                        <p>等级: ${this.player.level}</p>
                        <p>血量: ${this.monster.health}</p>
                        <p>攻击: ${this.monster.attack}</p>
                        <p>防御: ${this.monster.defense}</p>
                    </div>`,
                    confirmButtonText: '知道了',
                    dangerouslyUseHTMLString: true,
                });
            },
            // 战斗
            fightMonster (monster) {
                this.ismonster = true;
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
                    const names = [
                        '九转还魂丹',
                        '太上老君仙丹',
                        '蟠桃玉露丸',
                        '瑶池金丹',
                        '龙凤呈祥丹',
                        '万年灵芝丸',
                        '玄冰碧火丹',
                        '天罡地煞丹',
                        '麒麟血玉丹',
                        '幽冥黄泉丹'
                    ];
                    const name = names[Math.floor(Math.random() * names.length)];
                    this.storyText = `你击败了${monster.name}获得了一些修为和一颗${name}。`;
                    this.player.cultivation += 10;
                    this.actions = [
                        {
                            text: `食用灵丹`, handler: () => {
                                const lv = this.player.level;
                                let RandomInt = 0;
                                if (lv >= 1 || lv <= 5) {
                                    RandomInt = equip.getRandomInt(10, 50) * lv;
                                } else if (lv >= 6 || lv <= 10) {
                                    RandomInt = equip.getRandomInt(100, 150) * lv;
                                } else {
                                    RandomInt = equip.getRandomInt(150, 300) * lv;
                                }
                                this.player.mana += RandomInt;
                                this.player.maxMana += RandomInt;
                                this.storyText = `食用${name}后你增加了${RandomInt}点法力`;
                                this.actions = [
                                    { text: '继续探索', handler: this.explore },
                                    { text: '继续修炼', handler: this.cultivate }
                                ]
                            }
                        }
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
                        { text: '发起攻击', handler: () => this.fightMonster(monster) },
                        { text: '立马逃跑', handler: () => this.runAway(monster) }
                    ];
                }
            },
            // 逃跑
            runAway () {
                if (Math.random() < 0.5) {
                    this.storyText = '逃跑失败，请继续战斗。';
                    this.actions = [
                        { text: '发起攻击', handler: () => this.fightMonster(this.monster) }
                    ];
                } else {
                    this.storyText = '你选择了逃跑，安全返回了修炼地点。';
                    this.actions = [
                        { text: '继续修炼', handler: this.cultivate },
                        { text: '继续探索', handler: this.explore }
                    ];
                }
            },
            // 发现道具
            findTreasure () {
                const randomInt = equip.getRandomInt(1, 4);
                let equipItem = null;
                if (randomInt == 1) {
                    // 武器
                    equipItem = equip.equip_Weapons(this.player.level);
                } else if (randomInt == 2) {
                    // 护甲
                    equipItem = equip.equip_Armors(this.player.level);
                } else if (randomInt == 3) {
                    // 饰品
                    equipItem = equip.equip_Accessorys(this.player.level);
                } else if (randomInt == 4) {
                    // 法宝
                    equipItem = equip.equip_Sutras(this.player.level);
                }

                this.storyText = equipItem?.name ? `你发现了一个宝箱，打开后获得了${equipItem.name}。` : '你发现了一个宝箱，打开后箱子里是空的。';
                // 玩家获得道具
                if (equipItem?.name) {
                    this.player.inventory.push(equipItem);
                }
                this.actions = [
                    { text: '继续修炼', handler: this.cultivate },
                    { text: '继续探索', handler: this.explore }
                ];
                this.$store.commit('setPlayer', this.player);
            },
            // 删除道具
            inventoryClose (index) {
                this.$confirm(`你确定要丢弃${this.player.inventory[index].name}吗?`, '道具丢弃通知', {
                    cancelButtonText: '取消',
                    confirmButtonText: '确定'
                }).then(() => {
                    this.player.inventory.splice(index, 1);
                    this.$store.commit('setPlayer', this.player);
                }).catch(() => { });
            },
            // 道具信息
            inventory (index, type) {
                const level = {
                    info: 'C',
                    danger: 'S',
                    success: 'B',
                    warning: 'A'
                };
                this.$confirm('', this.player.inventory[index].name, {
                    message: `<div class="monsterinfo">
                        <p>等级: ${level[this.player.inventory[index].level]}</p>
                        <p>血量: ${this.player.inventory[index].health}</p>
                        <p>攻击: ${this.player.inventory[index].attack}</p>
                        <p>防御: ${this.player.inventory[index].defense}</p>
                    </div>`,
                    cancelButtonText: '知道了',
                    confirmButtonText: '立即装备',
                    dangerouslyUseHTMLString: true,
                }).then(() => {
                    this.equipItem(index, type);
                }).catch(() => { });
            },
            // 装备信息
            equipmentInfo (type) {
                const equipment = this.player.equipment[type];
                const level = {
                    info: 'C',
                    danger: 'S',
                    success: 'B',
                    warning: 'A'
                };
                this.$alert('', equipment.name, {
                    message: `<div class="monsterinfo">
                        <p>等级: ${level[equipment.level]}</p>
                        <p>血量: ${equipment.health}</p>
                        <p>攻击: ${equipment.attack}</p>
                        <p>防御: ${equipment.defense}</p>
                    </div>`,
                    dangerouslyUseHTMLString: true,
                }).catch(() => { });
            },
            // 穿装备
            equipItem (index, type) {
                // 如果当前类型的装备已经穿戴，则将其放回背包
                if (this.player.equipment[type]) {
                    let currentEquippedItem = this.player.equipment[type];

                    // 更新玩家属性，移除当前穿戴装备的属性加成
                    this.player.health -= currentEquippedItem.health;
                    this.player.attack -= currentEquippedItem.attack;
                    this.player.defense -= currentEquippedItem.defense;
                    this.player.maxHealth -= currentEquippedItem.health;

                    // 将当前装备放回背包
                    this.player.inventory.push(currentEquippedItem);
                }

                // 装备新装备
                this.player.equipment[type] = this.player.inventory[index];
                this.player.health += this.player.inventory[index].health;
                this.player.attack += this.player.inventory[index].attack;
                this.player.defense += this.player.inventory[index].defense;
                this.player.maxHealth += this.player.inventory[index].health;

                // 从背包中移除新装备
                this.player.inventory.splice(index, 1);
                this.player.inventory.forEach((item, index) => {
                    if (!item.name) this.player.inventory.splice(index, 1);
                })
                // 更新玩家信息
                this.$store.commit('setPlayer', this.player);
            },
            // 卸装备
            equipmentClose (type) {
                const { inventory, equipment } = this.player;
                // 扣除血量
                this.player.health -= equipment[type].health;
                // 扣除攻击力
                this.player.attack -= equipment[type].attack;
                // 扣除防御
                this.player.defense -= equipment[type].defense;
                // 扣除最大血量
                this.player.maxHealth -= equipment[type].health;
                // 添加到背包
                inventory.push(equipment[type]);
                // 清空身上当前类型的装备
                equipment[type] = null;
                this.$store.commit('setPlayer', this.player);
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
        -webkit-user-drag: none
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
        height: 40px;
        line-height: 38px;
    }

    .inventory-box {
        white-space: pre-wrap;
        min-height: 40px;
        line-height: 38px;
        height: auto;
    }

    .inventory-item {
        margin: 4px;
    }

    .actions {
        margin: 1rem 0;
    }
</style>

<style>
    .el-message-box {
        width: 300px;
    }
</style>