<template>
    <div class="endless-tower">
        <h2>无尽塔 - 当前层数: {{ currentFloor }} (最高层数: {{ highestFloor }})</h2>

        <div class="battle-info">
            <div class="player-info">
                <h3>{{ '玩家' }}</h3>
                <div class="health-bar">
                    <div class="health-fill" :style="{ width: `${(player.health / player.maxHealth) * 100}%` }"></div>
                    <span class="health-text">{{ Math.max(0, player.health) }} / {{ player.maxHealth }}</span>
                </div>
                <p>攻击: {{ player.attack }}</p>
                <p>防御: {{ player.defense }}</p>
            </div>

            <div class="vs">VS</div>

            <div class="monster-info" v-if="currentMonster">
                <h3>{{ currentMonster.name }}</h3>
                <div class="health-bar">
                    <div class="health-fill"
                        :style="{ width: `${(currentMonster.health / currentMonster.maxHealth) * 100}%` }">
                    </div>
                    <span class="health-text">{{ Math.max(0, currentMonster.health) }} / {{ currentMonster.maxHealth
                        }}</span>
                </div>
                <p>攻击: {{ currentMonster.attack }}</p>
                <p>防御: {{ currentMonster.defense }}</p>
            </div>
        </div>

        <div class="actions">
            <el-button @click="toggleAutoFight" :type="isAutoFighting ? 'danger' : 'primary'"
                :disabled="player.health <= 0">
                {{ isAutoFighting ? '停止自动战斗' : '开始自动战斗' }}
            </el-button>
            <el-button @click="continueFighting"
                :disabled="isAutoFighting || !currentMonster || player.health <= 0">继续战斗</el-button>
            <el-button @click="toggleSweep" :type="isSweeping ? 'danger' : 'primary'" :disabled="player.health <= 0">
                {{ isSweeping ? '停止扫荡' : '开始扫荡' }}
            </el-button>
            <el-button @click="retreat">撤退</el-button>
        </div>

        <div class="sweep-info" v-if="isSweeping">
            <p>扫荡时间: {{ sweepTime }} 秒</p>
            <p>获得修为: {{ sweepResults.expGain }}</p>
            <p>获得灵石: {{ sweepResults.moneyGain }}</p>
            <p>获得装备: {{ sweepResults.equipmentGained }} 件</p>
        </div>

        <div class="battle-log">
            <el-scrollbar height="300px">
                <p v-for="(log, index) in battleLogs" :key="index" v-html="log"></p>
            </el-scrollbar>
        </div>
    </div>
</template>

<script>
import monsters from '@/plugins/monster'
import equip from '@/plugins/equip'

