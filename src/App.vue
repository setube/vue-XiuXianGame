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
        <div class="game-container" v-loading="loading">
            <div class="game-box" v-if="!loading">
                <h1>Vue 修仙文字游戏</h1>
                <div class="story">
                    <p v-html="storyText" v-if="ismonster" @click="openMonsterInfo" />
                    <p v-else-if="isequipment" @click="openEquipmentInfo" v-html="storyText" />
                    <p v-else v-html="storyText" />
                </div>
                <div class="attributes">
                    <div class="attribute-box">
                        <div class="tag attribute">
                            境界: {{ player.level >= 40 ? levelNames[levelNames.length - 1] : levelNames[player.level] }}
                        </div>
                        <div class="tag attribute" v-if="player.cultivation >= 1000000 || player.maxCultivation >= 1000000">
                            修为: 登峰造极
                        </div>
                        <div class="tag attribute" v-else>
                            修为: {{ player.cultivation }}/{{ player.maxCultivation }}
                        </div>
                        <div class="tag attribute">
                            气血: {{ player.health || 0 }}/{{ player.maxHealth || 0 }}
                        </div>
                        <div class="tag attribute">
                            法力: {{ player.mana }}/{{ player.maxMana }}
                        </div>
                        <div class="tag attribute">
                            攻击: {{ player.attack }}
                        </div>
                        <div class="tag attribute">
                            防御: {{ player.defense }}
                        </div>
                    </div>
                </div>
                <div class="equip-box">
                    <div class="tag equip-item">
                        <span class="equip">
                            <span>兵器: </span>
                            <el-tag v-if="player.equipment.weapon?.name" :type="player.equipment.weapon?.quality" :closable="player.equipment.weapon?.name ? true : false" @close="equipmentClose('weapon')" @click="equipmentInfo('weapon')">{{ player.equipment.weapon?.name || '无' }}</el-tag>
                            <span v-else>无</span>
                        </span>
                        <span class="equip">
                            <span>护甲: </span>
                            <el-tag v-if="player.equipment.armor?.name" :type="player.equipment.armor?.quality" :closable="player.equipment.armor?.name ? true : false" @close="equipmentClose('armor')" @click="equipmentInfo('armor')">{{ player.equipment.armor?.name || '无' }}</el-tag>
                            <span v-else>无</span>
                        </span>
                    </div>
                    <div class="tag equip-item">
                        <span class="equip">
                            <span>灵宝: </span>
                            <el-tag v-if="player.equipment.accessory?.name" :type="player.equipment.accessory?.quality" :closable="player.equipment.accessory?.name ? true : false" @close="equipmentClose('accessory')" @click="equipmentInfo('accessory')">{{ player.equipment.accessory?.name || '无' }}</el-tag>
                            <span v-else>无</span>
                        </span>
                        <span class="equip">
                            <span>法器: </span>
                            <el-tag v-if="player.equipment.sutra?.name" :type="player.equipment.sutra?.quality" :closable="player.equipment.sutra?.name ? true : false" @close="equipmentClose('sutra')" @click="equipmentInfo('sutra')">{{ player.equipment.sutra?.name }}</el-tag>
                            <span v-else>无</span>
                        </span>
                    </div>
                    <div class="tag inventory-box" v-if="player.inventory.length > 0">
                        <span>背包: </span>
                        <el-tag class="inventory-item" :type="item?.quality" v-for="(item, index) in player.inventory" :key="index" closable @close="inventoryClose(index)" @click="inventory(index, item.type)">
                            {{ item?.name }}({{ equipmentType[item.type] }})
                        </el-tag>
                    </div>
                    <div class="tag inventory-box" v-else>
                        背包: 空
                    </div>
                </div>
                <div class="actions">
                    <el-button :type="action.type ? action.type : ''" v-for="(action, index) in actions" :key="index" @click="action.handler">
                        {{ action.text }}
                    </el-button>
                </div>
            </div>
        </div>
        <div class="wm_bg_1" />
        <div class="wm_bg_2" />
    </div>
</template>

