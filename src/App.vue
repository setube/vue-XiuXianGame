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
        <h1 class="title">Vue 修仙文字游戏</h1>
        <div class="game-container" v-loading="loading">
            <div class="game-box" v-if="!loading">
                <i class="setting el-icon-setting" @click="show = !show"></i>
                <div class="Illustrations" v-if="isIllustrations">
                    <div class="story">
                        <p>装备图鉴</p>
                    </div>
                    <div class="tag inventory-box">
                        <el-tabs v-model="illustrationsActive" :stretch="true">
                            <el-tab-pane :label="i.name" :name="i.type" v-for="(i, k) in illustrationsItems" :key="k">
                                <div class="inventory-content">
                                    <template v-for="(item, index) in i.data">
                                        <el-tag class="inventory-item" v-if="item.type == i.type" :key="index" :type="item.quality" @click="illustrationsInfo(k, index)">
                                            {{ item.name }}
                                        </el-tag>
                                    </template>
                                </div>
                            </el-tab-pane>
                        </el-tabs>
                    </div>
                    <div class="actions">
                        <el-button :type="action.type ? action.type : ''" v-for="(action, index) in actions" :key="index" @click="action.handler">
                            {{ action.text }}
                        </el-button>
                    </div>
                </div>
                <div v-else>
                    <div class="boss" v-if="isBoss">
                        <div class="boss-box">
                            <span class="el-tag el-tag--warning" @click="openBossInfo">{{ boss.name }}</span>
                            <el-alert class="desc" :title="boss.desc" :closable="false" type="error"></el-alert>
                        </div>
                    </div>
                    <div class="story">
                        <p v-html="storyText" v-if="ismonster" @click="openMonsterInfo" />
                        <p v-else-if="isequipment" @click="openEquipmentInfo" v-html="storyText" />
                        <p v-else v-html="storyText" />
                    </div>
                    <div class="attributes">
                        <div class="attribute-box">
                            <div class="tag attribute">
                                境界: {{ player.level >= maxLv ? levelNames[levelNames.length - 1] : levelNames[player.level] }}
                            </div>
                            <div class="tag attribute" v-if="player.level >= this.maxLv">
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
                            <div class="tag attribute">
                                闪避率: {{ (player.dodge * 100).toFixed(2) }}%
                            </div>
                            <div class="tag attribute">
                                暴击率: {{ (player.critical * 100).toFixed(2) }}%
                            </div>
                        </div>
                    </div>
                    <div class="equip-box">
                        <div class="tag equip-item">
                            <span class="equip">
                                <span>兵器: </span>
                                <el-tag v-if="player.equipment.weapon?.name" :type="player.equipment.weapon?.quality" :closable="player.equipment.weapon?.name ? true : false" @close="equipmentClose('weapon')" @click="equipmentInfo('weapon')">{{ player.equipment.weapon?.name }}</el-tag>
                                <span v-else>无</span>
                            </span>
                            <span class="equip">
                                <span>护甲: </span>
                                <el-tag v-if="player.equipment.armor?.name" :type="player.equipment.armor?.quality" :closable="player.equipment.armor?.name ? true : false" @close="equipmentClose('armor')" @click="equipmentInfo('armor')">{{ player.equipment.armor?.name }}</el-tag>
                                <span v-else>无</span>
                            </span>
                        </div>
                        <div class="tag equip-item">
                            <span class="equip">
                                <span>灵宝: </span>
                                <el-tag v-if="player.equipment.accessory?.name" :type="player.equipment.accessory?.quality" :closable="player.equipment.accessory?.name ? true : false" @close="equipmentClose('accessory')" @click="equipmentInfo('accessory')">{{ player.equipment.accessory?.name }}</el-tag>
                                <span v-else>无</span>
                            </span>
                            <span class="equip">
                                <span>法器: </span>
                                <el-tag v-if="player.equipment.sutra?.name" :type="player.equipment.sutra?.quality" :closable="player.equipment.sutra?.name ? true : false" @close="equipmentClose('sutra')" @click="equipmentInfo('sutra')">{{ player.equipment.sutra?.name }}</el-tag>
                                <span v-else>无</span>
                            </span>
                        </div>
                        <div class="tag inventory-box">
                            <el-tabs v-model="inventoryActive" :stretch="true">
                                <el-tab-pane :label="i.name" :name="i.type" v-for="(i, k) in backPackItem" :key="k">
                                    <div class="inventory-content">
                                        <div v-if="player.inventory.length">
                                            <template v-for="item in player.inventory">
                                                <el-tag class="inventory-item" v-if="item.type == i.type" :key="item.id" :type="item?.quality" closable @close="inventoryClose(item)" @click="inventory(item.id, item.type)">
                                                    {{ item?.name }}
                                                </el-tag>

                                            </template>
                                        </div>
                                        <div v-else>
                                            <el-tag type="success" class="dialog-footer-button" v-if="!player.isNewbie && player.level < 10" @click="newbiePack(4)">领取新手礼包</el-tag>
                                        </div>
                                    </div>
                                </el-tab-pane>
                            </el-tabs>
                        </div>
                    </div>
                    <div class="actions">
                        <el-button :type="action.type ? action.type : ''" v-for="(action, index) in actions" :key="index" @click="action.handler">
                            {{ action.text }}
                        </el-button>
                    </div>
                </div>
            </div>
        </div>
        <el-dialog title="游戏数据管理" :visible.sync="show">
            <div class="dialog-footer">
                <el-button class="dialog-footer-button" @click="deleteData(1)">
                    清空背包
                </el-button>
                <el-button type="info" class="dialog-footer-button" @click="exportData">
                    导出存档
                </el-button>
                <el-upload action="#" class="dialog-upload" :http-request="importData" :show-file-list="false" accept="application/json">
                    <el-button type="warning" class="dialog-footer-button">
                        导入存档
                    </el-button>
                </el-upload>
                <el-button type="danger" class="dialog-footer-button" @click="deleteData(0)">
                    删除存档
                </el-button>
            </div>
        </el-dialog>
        <div class="wm_bg_1" />
        <div class="wm_bg_2" />
        <div class="bbh">
            当前游戏版本0.4.7
        </div>
    </div>