export default {
    data() {
        return {
            currentFloor: 1,
            highestFloor: 1,
            currentMonster: null,
            battleLogs: [],
            isAutoFighting: false,
            isSweeping: false,
            player: {},
            autoFightInterval: null,
            sweepInterval: null,
            sweepTime: 0,
            sweepFightInterval: null,
            sweepResults: {
                expGain: 0,
                moneyGain: 0,
                equipmentGained: 0
            }
        }
    },
    mounted() {
        this.player = this.$store.player; // 深拷贝玩家数据
        this.highestFloor = this.player.highestTowerFloor || 1; // 获取最高层数
        this.currentFloor = 1
        if (this.highestFloor > 1) this.currentFloor = this.highestFloor - 1;
        this.generateMonster(); // 生成第一个怪物
    },
    beforeUnmount() {
        this.stopAutoFight();
        this.stopSweep();
    },
    methods: {
        generateMonster() {
            const monsterLevel = this.currentFloor * 2;
            const monsterName = monsters.monster_Names(monsterLevel);
            this.currentMonster = {
                name: monsterName,
                level: monsterLevel,
                health: monsters.monster_Health(monsterLevel),
                maxHealth: monsters.monster_Health(monsterLevel),
                attack: monsters.monster_Attack(monsterLevel),
                defense: monsters.monster_Defense(monsterLevel),
                dodge: monsters.monster_Criticalhitrate(monsterLevel),
                critical: monsters.monster_Criticalhitrate(monsterLevel)
            };
            this.battleLogs.push(`第 ${this.currentFloor} 层：遇到了 ${this.currentMonster.name}！`);
        },
        fight() {
            if (this.player.health <= 0) {
                this.handlePlayerDefeat();
                return;
            }
            if (!this.currentMonster || this.currentMonster.health <= 0) {
                this.generateMonster();
                return;
            }
            // 玩家攻击
            const playerDamage = Math.max(1, this.player.attack - this.currentMonster.defense);
            this.currentMonster.health = Math.max(0, this.currentMonster.health - playerDamage);
            this.battleLogs.push(`你对 ${this.currentMonster.name} 造成了 ${playerDamage} 点伤害`);
            // 检查怪物是否被击败
            if (this.currentMonster.health <= 0) {
                this.handleMonsterDefeat();
                return;
            }
            // 怪物攻击
            const monsterDamage = Math.max(1, this.currentMonster.attack - this.player.defense);
            this.player.health = Math.max(0, this.player.health - monsterDamage);
            this.battleLogs.push(`${this.currentMonster.name} 对你造成了 ${monsterDamage} 点伤害`);
            // 检查玩家是否被击败
            if (this.player.health <= 0) {
                this.handlePlayerDefeat();
            }
        },
        handleMonsterDefeat() {
            const expGain = Math.floor(this.currentMonster.level * 100);
            const moneyGain = Math.floor(this.currentMonster.level * 10);
            this.player.cultivation += expGain;
            //this.player.jishaNum++;
            this.player.props.money += moneyGain;
            this.battleLogs.push(`你击败了 ${this.currentMonster.name}！`);
            this.battleLogs.push(`获得了 ${expGain}点修为和 ${moneyGain}灵石`);
            // 随机获得装备
            this.getRandomEquipment();
            // 更新最高层数并前往下一层
            this.currentFloor++;
            if (this.currentFloor > this.highestFloor) {
                this.highestFloor = this.currentFloor;
                this.player.highestTowerFloor = this.highestFloor;
            }
            this.battleLogs.push(`成功通过第 ${this.currentFloor - 1} 层，自动前往第 ${this.currentFloor} 层`);
            this.$store.setPlayer(this.player);
            this.generateMonster(); // 生成新的怪物（下一层级）
        },
        handlePlayerDefeat() {
            this.battleLogs.push('你被击败了！挑战结束。');
            //this.player.ggNum++
            this.isAutoFighting = false;
            this.isSweeping = false;
            this.stopAutoFight();
            this.stopSweep();
            this.$store.setPlayer(this.player);
        },
        toggleAutoFight() {
            this.isAutoFighting = !this.isAutoFighting;
            if (this.isAutoFighting) {
                this.autoFightInterval = setInterval(this.fight, 1000);
            } else {
                this.stopAutoFight();
            }
        },
        stopAutoFight() {
            clearInterval(this.autoFightInterval);
            this.autoFightInterval = null;
        },
        continueFighting() {
            this.fight();
        },
        retreat() {
            this.isAutoFighting = false;
            this.isSweeping = false;
            this.stopAutoFight();
            this.stopSweep();
            this.battleLogs.push('你选择撤退，结束了挑战');
            this.$router.push('/home');
        },
        getRandomEquipment() {
            try {
                let equipItem = {};
                let exp = Math.floor(this.player.maxCultivation / 100);
                exp = exp ? exp : 1;
                // 如果总背包容量大于装备背包容量
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
                this.openEquipItemInfo = equipItem;
                // 如果装备背包当前容量大于等于背包总容量
                if (this.player.inventory.length >= this.player.backpackCapacity) {
                    this.battleLogs.push(`当前装备背包容量已满, 该装备自动丢弃, 转生可增加背包容量`);
                } else {
                    // 玩家获得道具
                    this.player.inventory.push(equipItem);
                }

            } catch (error) {
                console.error('Error drawing prize:', error);
                this.battleLogs.push('尝试获得装备时发生错误');
            }
            return false;
        },
        toggleSweep() {
            this.isSweeping = !this.isSweeping;
            if (this.isSweeping) {
                this.sweepTime = 0;
                this.sweepResults = { expGain: 0, moneyGain: 0, equipmentGained: 0 };
                this.sweepInterval = setInterval(this.sweep, 1000); // 仍然每秒更新一次时间
                this.sweepFightInterval = setInterval(this.sweepFight, 30000); // 每30秒战斗一次
            } else {
                this.stopSweep();
            }
        },
        stopSweep() {
            clearInterval(this.sweepInterval);
            clearInterval(this.sweepFightInterval);
            this.sweepInterval = null;
            this.sweepFightInterval = null;
        },
        sweep() {
            this.sweepTime++;
            // 每60秒（1分钟）记录一次日志
            if (this.sweepTime % 60 === 0) {
                this.battleLogs.push(`扫荡进行中：已持续 ${this.sweepTime} 秒，获得 ${this.sweepResults.expGain}</span> 点修为，${this.sweepResults.moneyGain}灵石，${this.sweepResults.equipmentGained} 件装备。`);
            }
        },
        sweepFight() {
            // 模拟一次战斗
            const expGain = Math.floor(this.currentFloor * 10);
            const moneyGain = Math.floor(this.currentFloor * 10);

            this.player.cultivation += expGain;
            this.player.props.money += moneyGain;
            this.player.jishaNum++; // 增加击杀数

            this.sweepResults.expGain += expGain;
            this.sweepResults.moneyGain += moneyGain;

            let equipmentGained = false;
            // 10% 概率获得装备
            if (Math.random() < 0.1) {
                if (this.getRandomEquipment()) {
                    this.sweepResults.equipmentGained++;
                    equipmentGained = true;
                }
            }

            this.$store.setPlayer(this.player);

            // 记录战斗日志，使用 HTML 标签
            let logMessage = `扫荡战斗：获得 ${expGain}点修为，${moneyGain}灵石`;
            if (equipmentGained) {
                logMessage += `，1 件装备`;
            }
            logMessage += '。';

            this.battleLogs.push(logMessage);
        },
    }
}
</script>