<script>
    // 怪物
    import monster from '@/plugins/monster';
    // 装备
    import equip from '@/plugins/equip';

    export default {
        data () {
            return {
                // 玩家属性
                player: {
                    // 当前法力
                    mana: 50,
                    // 等级
                    level: 0,
                    // 攻击
                    attack: 10,
                    // 当前气血
                    health: 100,
                    // 防御
                    defense: 10,
                    // 总法力
                    maxMana: 50,
                    // 总气血
                    maxHealth: 100,
                    // 背包道具
                    inventory: [],
                    // 装备
                    equipment: {
                        // 法器
                        sutra: null,
                        // 护甲
                        armor: null,
                        // 兵器
                        weapon: null,
                        // 灵宝
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
                    // 气血
                    health: 0,
                    // 攻击
                    attack: 0
                },
                loading: false,
                actions: [],
                levelNames: [
                    '凡人', '筑基', '开光', '胎息', '辟谷',
                    '金丹', '元婴', '出窍', '分神',
                    '合体', '大乘', '渡劫', '地仙',
                    '天仙', '金仙', '大罗金仙', '九天玄仙',
                    '仙君', '仙帝', '仙尊', '仙祖',
                    '圣仙', '至仙', '无上仙', '道仙',
                    '鸿蒙仙', '混沌仙', '天尊', '始祖天尊',
                    '无上天尊', '大道天尊', '永恒仙尊', '宇宙仙祖',
                    '虚空道祖', '超脱者', '至高神', '创世神',
                    '纪元之主', '无上主宰', '鸿蒙主宰', '混沌主宰'
                ],
                storyText: '',
                ismonster: false,
                isequipment: false,
                // 回合数
                guashaRounds: 10,
                equipmentType: {
                    sutra: '法器',
                    armor: '护甲',
                    weapon: '兵器',
                    accessory: '灵宝'
                },
                openEquipItemInfo: null
            };
        },
        watch: {
            'player.attack': function (val) {
                if (val == null || val <= 0) {
                    this.player.attack = 10;
                    this.equipmentClose('attack');
                    this.storyText = '攻击属性出错, 已重置属性, 请重新装备';
                } else {
                    this.player.attack = val;
                }
            },
            'player.health': function (val) {
                if (val == null || val <= 0) {
                    this.player.health = 100;
                    this.equipmentClose('health');
                    this.storyText = '气血属性出错, 已重置属性, 请重新装备';
                } else {
                    this.player.health = val;
                }
            },
            'player.defense': function (val) {
                if (val == null || val <= 0) {
                    this.player.defense = 10;
                    this.equipmentClose('defense');
                    this.storyText = '防御属性出错, 已重置属性, 请重新装备';
                } else {
                    this.player.defense = val;
                }
            },
            'player.maxHealth': function (val) {
                if (val == null || val <= 0) {
                    this.player.maxHealth = 100;
                    this.storyText = '气血属性出错, 已重置属性, 请重新装备';
                } else {
                    this.player.maxHealth = val;
                }
            },
            actions (val) {
                this.actions = val;
                this.loading = true;
                setTimeout(() => {
                    this.loading = false;
                }, 500);
            }
        },
        mounted () {
            // 判断本地有没有玩家存档数据
            if (this.$store.state.player) this.player = this.$store.state.player;
            // 初始化游戏
            this.startGame();
        },
        methods: {
            // 导出存档
            exportdata () {
                const today = new Date();
                const year = today.getFullYear();
                const month = String(today.getMonth() + 1).padStart(2, '0');
                const day = String(today.getDate()).padStart(2, '0');
                const hours = String(today.getHours()).padStart(2, '0');
                const minutes = String(today.getMinutes()).padStart(2, '0');
                const seconds = String(today.getSeconds()).padStart(2, '0');

                const blob = new Blob([localStorage.getItem('vuex')], { type: 'application/json;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const downloadLink = document.createElement('a');
                downloadLink.href = url;
                downloadLink.download = `文字修仙小游戏存档${year}-${month}-${day} ${hours}:${minutes}:${seconds}.json`;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
            },
            // 删档
            deleteData (type) {
                this.$confirm(type ? '你确定要清空包括身上和背包里的所有道具吗?' : '你确定要删除存档吗?建议数据出问题的时候再删除', type ? '道具清空提示' : '数据删除提示', {
                    center: true,
                    cancelButtonText: '我点错了',
                    confirmButtonText: '确定以及肯定'
                }).then(() => {
                    if (type) {
                        // 清空背包道具
                        this.player.inventory = [];
                        const item = this.player.equipment;
                        Object.keys(item).forEach((key) => {
                            const health = item[key]?.health ?? 0;
                            const attack = item[key]?.attack ?? 0;
                            const defense = item[key]?.defense ?? 0;
                            this.player.health -= health;
                            this.player.attack -= attack;
                            this.player.defense -= defense;
                            this.player.maxHealth -= health;
                            // 清空身上装备
                            item[key] = null;
                        });
                        this.$store.commit('setPlayer', this.player);
                    } else {
                        // 清空存档
                        localStorage.removeItem('vuex');
                        // 刷新页面
                        location.reload();
                    }
                }).catch(() => { });
            },
            // 计算当前时间和离线时间相差多少分钟
            getMinuteDifference (specifiedTimestamp) {
                // 获取当前时间戳（秒数）
                const currentTimestamp = Math.floor(Date.now() / 1000);
                specifiedTimestamp = specifiedTimestamp == 0 ? currentTimestamp : specifiedTimestamp;
                // 计算时间差（分钟数）
                const timeDifferenceInSeconds = Math.abs(currentTimestamp - specifiedTimestamp);
                const timeDifferenceInMinutes = Math.floor(timeDifferenceInSeconds / 60);
                return timeDifferenceInMinutes;
            },
            // 初始化游戏
            startGame () {
                if (!this.player.cultivation) this.storyText = '欢迎来到《修仙文字游戏》，你的修仙之旅开始了。';
                else this.storyText = '欢迎来到《修仙文字游戏》，你的修仙之旅开始了。';
                this.actions = [
                    { text: '开始修炼', handler: this.cultivate },
                    { text: '探索秘境', handler: this.explore },
                    { text: '清空道具', type: 'warning', handler: () => this.deleteData(1) },
                    { text: '删档重练', type: 'danger', handler: () => this.deleteData(0) },
                    { text: '导出存档', type: 'success', handler: this.exportdata },
                ];
                // 初始化玩家当前气血
                this.player.health = this.player.maxHealth;
                // 更新离线时间错
                setInterval(() => {
                    this.player.offline = Math.floor(Date.now() / 1000);
                    // 更新玩家存档
                    this.$store.commit('setPlayer', this.player);
                }, 1000)
                // 离线时长
                const time = this.getMinuteDifference(this.player.offline);
                // 赠送离线挂机修为
                if (time >= 1) {
                    let maxExp = Math.floor(this.player.maxCultivation / 1000);
                    maxExp = maxExp == 0 ? 1 * time : maxExp * time
                    // 增加修为
                    this.player.cultivation += maxExp;
                    this.$message({
                        message: `你已神魂游离太虚${time}分钟, 获得了${maxExp}修为`,
                        type: 'success'
                    });
                }
                // 更新玩家修为境界
                this.breakThrough();
                // 更新玩家存档
                this.$store.commit('setPlayer', this.player);
            },
            // 修为突破
            breakThrough () {
                // 如果当前修为大于等于总修为
                if (this.player.cultivation >= this.player.maxCultivation) {
                    // 增加等级
                    this.player.level++;
                    // 增加攻击
                    this.player.attack += 5;
                    // 更新气血
                    this.player.health = this.player.maxHealth;
                    // 增加玩家法力
                    this.player.mana = this.player.maxMana;
                    // 增加玩家总修为
                    this.player.maxCultivation = Math.floor(100 * Math.pow(2, this.player.level));
                    this.storyText = `恭喜你突破了！当前境界：${this.player.level >= 40 ? this.levelNames[this.levelNames.length - 1] : this.levelNames[this.player.level]}`;
                    this.$store.commit('setPlayer', this.player);
                }
            },
            // 修炼逻辑
            cultivate () {
                this.ismonster = false;
                // 如果当前修为小于总修为
                if (this.player.cultivation < this.player.maxCultivation) {
                    // 增加当前修为
                    const exp = Math.floor(this.player.maxCultivation / equip.getRandomInt(10, 30));
                    this.player.cultivation += exp;
                    console.log(exp)
                    this.storyText = `你开始冥想，吸收周围的灵气。修为提升了！`;
                } else {
                    this.storyText = '你已经达到了当前境界的修为上限，需要突破到下一个等级。';
                }
                this.breakThrough();
                this.actions = [
                    { text: '继续修炼', handler: this.cultivate },
                    { text: '探索秘境', handler: this.explore }
                ];
            },
            // 探索逻辑
            explore () {
                this.guashaRounds = 10;
                // 遇到怪物
                if (equip.getRandomInt(0, 1)) this.encounterMonster();
                // 发现道具
                else this.findTreasure();
            },
            // 遇怪逻辑
            encounterMonster () {
                // 玩家等级
                const level = this.player.level == 0 ? 1 : this.player.level;
                // 野怪属性
                this.monster = {
                    // 名称
                    name: monster.monster_Names(level),
                    // 气血
                    health: monster.monster_Health(level),
                    // 攻击
                    attack: monster.monster_Attack(level),
                    // 防御
                    defense: monster.monster_Attack(level)
                };
                this.ismonster = true;
                this.storyText = `你遇到了<span class="el-tag el-tag--danger">${this.monster.name}</span>`;
                this.actions = [
                    { text: '干他娘的', handler: () => this.fightMonster(this.monster) },
                    { text: '提桶跑路', handler: this.runAway }
                ];
            },
            // 怪物信息
            openMonsterInfo () {
                this.$alert('', this.monster.name, {
                    center: true,
                    message: `<div class="monsterinfo">
                        <div class="monsterinfo-box">
                            <p>境界: ${this.player.level >= 40 ? this.levelNames[this.levelNames.length - 1] : (this.player.level == 0 ? this.levelNames[this.player.level + 1] : this.levelNames[this.player.level])}</p>
                            <p>气血: ${this.monster.health}</p>
                            <p>攻击: ${this.monster.attack}</p>
                            <p>防御: ${this.monster.defense}</p>
                        </div>
                    </div>`,
                    confirmButtonText: '知道了',
                    dangerouslyUseHTMLString: true
                }).catch(() => { });
            },
            // 打坐休息
            rest (monster) {
                if (this.player.mana >= this.player.maxMana && this.player.health >= this.player.maxHealth) {
                    this.actions = [
                        { text: '继续干他', handler: () => this.fightMonster(monster) },
                        { text: '提桶跑路', handler: () => this.runAway(monster) }
                    ];
                } else {
                    // 打坐回蓝
                    const maxMana = Math.floor(this.player.maxMana * 0.1)
                    if (this.player.mana < this.player.maxMana || this.player.mana > this.player.maxMana) {
                        this.player.mana += maxMana;
                        if (this.player.mana >= this.player.maxMana) this.player.mana = this.player.maxMana;
                    }
                    // 打坐回血
                    const maxHealth = Math.floor(this.player.maxHealth * 0.1)
                    if (this.player.health < this.player.maxHealth || this.player.health > this.player.maxHealth) {
                        this.player.health += maxHealth;
                        if (this.player.health >= this.player.maxHealth) this.player.health = this.player.maxHealth;
                    }
                    this.storyText = `你恢复了${maxHealth}点气血和${maxMana}点法力`;
                    this.actions = [
                        { text: '继续干他', handler: () => this.fightMonster(monster) },
                        { text: '继续打坐', handler: () => this.rest(monster) },
                        { text: '提桶跑路', handler: () => this.runAway(monster) }
                    ];
                }
            },
            // 战斗逻辑
            fightMonster (monster) {
                this.ismonster = false;
                // 野怪伤害计算
                const monsterAttack = monster.attack; // 野怪攻击
                const playerDefense = this.player.defense; // 玩家防御
                let monsterHarm = Math.max(0, Math.floor(monsterAttack - playerDefense)); // 野怪伤害
                monsterHarm = monsterHarm <= 1 ? 1 : monsterHarm;
                this.player.health -= monsterHarm; // 扣除玩家气血

                // 玩家伤害计算
                const playerAttack = this.player.attack; // 玩家攻击
                const monsterDefense = monster.defense; // 野怪防御
                let playerHarm = Math.max(0, Math.floor(playerAttack - monsterDefense)); // 野怪伤害
                playerHarm = playerHarm <= 1 ? 1 : playerHarm;
                monster.health -= playerHarm; // 扣除野怪气血
                this.player.mana--; //扣除玩家法力
                if (!this.player.mana) {
                    this.storyText = '你的法力已经用光了, 请回家升级补充法力';
                    this.actions = [
                        { text: '打坐休息', handler: () => this.rest(monster) },
                        { text: '打坐休息', handler: () => this.rest(monster) },
                        { text: '回到家里', handler: this.startGame }
                    ];
                    return;
                }
                if (this.guashaRounds > 1) {
                    // 扣除回合数
                    this.guashaRounds--;
                    // 野怪气血小于等于0
                    if (monster.health <= 0) {
                        let exp = Math.floor(this.player.maxCultivation / equip.getRandomInt(1, 1000));
                        exp = exp ? exp : 1;

                        if (equip.getRandomInt(0, 1)) {
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
                            this.storyText = `你击败了${monster.name}获得了${exp}点修为和一颗${name}。`;
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
                                            { text: '继续修炼', handler: this.cultivate },
                                            { text: '继续探索', handler: this.explore },
                                        ]
                                    }
                                }
                            ];
                        } else {
                            this.storyText = `你击败了${monster.name}获得了${exp}点修为`;
                            this.actions = [
                                { text: '继续修炼', handler: this.cultivate },
                                { text: '继续探索', handler: this.explore },
                            ]
                        }
                        // 增加修为
                        this.player.cultivation += exp;
                        this.breakThrough();
                    } else if (this.player.health <= 0) {
                        this.storyText = '你死了, 弱。';
                        this.actions = [
                            { text: '回到家里', handler: this.startGame }
                        ];
                    } else {
                        this.storyText = `${this.guashaRounds}回合 / 10回合<br>你攻击了${monster.name}，造成了${playerHarm}点伤害，剩余${monster.health}气血。<br>${monster.name}攻击了你，${monsterHarm ? '造成了' + monsterHarm + '点伤害。' : '未造成伤害'}`;
                        this.actions = [
                            { text: '干他娘的', handler: () => this.fightMonster(monster) },
                            { text: '打坐休息', handler: () => this.rest(monster) },
                            { text: '提桶跑路', handler: () => this.runAway(monster) }
                        ];
                    }
                } else {
                    this.guashaRounds = 10;
                    this.storyText = `回合结束, 你未战胜${monster.name}你输了。`;
                    this.actions = [
                        { text: '回到家里', handler: this.startGame }
                    ];
                }
                // 更新玩家存档
                this.$store.commit('setPlayer', this.player);
            },
            // 逃跑
            runAway () {
                this.guashaRounds = 10;
                const Random = equip.getRandomInt(0, 1);
                this.storyText = Random ? '逃跑失败，请继续战斗。' : '你选择了逃跑，安全返回了修炼地点。';
                this.actions = Random ? [
                    { text: '发起攻击', handler: () => this.fightMonster(this.monster) }
                ] : [
                    { text: '继续修炼', handler: this.cultivate },
                    { text: '继续探索', handler: this.explore }
                ];
            },
            // 发现道具
            findTreasure () {
                const randomInt = equip.getRandomInt(1, 4);
                let equipItem = null;
                const level = {
                    info: '下品',
                    danger: '极品',
                    success: '中品',
                    warning: '上品'
                };
                // 兵器
                if (randomInt == 1) equipItem = equip.equip_Weapons(this.player.level);
                // 护甲
                else if (randomInt == 2) equipItem = equip.equip_Armors(this.player.level);
                // 灵宝
                else if (randomInt == 3) equipItem = equip.equip_Accessorys(this.player.level);
                // 法器
                else if (randomInt == 4) equipItem = equip.equip_Sutras(this.player.level);
                this.storyText = equipItem?.name ? `你发现了一个宝箱，打开后获得了<span class="el-tag el-tag--${equipItem.quality}">${level[equipItem.quality]}${equipItem.name}(${this.equipmentType[equipItem.type]})</span>` : '你发现了一个宝箱，打开后箱子里是空的。';
                this.openEquipItemInfo = equipItem;
                this.isequipment = equipItem?.name
                // 玩家获得道具
                if (equipItem?.name) this.player.inventory.push(equipItem);
                this.actions = [
                    { text: '继续修炼', handler: this.cultivate },
                    { text: '继续探索', handler: this.explore }
                ];
                // 更新玩家存档
                this.$store.commit('setPlayer', this.player);
            },
            // 删除道具
            inventoryClose (index) {
                this.$confirm(`你确定要丢弃${this.player.inventory[index].name}吗?`, '道具丢弃通知', {
                    center: true,
                    cancelButtonText: '取消',
                    confirmButtonText: '确定'
                }).then(() => {
                    // 删除道具
                    this.player.inventory.splice(index, 1);
                    // 更新玩家存档
                    this.$store.commit('setPlayer', this.player);
                }).catch(() => { });
            },
            // 道具信息
            inventory (index, type) {
                const level = {
                    info: '下品',
                    danger: '极品',
                    success: '中品',
                    warning: '上品'
                };
                const genre = {
                    sutra: '法器',
                    armor: '护甲',
                    weapon: '兵器',
                    accessory: '灵宝'
                };
                const inventory = this.player.inventory[index];
                this.$confirm('', inventory.name, {
                    center: true,
                    message: `<div class="monsterinfo">
                        <div class="monsterinfo-box">
                            <p>类型: ${genre[type] ?? '未知'}</p>
                            <p>等级: ${this.player.level >= 40 ? this.levelNames[this.levelNames.length - 1] : this.levelNames[inventory.level]}</p>
                            <p>品质: ${level[inventory.quality] ?? '未知'}</p>
                            <p>气血: ${inventory.health}</p>
                            <p>攻击: ${inventory.attack}</p>
                            <p>防御: ${inventory.defense}</p>
                        </div>
                    </div>`,
                    cancelButtonText: '知道了',
                    confirmButtonText: '立即装备',
                    dangerouslyUseHTMLString: true
                }).then(() => {
                    // 穿装备
                    this.equipItem(index, type);
                }).catch(() => { });
            },
            // 装备信息
            equipmentInfo (type) {
                const equipment = this.player.equipment[type];
                if (!equipment) return;
                const level = {
                    info: '下品',
                    danger: '极品',
                    success: '中品',
                    warning: '上品'
                };
                const genre = {
                    sutra: '法器',
                    armor: '护甲',
                    weapon: '兵器',
                    accessory: '灵宝'
                };
                this.$confirm('', equipment.name, {
                    center: true,
                    message: `<div class="monsterinfo">
                        <div class="monsterinfo-box">
                            <p>类型: ${genre[type] ?? '未知'}</p>
                            <p>等级: ${this.player.level >= 40 ? this.levelNames[this.levelNames.length - 1] : this.levelNames[equipment.level]}</p>
                            <p>品质: ${level[equipment.quality] ?? '未知'}</p>
                            <p>气血: ${equipment.health}</p>
                            <p>攻击: ${equipment.attack}</p>
                            <p>防御: ${equipment.defense}</p>
                        </div>
                    </div>`,
                    dangerouslyUseHTMLString: true
                }).catch(() => { });
            },
            // 发现的装备信息
            openEquipmentInfo () {
                const equipment = this.openEquipItemInfo;
                if (!equipment) return;
                const level = {
                    info: '下品',
                    danger: '极品',
                    success: '中品',
                    warning: '上品'
                };
                const genre = {
                    sutra: '法器',
                    armor: '护甲',
                    weapon: '兵器',
                    accessory: '灵宝'
                };
                this.$confirm('', equipment.name, {
                    center: true,
                    message: `<div class="monsterinfo">
                        <div class="monsterinfo-box">
                            <p>类型: ${genre[equipment.type] ?? '未知'}</p>
                            <p>等级: ${this.player.level >= 40 ? this.levelNames[this.levelNames.length - 1] : this.levelNames[equipment.level]}</p>
                            <p>品质: ${level[equipment.quality] ?? '未知'}</p>
                            <p>气血: ${equipment.health}</p>
                            <p>攻击: ${equipment.attack}</p>
                            <p>防御: ${equipment.defense}</p>
                        </div>
                    </div>`,
                    dangerouslyUseHTMLString: true
                }).catch(() => { });
            },
            // 穿装备
            equipItem (index, type) {
                const inventory = this.player.inventory;
                // 如果当前类型的装备已经穿戴，则将其放回背包
                if (this.player.equipment[type]) {
                    const equipment = this.player.equipment[type];
                    // 更新玩家属性，移除当前穿戴装备的属性加成
                    this.player.health -= equipment.health;
                    this.player.attack -= equipment.attack;
                    this.player.defense -= equipment.defense;
                    this.player.maxHealth -= equipment.health;
                    // 将当前装备放回背包
                    inventory.push(equipment);
                }
                // 装备新装备
                this.player.equipment[type] = inventory[index];
                this.player.health += inventory[index].health;
                this.player.attack += inventory[index].attack;
                this.player.defense += inventory[index].defense;
                this.player.maxHealth += inventory[index].health;
                // 从背包中移除新装备
                inventory.splice(index, 1);
                inventory.forEach((item, index) => {
                    if (!item.name) inventory.splice(index, 1);
                })
                // 更新玩家存档
                this.$store.commit('setPlayer', this.player);
            },
            // 卸装备
            equipmentClose (type) {
                const { inventory, equipment } = this.player;
                // 更新玩家属性，移除当前穿戴装备的属性加成
                this.player.health -= equipment[type].health;
                this.player.attack -= equipment[type].attack;
                this.player.defense -= equipment[type].defense;
                this.player.maxHealth -= equipment[type].health;
                // 添加装备到背包里
                inventory.push(equipment[type]);
                // 清空身上当前类型的装备
                equipment[type] = null;
                // 更新玩家存档
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
        min-width: 540px;
        max-width: 600px;
        min-height: 452px;
        margin: 0 auto;
        padding: 20px;
        background-color: #fff;
        border-radius: 10px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        text-align: center;
    }

    .tag {
        height: 32px;
        padding: 0 10px;
        line-height: 30px;
        font-size: 12px;
        border-width: 1px;
        border-style: solid;
        border-radius: 4px;
        box-sizing: border-box;
        white-space: nowrap;
        display: inline-block;
    }

    .attributes {
        display: flex;
        justify-content: center;
    }


    .attribute {
        width: calc(50% - 8px);
        margin: 4px;
    }

    .attribute-box {
        display: flex;
        flex-wrap: wrap;
    }

    .equip-box {
        padding: 0 4px;
        margin-top: 4px;
        display: flex;
        flex-direction: column;
    }

    .equip-item {
        margin-bottom: 8px;
        height: 40px;
        line-height: 38px;
    }

    .equip {
        margin-left: 10px;
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

    .wm_bg_1,
    .wm_bg_2 {
        position: fixed;
        top: 0;
        left: 0;
        z-index: -1;
        width: 100%;
        height: 100%;
        background-size: 100% auto;
        transition: all .3s ease-out;
    }

    .wm_bg_1 {
        background: url(@/assets/wm_bg_1.png) top;
    }

    .wm_bg_2 {
        background: url(@/assets/wm_bg_2.png) top;
    }

    @media only screen and (max-width: 750px) {
        .game-container {
            min-height: 574px;
            min-width: 356px;
        }

        .actions {
            display: flex;
            flex-direction: column;
            justify-content: center;
        }

        .actions * {
            margin-top: 10px;
        }

        .actions *:nth-child(1) {
            margin-left: 10px;
        }
    }
</style>

<style>
    .monsterinfo {
        display: flex;
        justify-content: center;
    }

    .monsterinfo-box {
        display: flex;
        flex-direction: column;
    }

    .monsterinfo p {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        margin: 0;
    }

    .monsterinfo p:first-child {
        justify-content: flex-start;
    }

    @media only screen and (max-width: 750px) {
        .el-message-box {
            width: 300px !important;
        }
    }
</style>