</template>

<script>
    // 怪物
    import boss from '@/plugins/boss';
    // 装备
    import equip from '@/plugins/equip';
    import crypto from '@/plugins/crypto';
    // 怪物
    import monster from '@/plugins/monster';
    // 图鉴
    import equipAll from '@/plugins/equipAll';

    export default {
        data () {
            return {
                // 弹窗
                show: false,
                // boss属性
                boss: {
                    name: '',
                    text: '',
                    desc: '',
                    level: 40,
                    dodge: 0,
                    attack: 0,
                    health: 0,
                    defense: 0,
                    critical: 0,
                    maxhealth: 0,
                },
                // 最高境界
                maxLv: 40,
                genre: {
                    sutra: '法器',
                    armor: '护甲',
                    weapon: '兵器',
                    accessory: '灵宝'
                },
                isBoss: false,
                levels: {
                    info: '下品',
                    danger: '神品',
                    primary: '上品',
                    success: '中品',
                    warning: '极品'
                },
                // 玩家属性
                player: {
                    // 当前法力
                    mana: 50,
                    // 境界
                    level: 0,
                    // 闪避率
                    dodge: 0,
                    // 攻击
                    attack: 10,
                    // 当前气血
                    health: 100,
                    // 防御
                    defense: 10,
                    // 总法力
                    maxMana: 50,
                    // 已击杀数量
                    taskNum: 0,
                    // 暴击率
                    critical: 0,
                    // 是否已领取新手礼包
                    isNewbie: false,
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
                    // 下个境界所需修为
                    maxCultivation: 100,
                },
                // 野怪属性
                monster: {
                    // 名称
                    name: '',
                    // 气血
                    health: 0,
                    // 攻击
                    attack: 0,
                    // 防御
                    defense: 0,
                    // 闪避率
                    dodge: 0,
                    // 暴击
                    critical: 0
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
                backPackItem: [
                    { type: 'weapon', name: '兵器' },
                    { type: 'armor', name: '护甲' },
                    { type: 'accessory', name: '灵宝' },
                    { type: 'sutra', name: '法器' }
                ],
                isIllustrations: false,
                inventoryActive: 'weapon',
                openEquipItemInfo: null,
                illustrationsItems: [],
                illustrationsActive: 'weapon',
                illustrationsInfoData: [],
            };
        },
        watch: {
            'player.attack': function (val) {
                if (isNaN(val)) {
                    this.reset();
                } else {
                    this.player.attack = val;
                }
            },
            'player.health': function (val) {
                if (isNaN(val)) {
                    this.reset();
                } else {
                    this.player.health = val;
                }
            },
            'player.defense': function (val) {
                if (isNaN(val)) {
                    this.reset();
                } else {
                    this.player.defense = val;
                }
            },
            'player.maxHealth': function (val) {
                if (isNaN(val)) {
                    this.reset();
                } else {
                    this.player.maxHealth = val;
                }
            },
            'player.critical': function (val) {
                if (isNaN(val)) {
                    this.reset();
                } else {
                    this.player.critical = val;
                }
            },
            'player.dodge': function (val) {
                if (isNaN(val)) {
                    this.reset();
                } else {
                    this.player.dodge = val;
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
            const local = window.localStorage;
            if (local.vuex) {
                const vuex = JSON.parse(local.vuex);
                this.boss = crypto.decryption(vuex.boss);
                this.player = crypto.decryption(vuex.player);
            }
            // 初始化游戏
            this.startGame('home');
        },
        methods: {
            // 重置
            reset () {
                this.storyText = '属性出错, 请添加QQ群:920930589, 上传"存档"并联系作者解决';
                this.$confirm('你是否要导出存档?', '存档导出提示', {
                    center: true,
                    confirmButtonText: '确定'
                }).then(() => {
                    this.exportData();
                }).catch(() => { });
            },
            // 导入存档
            importData (data) {
                const file = data.file;
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = JSON.parse(e.target.result);
                        if (data.boss) {
                            this.boss = crypto.decryption(data.boss);
                            this.$store.commit('setBoss', this.boss);
                        }
                        this.player = crypto.decryption(data.player);
                        this.$store.commit('setPlayer', this.player);
                        location.reload(1);
                    } catch (err) {
                        this.$message.error('数据导入失败, 错误信息:' + err);
                    }
                };
                reader.readAsText(file);
            },
            // 导出存档
            exportData () {
                const today = new Date();
                const year = today.getFullYear();
                const month = String(today.getMonth() + 1).padStart(2, '0');
                const day = String(today.getDate()).padStart(2, '0');
                const hours = String(today.getHours()).padStart(2, '0');
                const minutes = String(today.getMinutes()).padStart(2, '0');
                const seconds = String(today.getSeconds()).padStart(2, '0');
                // 判断是否苹果设备
                const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
                const blob = new Blob([localStorage.getItem('vuex')], { type: 'application/json;charset=utf-8' });
                const name = `文字修仙小游戏存档${year}-${month}-${day} ${hours}:${minutes}:${seconds}.json`;
                if (isIOS) {
                    const reader = new FileReader();
                    reader.readAsDataURL(blob);
                    reader.onload = function () {
                        const url = reader.result;
                        const a = document.createElement('a');
                        a.style.display = 'none';
                        document.body.appendChild(a);
                        a.href = url;
                        a.download = name;
                        a.click();
                        window.URL.revokeObjectURL(url);
                    };
                } else {
                    const url = URL.createObjectURL(blob);
                    const downloadLink = document.createElement('a');
                    downloadLink.href = url;
                    downloadLink.download = name;
                    document.body.appendChild(downloadLink);
                    downloadLink.click();
                    document.body.removeChild(downloadLink);
                }
            },
            // 删档
            deleteData (type) {
                this.$confirm(type ? '你确定要清空背包里的所有道具吗?' : '你确定要删除存档吗?建议数据出问题的时候再删除', type ? '道具清空提示' : '数据删除提示', {
                    center: true,
                    cancelButtonText: '我点错了',
                    confirmButtonText: '确定以及肯定'
                }).then(() => {
                    if (type) {
                        // 关闭弹窗
                        this.show = false;
                        // 清空背包道具
                        this.player.inventory = [];
                        this.$store.commit('setPlayer', this.player);
                        this.$message({ message: '背包已清空', type: 'success' });
                    } else {
                        // 清空存档
                        localStorage.removeItem('vuex');
                        // 刷新页面
                        location.reload(1);
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
            startGame (type) {
                if (!this.player.cultivation) this.storyText = '你的修仙之旅开始了。';
                else this.storyText = '你准备好出门遭受毒打了吗?';
                this.actions = [
                    { text: '开始修炼', handler: this.cultivate },
                    { text: '探索秘境', handler: this.explore },
                    { text: '装备图鉴', type: 'warning', handler: this.openIllustration },
                    { text: '世界BOSS', type: 'danger', handler: this.assaultBoss }
                ];
                // 初始化玩家当前法力
                this.player.mana = 50;
                // 初始化玩家当前最高法力
                this.player.maxMana = 50;
                // 初始化玩家当前气血
                this.player.health = this.player.maxHealth;
                if (type == 'home') {
                    // 更新离线时间戳
                    setInterval(() => {
                        this.player.offline = Math.floor(Date.now() / 1000);
                        // 更新玩家存档
                        this.$store.commit('setPlayer', this.player);
                    }, 10000)
                    // 离线时长
                    const time = this.getMinuteDifference(this.player.offline);
                    // 赠送离线挂机修为
                    if (time >= 1) {
                        // 增加修为
                        this.breakThrough(time);
                        this.$message({
                            message: `你已神魂游离太虚${time}分钟, 获得了${time}修为`,
                            type: 'success'
                        });
                    }
                }
                // 检测玩家装备境界
                this.testingEquipmentLevel();
                // 更新玩家存档
                this.$store.commit('setPlayer', this.player);
            },
            // boss信息
            openBossInfo () {
                const info = this.boss;
                this.$confirm('', info.name, {
                    center: true,
                    message: `<div class="monsterinfo">
                        <div class="monsterinfo-box">
                            <p>境界: ${this.levelNames[info.level]}</p>
                            <p>气血: ${info.health}</p>
                            <p>攻击: ${info.attack}</p>
                            <p>防御: ${info.defense}</p>
                            <p>闪避率: ${(info.dodge * 100).toFixed(2)}%</p>
                            <p>暴击率: ${(info.critical * 100).toFixed(2)}%</p>
                            <p>神装掉落率: 100%</p>
                        </div>
                    </div>`,
                    dangerouslyUseHTMLString: true
                }).catch(() => { });
            },
            // 攻击世界boss
            fightBoss () {
                if (this.player.level < this.maxLv) {
                    this.$message.error(`你的境界尚未达到${this.levelNames[this.maxLv]}, ${this.boss.name}对于你的挑战不屑一顾`);
                    return;
                }
                // 野怪伤害计算
                const monsterAttack = this.boss.attack; // 野怪攻击
                const playerDefense = this.player.defense; // 玩家防御
                let monsterHarm = Math.max(0, Math.floor(monsterAttack - playerDefense)); // 野怪伤害
                monsterHarm = monsterHarm <= 1 ? 1 : monsterHarm; // 伤害小于1时强制破防
                // 玩家伤害计算  
                const playerAttack = this.player.attack; // 玩家攻击  
                const monsterDefense = this.boss.defense; // 野怪防御
                let playerHarm = Math.max(0, Math.floor(playerAttack - monsterDefense)); // 玩家伤害基础值
                playerHarm = playerHarm <= 1 ? 1 : playerHarm; // 伤害小于1时强制破防
                // 是否暴击
                let isMCritical = false, isCritical = false;
                // 是否闪避
                let isMDodge = false, isDodge = false;

                // 检查野怪是否暴击  
                if (Math.random() < this.boss.critical) {
                    // 野怪暴击，伤害加倍  
                    monsterHarm *= 2;
                    // 野怪成功暴击
                    isMCritical = true;
                }

                // 检查玩家是否暴击  
                if (Math.random() < this.player.critical) {
                    // 玩家暴击，伤害加倍  
                    playerHarm *= 1.5;
                    // 玩家成功暴击
                    isCritical = true;
                }

                // 检查玩家是否闪避  
                if (Math.random() > this.player.dodge) {
                    // 玩家未闪避，扣除玩家气血  
                    this.player.health -= monsterHarm;
                } else {
                    // 玩家闪避成功
                    isDodge = true;
                }

                // 检查野怪是否闪避  
                if (Math.random() > this.boss.dodge) {
                    // 野怪未闪避，扣除野怪气血  
                    this.boss.health -= playerHarm;
                } else {
                    // 野怪闪避成功
                    isMDodge = true;
                }

                // 如果双方都闪避就全扣血
                if (isMDodge && isDodge) {
                    this.player.health -= monsterHarm;
                    this.boss.health -= playerHarm;
                }

                this.player.health = Math.max(0, this.player.health);
                this.boss.health = Math.max(0, this.boss.health);

                if (this.guashaRounds > 1) {
                    // 扣除回合数
                    this.guashaRounds--;
                    // 野怪气血小于等于0
                    if (this.boss.health <= 0) {
                        const equipItem = boss.boss_Equip(this.maxLv);
                        this.isequipment = true;
                        let exp = Math.floor(this.player.maxCultivation / equip.getRandomInt(10, 50));
                        exp = exp ? exp : 1;
                        this.$message({
                            message: `你获得了${exp}修为`,
                            type: 'success'
                        });
                        this.storyText = `你击败${this.boss.name}后，获得了<span class="el-tag el-tag--${equipItem.quality}">${this.levels[equipItem.quality]}${equipItem.name}(${this.genre[equipItem.type]})</span>`;
                        // 增加修为
                        this.breakThrough(exp);
                        this.openEquipItemInfo = equipItem;
                        // 跳转背包相关页
                        this.inventoryActive = equipItem.type;
                        // 玩家获得道具
                        if (equipItem?.name) this.player.inventory.push(equipItem);
                        this.actions = [
                            { text: '回到家里', type: 'success', handler: () => this.startGame('fightBoss') }
                        ];
                    } else if (this.player.health <= 0) {
                        this.$message({
                            message: this.boss.text,
                            type: 'warning'
                        });
                        this.storyText = '你因为太弱被击败了。'
                        this.actions = [
                            { text: '回到家里', type: 'success', handler: () => this.startGame('fightBoss') }
                        ];
                    } else {
                        let dodgeText1 = '', dodgeText2 = '';
                        // 野怪
                        if (isMDodge && isDodge) {
                            dodgeText1 = `你攻击了${this.boss.name}，${isCritical ? '触发暴击' : ''}造成了${playerHarm}点伤害，剩余${this.boss.health}气血。`;
                            dodgeText2 = `${this.boss.name}攻击了你，${isMCritical ? '触发暴击' : ''}造成了${monsterHarm}点伤害`;
                        } else {
                            dodgeText1 = isMDodge ? `你攻击了${this.boss.name}，对方闪避了你的攻击，你未造成伤害，剩余${this.boss.health}气血。` : `你攻击了${this.boss.name}，${isCritical ? '触发暴击' : ''}造成了${playerHarm}点伤害，剩余${this.boss.health}气血。`;
                            dodgeText2 = isDodge ? `${this.boss.name}攻击了你，你闪避了对方的攻击，对方未造成伤害。` : `${this.boss.name}攻击了你，${isMCritical ? '触发暴击' : ''}造成了${monsterHarm}点伤害`;
                        }
                        this.storyText = `${this.guashaRounds}回合 / 100回合<br>${dodgeText1}<br>${dodgeText2}`;
                        this.actions = [
                            { text: '发起战斗', handler: this.fightBoss },
                            {
                                text: '立马撤退', handler: () => {
                                    this.ismonster = false;
                                    this.isequipment = false;
                                    this.storyText = '你选择了撤退，安全返回了修炼地点。';
                                    this.guashaRounds = 10;
                                    this.actions = [
                                        { text: '继续修炼', handler: this.cultivate },
                                        { text: '继续探索', handler: this.explore }
                                    ];
                                }
                            }
                        ];
                    }
                } else {
                    this.guashaRounds = 10;
                    this.$message({
                        message: this.boss.text,
                        type: 'warning'
                    });
                    this.storyText = `回合结束, 你未战胜${this.monster.name}你输了。`;
                    this.actions = [
                        { text: '回到家里', type: 'success', handler: () => this.startGame('fightBoss') }
                    ];
                }
                // 更新玩家存档
                this.$store.commit('setPlayer', this.player);
            },
            // 世界BOSS
            assaultBoss () {
                // boss生成的时间
                const time = this.getMinuteDifference(this.boss.time);
                // 如果boss已生成
                if (this.boss.name) {
                    // 生成的时间大于等于10分钟就重新生成一个boss
                    if (time >= 10) {
                        this.boss = boss.drawPrize(this.maxLv);
                    }
                    //如果没有生成boss就生成一个新的boss
                } else {
                    this.boss = boss.drawPrize(this.maxLv);
                    // 更新boss信息
                    this.$store.commit('setBoss', this.boss);
                }
                this.storyText = '';
                this.isBoss = true;
                this.guashaRounds = 100;
                this.actions = [
                    {
                        text: '返回家里', type: 'success', handler: () => {
                            this.isBoss = false;
                            this.startGame('boss');
                        }
                    },
                    { text: '攻击BOSS', type: 'danger', handler: this.fightBoss }
                ];
            },
            // 检测装备境界
            testingEquipmentLevel () {
                const equipment = this.player.equipment;
                // 用于存储超过玩家境界的装备类型 
                let equipmentTypes = [];
                // 检查并处理装备  
                if (equipment.sutra && equipment.sutra.level > this.player.level) {
                    this.equipmentClose('sutra');
                    equipmentTypes.push('sutra');
                }
                if (equipment.accessory && equipment.accessory.level > this.player.level) {
                    this.equipmentClose('accessory');
                    equipmentTypes.push('accessory');
                }
                if (equipment.armor && equipment.armor.level > this.player.level) {
                    this.equipmentClose('armor');
                    equipmentTypes.push('armor');
                }
                if (equipment.weapon && equipment.weapon.level > this.player.level) {
                    this.equipmentClose('weapon');
                    equipmentTypes.push('weapon');
                }
                // 如果有超过境界的装备，显示警告信息  
                if (equipmentTypes.length > 0) {
                    let message = '当前身上的';
                    equipmentTypes.forEach((item, index) => {
                        equipmentTypes[index] = this.genre[item];
                    });
                    if (equipmentTypes.length > 1) {
                        message += '装备（' + equipmentTypes.join(', ') + '）';
                    } else {
                        message += equipmentTypes[0] + '装备';
                    }
                    message += '境界高于自身境界, 系统自动卸下该装备';
                    this.$message({
                        message: message,
                        type: 'warning'
                    });
                }
            },
            // 打开图鉴
            openIllustration () {
                this.actions = [
                    {
                        text: '返回家里', type: 'success', handler: () => {
                            this.isIllustrations = false;
                            this.startGame('Illustration');
                        }
                    }
                ];
                this.isIllustrations = true;
                this.illustrationsItems = equipAll.drawPrize(this.maxLv);
            },
            // 图鉴装备信息
            illustrationsInfo (i, ii) {
                const info = this.illustrationsItems[i].data[ii];
                this.$confirm('', info.name, {
                    center: true,
                    message: `<div class="monsterinfo">
                        <div class="monsterinfo-box">
                            <p>类型: ${this.genre[info.type]}</p>
                            <p>境界: ${this.player.level >= this.maxLv ? this.levelNames[this.levelNames.length - 1] : this.levelNames[info.level]}</p>
                            <p>品质: ${this.levels[info.quality]}</p>
                            <p>气血: ${info.health}</p>
                            <p>攻击: ${info.attack}</p>
                            <p>防御: ${info.defense}</p>
                            <p>闪避率: ${info.dodge}%</p>
                            <p>暴击率: ${info.critical}%</p>
                            <p>获得率: ${info.prize}%</p>
                        </div>
                    </div>`,
                    dangerouslyUseHTMLString: true
                }).catch(() => { });
            },
            // 赠送新手礼包
            newbiePack (timesLeft) {
                // 如果没有领取新手礼包
                if (!this.player.isNewbie) {
                    // 初始化物品
                    let equipItem = {};
                    // 兵器
                    if (timesLeft == 4) equipItem = equip.equip_Weapons(10, false);
                    // 护甲
                    else if (timesLeft == 3) equipItem = equip.equip_Armors(10, false);
                    // 灵宝
                    else if (timesLeft == 2) equipItem = equip.equip_Accessorys(10, false);
                    // 法器
                    else if (timesLeft == 1) equipItem = equip.equip_Sutras(10, false);
                    // 发送通知
                    else if (timesLeft == 0) {
                        // 修改礼包领取状态
                        this.player.isNewbie = true;
                        this.$message({ message: `新手礼包领取成功!`, type: 'success' });
                    }
                    // 终止
                    else return;

                    // 将装备添加到库存  
                    this.player.inventory.push(equipItem);
                    // 更新剩余次数  
                    timesLeft--;
                    // 设置延时以便下一次调用
                    setTimeout(() => {
                        this.newbiePack(timesLeft);
                    }, 100);
                    // 更新玩家存档
                    this.$store.commit('setPlayer', this.player);
                }
            },
            // 修为突破
            breakThrough (exp) {
                // 如果当前境界小于最高境界当前修为大于等于总修为
                if (this.player.level < this.maxLv) {
                    if (this.player.cultivation >= this.player.maxCultivation) {
                        // 如果玩家等级大于10并且击杀数低于当前等级
                        if (this.player.level > 10 && this.player.level > this.player.taskNum) {
                            this.$notify({
                                title: '当前境界修为已满',
                                message: `需要通过击败(${this.player.taskNum}/${this.player.level})个敌人证道突破`
                            });
                            return;
                        }
                        // 清空已击杀敌人
                        this.player.taskNum = 0;
                        // 增加境界
                        this.player.level++;
                        // 增加攻击
                        this.player.attack += equip.getRandomInt(10, 30);
                        // 增加防御
                        this.player.defense += equip.getRandomInt(10, 30);
                        // 增加气血
                        this.player.maxHealth += equip.getRandomInt(100, 150);
                        // 更新气血
                        this.player.health = this.player.maxHealth;
                        // 增加玩家法力
                        this.player.mana = this.player.maxMana;
                        // 增加玩家总修为
                        this.player.maxCultivation = Math.floor(100 * Math.pow(2, this.player.level));
                        this.storyText = `恭喜你突破了！当前境界：${this.player.level >= this.maxLv ? this.levelNames[this.levelNames.length - 1] : this.levelNames[this.player.level]}`;
                        this.actions = [
                            { text: '继续修炼', handler: this.cultivate },
                            { text: '探索秘境', handler: this.explore }
                        ];
                        this.$store.commit('setPlayer', this.player);
                    } else {
                        // 当前修为
                        this.player.cultivation += exp;
                    }
                } else {
                    this.player.level = this.maxLv;
                    this.player.maxCultivation = Math.floor(100 * Math.pow(2, this.maxLv));
                    this.storyText = `你当前的境界已达到当前版本的顶峰, 无法再提升`;
                }
            },
            // 修炼逻辑
            cultivate () {
                this.ismonster = false;
                // 如果当前修为小于总修为
                if (this.player.cultivation <= this.player.maxCultivation) {
                    // 增加当前修为
                    const exp = this.player.level <= 10 ? Math.floor(this.player.maxCultivation / equip.getRandomInt(10, 30)) : Math.floor(this.player.maxCultivation / 100);
                    this.breakThrough(exp);
                    this.storyText = `你开始冥想，吸收周围的灵气。修为提升了！`;
                    this.actions = [
                        { text: '继续修炼', handler: this.cultivate },
                        { text: '探索秘境', handler: this.explore }
                    ];
                } else {
                    this.storyText = '你已经达到了当前境界的修为上限，需要突破到下一个境界。';
                    this.actions = [
                        { text: '突破境界', handler: () => this.breakThrough(1) },
                        { text: '杀敌证道', handler: this.explore }
                    ];
                }
            },
            // 探索逻辑
            explore () {
                if (this.player.level < 10) {
                    this.$message.error(`外面太危险了, 请突破到${this.levelNames[10]}再出去吧!`);
                    return;
                }
                this.guashaRounds = 10;
                this.encounterMonster();
            },
            // 遇怪逻辑
            encounterMonster () {
                // 玩家境界
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
                    defense: monster.monster_Attack(level),
                    // 闪避率
                    dodge: monster.monster_Criticalhitrate(level).toFixed(4),
                    // 暴击
                    critical: monster.monster_Criticalhitrate(level).toFixed(4)
                };
                this.ismonster = true;
                this.storyText = `你遇到了<span class="el-tag el-tag--danger">${this.monster.name}</span>`;
                this.actions = [
                    { text: '发起战斗', handler: this.fightMonster },
                    { text: '立马撤退', handler: this.runAway }
                ];
            },
            // 怪物信息
            openMonsterInfo () {
                this.$alert('', this.monster.name, {
                    center: true,
                    message: `<div class="monsterinfo">
                        <div class="monsterinfo-box">
                            <p>境界: ${this.player.level >= this.maxLv ? this.levelNames[this.levelNames.length - 1] : (this.player.level == 0 ? this.levelNames[this.player.level + 1] : this.levelNames[this.player.level])}</p>
                            <p>气血: ${this.monster.health}</p>
                            <p>攻击: ${this.monster.attack}</p>
                            <p>防御: ${this.monster.defense}</p>
                            <p>闪避率: ${(this.monster.dodge * 100).toFixed(2) ?? 0}%</p>
                            <p>暴击率: ${(this.monster.critical * 100).toFixed(2) ?? 0}%</p>
                        </div>
                    </div>`,
                    confirmButtonText: '知道了',
                    dangerouslyUseHTMLString: true
                }).catch(() => { });
            },
            // 打坐休息
            rest () {
                // 打坐扣除回合数
                if (this.guashaRounds > 1) {
                    this.guashaRounds--;
                    if (this.player.mana >= this.player.maxMana && this.player.health >= this.player.maxHealth) {
                        this.storyText = `${this.guashaRounds}回合 / 10回合<br>你的法力和气血恢复完毕`;
                        this.actions = [
                            { text: '继续干他', handler: this.fightMonster },
                            { text: '立马撤退', handler: this.runAway }
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
                        this.storyText = `${this.guashaRounds}回合 / 10回合<br>你恢复了${maxHealth}点气血和${maxMana}点法力`;
                        this.actions = [
                            { text: '继续干他', handler: this.fightMonster },
                            { text: '继续打坐', handler: this.rest },
                            { text: '立马撤退', handler: this.runAway }
                        ];
                    }
                } else {
                    this.guashaRounds = 10;
                    this.storyText = `回合结束, 你未战胜${this.monster.name}你输了。`;
                    this.actions = [
                        { text: '回到家里', type: 'success', handler: () => this.startGame('rest') }
                    ];
                }
            },
            // 战斗逻辑
            fightMonster () {
                this.ismonster = false;
                this.isequipment = false;
                // 野怪伤害计算
                const monsterAttack = this.monster.attack; // 野怪攻击
                const playerDefense = this.player.defense; // 玩家防御
                let monsterHarm = Math.max(0, Math.floor(monsterAttack - playerDefense)); // 野怪伤害
                monsterHarm = monsterHarm <= 1 ? 1 : monsterHarm; // 伤害小于1时强制破防
                // 玩家伤害计算  
                const playerAttack = this.player.attack; // 玩家攻击  
                const monsterDefense = this.monster.defense; // 野怪防御
                let playerHarm = Math.max(0, Math.floor(playerAttack - monsterDefense)); // 玩家伤害基础值
                playerHarm = playerHarm <= 1 ? 1 : playerHarm; // 伤害小于1时强制破防
                // 是否暴击
                let isMCritical = false, isCritical = false;
                // 是否闪避
                let isMDodge = false, isDodge = false;

                // 检查野怪是否暴击  
                if (Math.random() < this.monster.critical) {
                    // 野怪暴击，伤害加倍  
                    monsterHarm *= 2;
                    // 野怪成功暴击
                    isMCritical = true;
                }

                // 检查玩家是否暴击  
                if (Math.random() < this.player.critical) {
                    // 玩家暴击，伤害加倍  
                    playerHarm *= 1.5;
                    // 玩家成功暴击
                    isCritical = true;
                }

                // 检查玩家是否闪避  
                if (Math.random() > this.player.dodge) {
                    // 玩家未闪避，扣除玩家气血  
                    this.player.health -= monsterHarm;
                } else {
                    // 玩家闪避成功
                    isDodge = true;
                }

                // 检查野怪是否闪避  
                if (Math.random() > this.monster.dodge) {
                    // 野怪未闪避，扣除野怪气血  
                    this.monster.health -= playerHarm;
                } else {
                    // 野怪闪避成功
                    isMDodge = true;
                }

                this.player.health = Math.max(0, this.player.health);
                this.monster.health = Math.max(0, this.monster.health);

                if (this.guashaRounds > 1) {
                    // this.player.mana--; // 扣除玩家法力
                    // if (this.player.mana <= 0) {
                    //     this.storyText = '你的法力已经用光了, 请回家升级补充法力';
                    //     this.actions = [
                    //         { text: '打坐休息', handler: this.rest },
                    //         { text: '回到家里', type: 'success', handler: () => this.startGame('fightMonster') }
                    //     ];
                    //     return;
                    // }
                    // 扣除回合数
                    this.guashaRounds--;
                    // 野怪气血小于等于0
                    if (this.monster.health <= 0) {
                        // 增加击杀数量
                        this.player.taskNum++;
                        this.findTreasure(this.monster.name);
                        this.actions = [
                            { text: '回到家里', type: 'success', handler: () => this.startGame('fightMonster') },
                            { text: '继续修炼', handler: this.cultivate },
                            { text: '继续探索', handler: this.explore },
                        ];
                    } else if (this.player.health <= 0) {
                        this.storyText = '你因为太弱被击败了。';
                        this.actions = [
                            { text: '回到家里', type: 'success', handler: () => this.startGame('fightMonster') }
                        ];
                    } else {
                        // 玩家
                        const dodgeText1 = isMDodge ? `你攻击了${this.monster.name}，对方闪避了你的攻击，你未造成伤害，剩余${this.monster.health}气血。` : `你攻击了${this.monster.name}，${isCritical ? '触发暴击' : ''}造成了${playerHarm}点伤害，剩余${this.monster.health}气血。`;
                        // 野怪
                        const dodgeText2 = isDodge ? `${this.monster.name}攻击了你，你闪避了对方的攻击，对方未造成伤害。` : `${this.monster.name}攻击了你，${isMCritical ? '触发暴击' : ''}造成了${monsterHarm}点伤害`;
                        this.storyText = `${this.guashaRounds}回合 / 10回合<br>${dodgeText1}<br>${dodgeText2}`;
                        this.actions = [
                            { text: '发起战斗', handler: this.fightMonster },
                            { text: '打坐休息', handler: this.rest },
                            { text: '立马撤退', handler: this.runAway }
                        ];
                    }
                } else {
                    this.guashaRounds = 10;
                    this.storyText = `回合结束, 你未战胜${this.monster.name}你输了。`;
                    this.actions = [
                        { text: '回到家里', type: 'success', handler: () => this.startGame('fightMonster') }
                    ];
                }
                // 更新玩家存档
                this.$store.commit('setPlayer', this.player);
            },
            // 逃跑
            runAway () {
                this.guashaRounds--;
                this.ismonster = false;
                this.isequipment = false;
                if (equip.getRandomInt(0, 1)) {
                    this.storyText = `${this.guashaRounds}回合 / 10回合<br>撤退失败，请继续战斗。`
                    this.actions = [
                        { text: '发起攻击', handler: this.fightMonster },
                        { text: '打坐休息', handler: this.rest },
                    ];
                } else {
                    this.storyText = '你选择了撤退，安全返回了修炼地点。';
                    this.guashaRounds = 10;
                    this.actions = [
                        { text: '回到家里', type: 'success', handler: () => this.startGame('runAway') },
                        { text: '继续修炼', handler: this.cultivate },
                        { text: '继续探索', handler: this.explore }
                    ];
                }
            },
            // 发现道具
            findTreasure (name) {
                this.ismonster = false;
                this.isequipment = true;
                const randomInt = equip.getRandomInt(1, 5);
                let equipItem = null;
                let exp = Math.floor(this.player.maxCultivation / 100);
                exp = exp ? exp : 1;
                // 如果没有满级
                if (this.player.level < this.maxLv) {
                    // 增加修为
                    this.breakThrough(exp);
                }
                // 兵器
                if (randomInt == 1) equipItem = equip.equip_Weapons(this.player.level);
                // 护甲
                else if (randomInt == 2) equipItem = equip.equip_Armors(this.player.level);
                // 灵宝
                else if (randomInt == 3) equipItem = equip.equip_Accessorys(this.player.level);
                // 法器
                else if (randomInt == 4) equipItem = equip.equip_Sutras(this.player.level);
                if (randomInt == 5) {
                    this.isequipment = false;
                    this.storyText = `你击败${name}后，获得了${exp}点修为。`;
                } else {
                    this.isequipment = true;
                    this.storyText = `你击败${name}后，发现了一个宝箱，打开后获得了<span class="el-tag el-tag--${equipItem.quality}">${this.levels[equipItem.quality]}${equipItem.name}(${this.genre[equipItem.type]})</span>`;
                    this.openEquipItemInfo = equipItem;
                    // 跳转背包相关页
                    this.inventoryActive = equipItem.type;
                    // 玩家获得道具
                    if (equipItem?.name) this.player.inventory.push(equipItem);
                }
                this.actions = [
                    { text: '回到家里', type: 'success', handler: () => this.startGame('findTreasure') },
                    { text: '继续修炼', handler: this.cultivate },
                    { text: '继续探索', handler: this.explore }
                ];
                // 更新玩家存档
                this.$store.commit('setPlayer', this.player);
            },
            // 删除道具
            inventoryClose (item) {
                this.$confirm(`你确定要丢弃<span class="el-tag el-tag--${item.quality}">${this.levels[item.quality]}${item.name}(${this.genre[item.type]})</span>吗?`, '道具丢弃通知', {
                    center: true,
                    cancelButtonText: '取消',
                    confirmButtonText: '确定',
                    dangerouslyUseHTMLString: true
                }).then(() => {
                    // 删除道具
                    this.player.inventory = this.player.inventory.filter(obj => obj.id !== item.id);
                    // 更新玩家存档
                    this.$store.commit('setPlayer', this.player);
                }).catch(() => { });
            },
            // 道具信息
            inventory (id, type) {
                const inventory = this.getObjectById(id, this.player.inventory);
                this.$confirm('', inventory.name, {
                    center: true,
                    message: `<div class="monsterinfo">
                        <div class="monsterinfo-box">
                            <p>类型: ${this.genre[type] ?? '未知'}</p>
                            <p>境界: ${this.player.level >= this.maxLv ? this.levelNames[this.levelNames.length - 1] : this.levelNames[inventory.level]}</p>
                            <p>品质: ${this.levels[inventory.quality] ?? '未知'}</p>
                            <p>气血: ${inventory.health}</p>
                            <p>攻击: ${inventory.attack}</p>
                            <p>防御: ${inventory.defense}</p>
                            <p>闪避率: ${(inventory.dodge * 100).toFixed(2) ?? 0}%</p>
                            <p>暴击率: ${(inventory.critical * 100).toFixed(2) ?? 0}%</p>
                        </div>
                    </div>`,
                    cancelButtonText: '知道了',
                    confirmButtonText: '立即装备',
                    dangerouslyUseHTMLString: true
                }).then(() => {
                    // 穿装备
                    this.equipItem(id, type);
                }).catch(() => { });
            },
            // 装备信息
            equipmentInfo (type) {
                const equipment = this.player.equipment[type];
                if (!equipment) return;
                this.$confirm('', equipment.name, {
                    center: true,
                    message: `<div class="monsterinfo">
                        <div class="monsterinfo-box">
                            <p>类型: ${this.genre[type] ?? '未知'}</p>
                            <p>境界: ${this.player.level >= this.maxLv ? this.levelNames[this.levelNames.length - 1] : this.levelNames[equipment.level]}</p>
                            <p>品质: ${this.levels[equipment.quality] ?? '未知'}</p>
                            <p>气血: ${equipment.health}</p>
                            <p>攻击: ${equipment.attack}</p>
                            <p>防御: ${equipment.defense}</p>
                            <p>闪避率: ${(equipment.dodge * 100).toFixed(2) ?? 0}%</p>
                            <p>暴击率: ${(equipment.critical * 100).toFixed(2) ?? 0}%</p>
                        </div>
                    </div>`,
                    dangerouslyUseHTMLString: true
                }).catch(() => { });
            },
            // 发现的装备信息
            openEquipmentInfo () {
                const equipment = this.openEquipItemInfo;
                if (!equipment) return;
                this.$confirm('', equipment.name, {
                    center: true,
                    message: `<div class="monsterinfo">
                        <div class="monsterinfo-box">
                            <p>类型: ${this.genre[equipment.type] ?? '未知'}</p>
                            <p>境界: ${this.player.level >= this.maxLv ? this.levelNames[this.levelNames.length - 1] : this.levelNames[equipment.level]}</p>
                            <p>品质: ${this.levels[equipment.quality] ?? '未知'}</p>
                            <p>气血: ${equipment.health}</p>
                            <p>攻击: ${equipment.attack}</p>
                            <p>防御: ${equipment.defense}</p>
                            <p>闪避率: ${(equipment.dodge * 100).toFixed(2) ?? 0}%</p>
                            <p>暴击率: ${(equipment.critical * 100).toFixed(2) ?? 0}%</p>
                        </div>
                    </div>`,
                    dangerouslyUseHTMLString: true
                }).catch(() => { });
            },
            // 穿装备
            equipItem (id, type) {
                const inventoryItem = this.getObjectById(id, this.player.inventory);
                // 如果当前装备境界大于人物的境界
                if (inventoryItem.level > this.player.level) {
                    this.$message.error('当前境界不足, 无法穿戴该装备');
                    return;
                }
                // 如果当前类型的装备已经穿戴，则将其放回背包
                if (this.player.equipment[type]) {
                    const equipment = this.player.equipment[type];
                    // 更新玩家属性，移除当前穿戴装备的属性加成
                    this.player.dodge -= equipment.dodge;
                    this.player.health -= equipment.health;
                    this.player.attack -= equipment.attack;
                    this.player.defense -= equipment.defense;
                    this.player.maxHealth -= equipment.health;
                    this.player.critical -= equipment.critical;
                    // 将当前装备放回背包
                    this.player.inventory.push({ ...equipment });  // 深拷贝
                }
                // 装备新装备
                this.player.equipment[type] = { ...inventoryItem };  // 深拷贝
                this.player.dodge += inventoryItem.dodge;
                this.player.health += inventoryItem.health;
                this.player.attack += inventoryItem.attack;
                this.player.defense += inventoryItem.defense;
                this.player.maxHealth += inventoryItem.health;
                this.player.critical += inventoryItem.critical;
                // 从背包中移除新装备
                this.player.inventory = this.player.inventory.filter(item => item.id !== id);
                // 重置类型
                type = '';
                // 更新玩家存档
                this.$store.commit('setPlayer', this.player);
            },
            // 卸装备
            equipmentClose (type) {
                const { inventory, equipment } = this.player;
                // 更新玩家属性，移除当前穿戴装备的属性加成
                if (!equipment[type].id) equipment[type].id = Date.now();
                this.player.dodge -= equipment[type].dodge;
                this.player.health -= equipment[type].health;
                this.player.attack -= equipment[type].attack;
                this.player.defense -= equipment[type].defense;
                this.player.maxHealth -= equipment[type].health;
                this.player.critical -= equipment[type].critical;
                // 跳转背包相关页
                this.inventoryActive = type;
                // 添加装备到背包里
                inventory.push(equipment[type]);
                // 清空身上当前类型的装备
                equipment[type] = null;
                // 更新玩家存档
                this.$store.commit('setPlayer', this.player);
            },
            // 根据装备ID给出信息
            getObjectById (id, arr) {
                return arr.find(obj => obj.id === id);
            }
        }
    };
</script>

<style scoped>
    .title {
        position: fixed;
        top: 0;
    }

    .story {
        padding: 0 30px;
    }

    .boss-box .desc {
        margin: 10px 0;
    }

    .game-box {
        position: relative;
    }

    .setting {
        position: absolute;
        left: 0;
        top: -20px;
        font-size: 20px;
        margin-top: 10px;
    }

    .bbh {
        position: fixed;
        bottom: 10px;
        color: #ccc;
        font-size: 15px;
        display: flex;
        justify-content: center;
    }

    .dialog-footer {
        display: flex;
        justify-content: center;
    }

    .dialog-footer-button:nth-child(n+2) {
        margin-right: 10px;
    }

    .dialog-upload {
        margin-right: 10px;
    }

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
        min-width: 600px;
        max-width: 600px;
        min-height: 563px;
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
        padding: 0 3px;
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

    .inventory-content {
        margin-bottom: 15px;
        height: 120px;
        overflow: auto;
    }

    .Illustrations .inventory-content {
        height: auto;
        max-height: none;
        overflow: hidden;
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
        .title {
            font-size: 20px;
        }

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

        .dialog-footer {
            flex-direction: column;
        }

        .dialog-footer-button {
            margin-top: 10px;
            width: 100%;
        }

        .dialog-footer-button:nth-child(2) {
            position: relative;
            right: 10px;
        }

        .dialog-footer-button:nth-child(2+n) {
            margin-top: 10px;
            width: 100%;
        }

        .dialog-upload {
            margin-right: 0;
        }

        .equip-box {
            padding: 0 5px;
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

    .el-tabs__nav-wrap {
        display: flex;
        justify-content: center;
    }

    @media only screen and (max-width: 750px) {
        .el-message-box {
            width: 300px !important;
        }

        .el-upload {
            display: inline !important;
        }
    }
</style>