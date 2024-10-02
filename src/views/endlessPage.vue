<template>
    <div class="endless-tower">
        <div class="battle-info">
            <div class="player-info">
                <tag class="name"
                    type="primary"
                    @click="openInfo('player')"
                    v-text="player.name" />
                <el-progress :percentage="playerProgress"
                    :status="playerStatus"
                    :format="playerHealth"
                    :stroke-width="20"
                    text-inside />
            </div>
            <div class="vs">VS</div>
            <div class="monster-info"
                v-if="monster">
                <tag class="name"
                    type="danger"
                    @click="openInfo('monster')">{{ monster.name }}</tag>
                <el-progress :percentage="monsterProgress"
                    :status="monsterStatus"
                    :format="monsterhealth"
                    :stroke-width="20"
                    text-inside />
            </div>
        </div>
        <div class="actions">
            <el-button v-for="(item, index) in buttonData"
                :key="index"
                @click="item.click"
                :disabled="item.disabled"
                v-text="item.text" />
        </div>
        <div class="sweep-info">
            <el-row>
                <el-col :span="6"
                    v-for="(item, index) in sweepData"
                    :key="index">
                    <div class="el-statistic">
                        <div class="el-statistic__head"
                            v-text="item.name" />
                        <div class="el-statistic__content">
                            <span class="el-statistic__number"
                                v-text="item.suffix" />
                        </div>
                    </div>
                </el-col>
            </el-row>
        </div>
        <el-scrollbar class="battle-log"
            height="300px"
            ref="scrollbar"
            always>
            <p v-for="(log, index) in battleLogs"
                :key="index"
                v-html="log" />
        </el-scrollbar>
    </div>
</template>

<script>
// 标签组件
import tag from '@/components/tag.vue';
// boss
import boss from '@/plugins/boss';
// 装备
import equip from '@/plugins/equip';
// 怪物
import monsters from '@/plugins/monster';

import { formatTime } from '@/utils'