<style scoped>
.endless-tower {
    padding: 20px;
    max-width: 800px;
    margin: 0 auto;
}

h2 {
    text-align: center;
    margin-bottom: 20px;
    color: #333;
}

.battle-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    background-color: #f5f5f5;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.player-info,
.monster-info {
    width: 45%;
}

.vs {
    font-size: 24px;
    font-weight: bold;
    color: #666;
}

.health-bar {
    width: 100%;
    height: 20px;
    background-color: #e0e0e0;
    border-radius: 10px;
    overflow: hidden;
    position: relative;
    margin-bottom: 10px;
}

.health-fill {
    height: 100%;
    background-color: #4caf50;
    transition: width 0.3s ease;
}

.health-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #000;
    font-size: 12px;
    font-weight: bold;
}

.actions {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
}

.actions .el-button {
    flex: 1;
    margin: 0 5px;
}

.sweep-info {
    margin-top: 20px;
    padding: 15px;
    background-color: #f0f0f0;
    border-radius: 5px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.sweep-info p {
    margin: 5px 0;
    font-size: 14px;
    color: #333;
}

.battle-log {
    border: 1px solid #ddd;
    padding: 10px;
    border-radius: 5px;
    background-color: #fff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.battle-log p {
    margin: 5px 0;
    font-size: 14px;
    color: #666;
}


/* 响应式设计 */
@media (max-width: 768px) {
    .battle-info {
        flex-direction: column;
    }

    .player-info,
    .monster-info {
        width: 100%;
        margin-bottom: 20px;
    }

    .vs {
        margin: 10px 0;
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