export default {
    data() {
        return {
            // 玩家数据
            player: {},
            // 怪物数据
            monster: null,
            observer: null,
            // 扫荡时间
            sweepTime: 0,
            // 战斗日志
            battleLogs: [],
            // 当前层数
            currentFloor: 1,
            // 是否正在扫荡
            isSweeping: false,
            // 扫荡结果
            sweepResults: {
                // 获得的修为
                expGain: 0,
                // 获得的灵石
                moneyGain: 0,
                // 获得的装备数量
                equipmentGained: 0
            },
            // 玩家气血状态
            playerStatus: 'success',
            // 怪物气血状态
            monsterStatus: 'success',
            // 扫荡时间间隔
            sweepInterval: null,
            // 是否自动战斗
            isAutoFighting: false,
            // 自动战斗时间间隔
            autoFightInterval: null,
            // 扫荡战斗时间间隔
            sweepFightInterval: null
        }
    },
    created() {
        // 玩家数据
        this.player = this.$store.player;
        // 当前层数
        this.currentFloor = this.player.highestTowerFloor > 1 ? this.player.highestTowerFloor - 1 : 1
    },
    mounted() {
        // 生成日志
        this.battleLogs.push(`欢迎来到无尽塔, 这里是无尽塔的第${this.currentFloor}层, 你的爬塔最高记录为${this.player.highestTowerFloor}层`);
        // 生成怪物
        this.generateMonster();
    },
    beforeUnmount() {
        // 停止自动战斗
        this.stopAutoFight();
        // 停止扫荡
        this.stopSweep();
        this.stopObserving();
    },
    watch: {
        battleLogs: {
            deep: true,
            handler() {
                this.setupObserver();
            }
        },
        'player.health': function (val) {
            const { health, maxHealth } = this.player;
            this.playerStatus = this.getStatus(health, maxHealth);
        },
        'monster.health': function (val) {
            const { health, maxHealth } = this.monster;
            this.monsterStatus = this.getStatus(health, maxHealth);
        }
    },
    components: {
        tag
    },
    computed: {
        // 扫荡相关信息
        sweepData() {
            return [
                { name: '扫荡时间', suffix: formatTime(this.sweepTime) },
                { name: '获得修为', suffix: `${this.$formatNumberToChineseUnit(this.sweepResults.expGain)}点` },
                { name: '获得灵石', suffix: `${this.$formatNumberToChineseUnit(this.sweepResults.moneyGain)}块` },
                { name: '获得装备', suffix: `${this.$formatNumberToChineseUnit(this.sweepResults.equipmentGained)}件` },
            ];
        },
        // 按钮
        buttonData() {
            return [
                { text: this.isAutoFighting ? '停止对战' : '自动对战', click: () => this.toggleAutoFight(), disabled: this.isSweeping || this.player.health <= 0 },
                { text: '进行对战', click: () => this.fight(), disabled: this.isSweeping || this.isAutoFighting || !this.monster || this.player.health <= 0 },
                { text: this.isSweeping ? '停止扫荡' : '开始扫荡', click: () => this.toggleSweep(), disabled: this.isAutoFighting || this.player.health <= 0 },
                { text: '撤退回家', click: () => this.retreat(), disabled: false }
            ];
        },
        // 玩家血量进度条
        playerProgress() {
            return ((this.player.health / this.player.maxHealth) * 100).toFixed(2);
        },
        // 怪物血量进度条
        monsterProgress() {
            return ((this.monster.health / this.monster.maxHealth) * 100).toFixed(2);
        }
    },
    methods: {
        // 玩家气血
        playerHealth() {
            const { health, maxHealth } = this.player;
            return `${Math.max(0, health)} / ${Math.max(0, maxHealth)}`;
        },
        // 怪物气血
        monsterhealth() {
            const { health, maxHealth } = this.monster;
            return `${Math.max(0, health)} / ${Math.max(0, maxHealth)}`;
        },
        // 动态修改血量状态
        getStatus(health, maxHealth) {
            const num = (health / maxHealth) * 100;
            return num >= 70 ? 'success' : (num >= 30 ? 'warning' : 'exception');
        },
        // 生成当前层的怪物
        generateMonster() {
            // 根据当前层数计算怪物等级
            const level = this.currentFloor * 2;
            const health = monsters.monster_Health(level);
            this.monster = {
                // 名称
                name: monsters.monster_Names(level),
                // 等级
                level,
                // 闪避率
                dodge: monsters.monster_Criticalhitrate(level),
                // 攻击
                attack: monsters.monster_Attack(level),
                // 气血
                health: health,
                // 防御
                defense: monsters.monster_Defense(level),
                // 最大气血
                maxHealth: health,
                // 暴击率
                critical: monsters.monster_Criticalhitrate(level)
            };
            // 日志
            this.battleLogs.push(`你遇到了本层的守护者: ${this.monster.name}`);
        },
        // 打开双方信息弹窗
        openInfo(type) {
            const isPlayer = type == 'player';
            const info = isPlayer ? this.player : this.monster;
            this.$confirm('', isPlayer ? this.player.name : info.name, {
                center: true,
                message: `<div class="monsterinfo">
                        <div class="monsterinfo-box">
                            <p>气血: ${this.$formatNumberToChineseUnit(info.health)}</p>
                            <p>攻击: ${this.$formatNumberToChineseUnit(info.attack)}</p>
                            <p>防御: ${this.$formatNumberToChineseUnit(info.defense)}</p>
                            <p>闪避率: ${info.dodge > 0 ? (info.dodge * 100 > 100 ? 100 : (info.dodge * 100).toFixed(2)) : 0}%</p>
                            <p>暴击率: ${info.critical > 0 ? (info.critical * 100 > 100 ? 100 : (info.critical * 100).toFixed(2)) : 0}%</p>
                        </div>
                    </div>`,
                showCancelButton: false,
                confirmButtonText: '知道了',
                dangerouslyUseHTMLString: true
            }).catch(() => { });
        },
        // 进行战斗
        fight() {
            // 被击败
            if (this.player.health <= 0) {
                this.handlePlayerDefeat();
                return;
            }
            // 重新生成新怪物
            if (!this.monster || this.monster.health <= 0) {
                this.generateMonster();
                return;
            }
            // 玩家攻击怪物
            const playerDamage = Math.max(1, this.player.attack - this.monster.defense); // 计算玩家造成的伤害
            this.monster.health = Math.max(0, this.monster.health - playerDamage); // 减少怪物气血
            this.battleLogs.push(`你对 ${this.monster.name} 造成了 ${playerDamage} 点伤害`); // 日志
            // 检查怪物是否被击败
            if (this.monster.health <= 0) {
                this.handleMonsterDefeat();
                return;
            }
            // 怪物攻击玩家
            const monsterDamage = Math.max(1, this.monster.attack - this.player.defense); // 怪物造成的伤害
            this.player.health = Math.max(0, this.player.health - monsterDamage); // 减少玩家气血
            this.battleLogs.push(`${this.monster.name} 对你造成了 ${monsterDamage} 点伤害`); // 日志
            // 玩家是否被击败
            if (this.player.health <= 0) this.handlePlayerDefeat();
        },
        // 处理怪物被击败的情况
        handleMonsterDefeat() {
            // 修为
            const expGain = Math.floor(this.monster.level * 100);
            // 灵石
            const moneyGain = Math.floor(this.monster.level * 10);
            // 增加修为
            this.player.cultivation += expGain;
            // 增加灵石
            this.player.props.money += moneyGain;
            // 日志
            this.battleLogs.push(`你击败了 ${this.monster.name}！`);
            this.battleLogs.push(`获得了 ${expGain}点修为和 ${moneyGain}灵石`);
            // 随机获得装备
            this.getRandomEquipment();
            // 增加层数
            this.currentFloor++;
            // 如果当前层数大于最高层数
            if (this.currentFloor > this.player.highestTowerFloor) this.player.highestTowerFloor = this.currentFloor;
            // 日志
            this.battleLogs.push(`成功通过第 ${this.currentFloor - 1} 层，自动前往第 ${this.currentFloor} 层`);
            // 生成新的怪物（下一层）
            this.generateMonster();
        },
        // 处理玩家被击败的情况
        handlePlayerDefeat() {
            // 日志
            this.battleLogs.push('你被击败了！挑战结束。');
            this.battleLogs.push(`${this.monster.name}: ${boss.drawPrize(this.monster.level).text}`);
            // 关闭自动战斗
            this.isAutoFighting = false;
            // 关闭扫荡
            this.isSweeping = false;
            // 停止自动战斗
            this.stopAutoFight();
            // 停止扫荡
            this.stopSweep();
        },
        // 切换自动战斗状态
        toggleAutoFight() {
            // 切换自动战斗状态
            this.isAutoFighting = !this.isAutoFighting;
            // 启动自动战斗
            if (this.isAutoFighting) this.autoFightInterval = setInterval(this.fight, 1000);
            // 停止自动战斗
            else this.stopAutoFight();
        },
        // 停止自动战斗
        stopAutoFight() {
            clearInterval(this.autoFightInterval);
            this.autoFightInterval = null;
        },
        // 撤退
        retreat() {
            // 关闭自动战斗
            this.isAutoFighting = false;
            // 关闭扫荡
            this.isSweeping = false;
            // 停止自动战斗
            this.stopAutoFight();
            // 停止扫荡
            this.stopSweep();
            this.$router.push('/home');
        },
        // 随机获得装备
        getRandomEquipment() {
            let equipItem = {};
            let exp = Math.floor(this.player.maxCultivation / 100)
            exp = exp ? exp : 1;
            // 是否胜利
            this.victory = true;
            const randomInt = equip.getRandomInt(1, 4);
            // 神兵
            if (randomInt == 1) equipItem = equip.equip_Weapons(this.player.level);
            // 护甲
            else if (randomInt == 2) equipItem = equip.equip_Armors(this.player.level);
            // 灵宝
            else if (randomInt == 3) equipItem = equip.equip_Accessorys(this.player.level);
            // 法器
            else if (randomInt == 4) equipItem = equip.equip_Sutras(this.player.level);
            this.battleLogs.push(`你发现了一个宝箱，打开后获得${this.$levels[equipItem.quality]}${equipItem.name}(${this.$genre[equipItem.type]})`);
            // 装备信息
            this.openEquipItemInfo = equipItem;
            // 如果背包满了就不增加装备
            if (this.player.inventory.length >= this.player.backpackCapacity) this.battleLogs.push(`当前装备背包容量已满, 该装备自动丢弃, 转生可增加背包容量`);
            else this.player.inventory.push(equipItem);
        },
        // 切换扫荡状态
        toggleSweep() {
            // 扫荡状态
            this.isSweeping = !this.isSweeping;
            if (this.isSweeping) {
                // 重置扫荡时间
                this.sweepTime = 0;
                // 重置扫荡结果
                this.sweepResults = { expGain: 0, moneyGain: 0, equipmentGained: 0 };
                // 设定每秒更新扫荡时间
                this.sweepInterval = setInterval(this.sweep, 1000);
                // 每30秒进行一次战斗
                this.sweepFightInterval = setInterval(this.sweepFight, 30000);
            } else {
                // 停止扫荡
                this.stopSweep();
            }
        },
        // 停止扫荡
        stopSweep() {
            clearInterval(this.sweepInterval);
            clearInterval(this.sweepFightInterval);
            this.sweepInterval = null;
            this.sweepFightInterval = null;
        },
        // 进行扫荡
        sweep() {
            // 增加扫荡时间
            this.sweepTime++;
            // 60秒更新一次日志
            if (this.sweepTime % 60 === 0) this.battleLogs.push(`扫荡结果：目前已扫荡${formatTime(this.sweepTime)}，恭喜你获得了${this.sweepResults.expGain}点修为，${this.sweepResults.moneyGain}灵石和${this.sweepResults.equipmentGained}件装备。`);
        },
        // 扫荡战斗
        sweepFight() {
            // 根据当前层数计算获得经验值
            const expGain = Math.floor(this.currentFloor * 10);
            // 根据当前层数计算获得灵石
            const moneyGain = Math.floor(this.currentFloor * 10);
            // 增加玩家修为
            this.player.cultivation += expGain;
            // 增加玩家灵石
            this.player.props.money += moneyGain;
            // 增加击杀数
            this.player.jishaNum++;
            // 更新扫荡结果中的经验值
            this.sweepResults.expGain += expGain;
            // 更新扫荡结果中的灵石
            this.sweepResults.moneyGain += moneyGain;
            // 10% 概率获得装备
            const equipmentGained = Math.random() < 0.1;
            if (equipmentGained) {
                this.getRandomEquipment();
                this.sweepResults.equipmentGained++;
            }
            // 日志
            this.battleLogs.push(`扫荡结果：恭喜你获得了${expGain}点修为，${moneyGain}块灵石${equipmentGained ? '和1件装备' : '。'}`);
        },
        setupObserver() {
            const element = this.$refs.scrollbar.wrapRef;
            if (element) {
                this.observer = new MutationObserver(() => this.$smoothScrollToBottom(element));
                this.observer.observe(element, { subtree: true, childList: true });
            }
        },
        stopObserving() {
            if (this.observer) {
                this.observer.disconnect();
                this.observer = null;
            }
        },
        // formatTime (seconds) {
        //     if (seconds < 60) {
        //         return `${seconds}秒`;
        //     } else if (seconds < 3600) {
        //         const minutes = Math.floor(seconds / 60);
        //         const remainingSeconds = seconds % 60;
        //         return `${minutes}分钟${remainingSeconds}秒`;
        //     } else {
        //         const hours = Math.floor(seconds / 3600);
        //         seconds %= 3600;
        //         const minutes = Math.floor(seconds / 60);
        //         const remainingSeconds = seconds % 60;
        //         return `${hours}小时${minutes}分钟${remainingSeconds}秒`;
        //     }
        // }
    }
}
</script>


<style scoped>
.battle-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.player-info,
.monster-info {
    width: 45%;
}

.name {
    margin-bottom: 10px;
}

.vs {
    font-size: 24px;
    font-weight: bold;
    color: var(--el-color-info);
}

.actions {
    display: flex;
    justify-content: space-between;
    margin: 20px 0;
}

.actions .el-button {
    flex: 1;
    margin: 0 5px;
}

.sweep-info {
    margin: 20px 0;
}

.sweep-info p {
    margin: 5px 0;
    font-size: 14px;
}

.battle-log {
    border: 1px solid #ddd;
    padding: 10px;
    border-radius: 5px;
}

.battle-log p {
    margin: 5px 0;
    font-size: 14px;
    color: var(--el-color-info);
}

@media (max-width: 768px) {

    .player-info,
    .monster-info {
        width: 100%;
        margin-bottom: 20px;
    }

    .vs {
        margin: 0 10px;
    }

    .actions {
        flex-wrap: wrap;
    }

    .actions .el-button {
        flex: 1 0 40%;
        margin: 5px;
    }
}
</style>
