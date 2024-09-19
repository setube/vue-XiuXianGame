<template>
    <div class="explore">
        <div class="cultivate" v-if="$store.monster.name">
            你遇到了<span class="el-tag el-tag--danger" @click="openMonsterInfo">{{ monster.name }}</span>
            <div class="storyText">
                <div class="storyText-box">
                    <el-scrollbar ref="scrollbar" always>
                        <p class="fighting" v-if="isFighting">
                            {{ guashaRounds }}回合 / 10回合
                        </p>
                        <p v-for="(item, index) in texts" :key="index" v-html="item" @click="openEquipmentInfo(openEquipItemInfo)" />
                    </el-scrollbar>
                </div>
            </div>
            <div class="actions">
                <div class="action">
                    <el-button class="item" @click="operate('startFight')" :disabled="isEnd">
                        发起战斗<span class="shortcutKeys">(Q)</span>
                    </el-button>
                </div>
                <div class="action">
                    <el-button class="item" @click="operate('harvestPet')" :disabled="isCaptureFailed">
                        收服对方<span class="shortcutKeys">(E)</span>
                    </el-button>
                </div>
                <div class="action">
                    <el-button class="item" @click="operate('runAway')" :disabled="isFailedRetreat">
                        立马撤退<span class="shortcutKeys">(R)</span>
                    </el-button>
                </div>
                <div class="action">
                    <el-button class="item" @click="operate('explore')" :disabled="player.health <= 0" v-if="isEnd">
                        继续探索<span class="shortcutKeys">(F)</span>
                    </el-button>
                </div>
                <div class="action">
                    <el-button class="item" @click="operate('goHome')" v-if="isEnd">
                        回家疗伤<span class="shortcutKeys">(G)</span>
                    </el-button>
                </div>
            </div>
        </div>
        <div class="cultivate error" v-else>
            <el-result icon="error" title="缺少对战信息" sub-title="请返回地图重新探索">
                <template #extra>
                    <el-button :type="!player.dark ? 'primary' : ''" @click="$router.push('/map')">返回地图</el-button>
                </template>
            </el-result>
        </div>
    </div>
</template>

<script>
    // 装备
    import equip from '@/plugins/equip';
    // 成就
    import achievement from '@/plugins/achievement';

    export default {
        data () {
            return {
                // 日志
                texts: [],
                // 是否结束战斗
                isEnd: false,
                player: {},
                // 野怪信息
                monster: {},
                loading: true,
                // 是否胜利
                victory: false,
                timerIds: [],
                isFighting: false,
                // 回合数
                guashaRounds: 10,
                // 撤退失败
                isFailedRetreat: false,
                // 收服失败
                isCaptureFailed: false,
                openEquipItemInfo: {}
            }
        },
        beforeUnmount () {
            this.stopFight();
            // 移除键盘监听
            window.removeEventListener('keydown', this.operate);
        },
        mounted () {
            this.player = this.$store.player;
            // 判断野怪信息是否不为空
            if (this.$store.monster.name) {
                this.loading = false;
                this.monster = this.$store.monster;
            }
            // 添加键盘监听
            window.addEventListener('keydown', this.operate);
        },
        methods: {
            // 玩家操作(绑定快捷键)
            operate (oprName) {
                oprName = typeof oprName === 'string' ? oprName : oprName.key;
                switch (oprName) {
                    // 发起战斗
                    case 'q':
                    case 'startFight':
                        if (!this.isEnd) this.startFight()
                        break;
                    // 收服对方
                    case 'e':
                    case 'harvestPet':
                        if (!this.isEnd && !this.isCaptureFailed) this.harvestPet(this.monster)
                        break;
                    // 立马撤退
                    case 'r':
                    case 'runAway':
                        if (!this.isEnd && !this.isFailedRetreat) this.runAway()
                        break;
                    // 回家疗伤
                    case 'g':
                    case 'goHome':
                        if (this.isEnd) this.goHome()
                        break;
                    // 继续探索
                    case 'f':
                    case 'explore':
                        if (this.isEnd) this.$router.push('/map');
                        return;
                    default:
                        return;
                }
            },
            // 回家疗伤
            goHome () {
                this.$store.mapData = { y: 0, x: 0, map: [] };
                this.$router.push('/home');
                this.$store.setMapScroll(0);
            },
            // 怪物信息
            openMonsterInfo () {
                const successRate = this.calculateCaptureRate();
                const newProperties = (100 - successRate) * 0.5;
                this.$alert('', this.monster.name, {
                    center: true,
                    message: `<div class="monsterinfo">
                        <div class="monsterinfo-box">
                            <p>境界: ${this.player.level == 0 ? this.$levelNames(this.player.level + 1) : this.$levelNames(this.player.level)}</p>
                            <p>悟性: ${Math.floor(newProperties)}</p>
                            <p>气血: ${this.$formatNumberToChineseUnit(this.monster.health)}</p>
                            <p>攻击: ${this.$formatNumberToChineseUnit(this.monster.attack)}</p>
                            <p>防御: ${this.$formatNumberToChineseUnit(this.monster.defense)}</p>
                            <p>闪避率: ${this.monster.dodge > 0 ? (this.monster.dodge * 100 > 100 ? 100 : (this.monster.dodge * 100).toFixed(2)) : 0}%</p>
                            <p>暴击率: ${this.monster.critical > 0 ? (this.monster.critical * 100 > 100 ? 100 : (this.monster.critical * 100).toFixed(2)) : 0}%</p>
                            <p>收服率: ${successRate}%</p>
                        </div>
                    </div>`,
                    confirmButtonText: '知道了',
                    dangerouslyUseHTMLString: true
                }).catch(() => { });
            },
            // 开始攻击
            startFight () {
                if (this.isEnd) return;
                this.isEnd = true;
                this.victory = false;
                const zs = this.player.reincarnation * 10;
                const time = zs >= 200 ? 100 : 300 - zs;
                const timerId = setInterval(() => {
                    this.fightMonster();
                    const element = this.$refs.scrollbar.wrapRef;
                    const observer = new MutationObserver(() => {
                        this.$smoothScrollToBottom(element);
                    });
                    observer.observe(element, {
                        childList: true,
                        subtree: true
                    });
                }, time);
                this.timerIds.push(timerId);
            },
            // 停止攻击
            stopFight () {
                this.timerIds.forEach(id => {
                    clearInterval(id);
                });
                this.isEnd = true;
                this.timerIds = [];
                this.isFailedRetreat = true;
                this.isCaptureFailed = true;
            },
            // 攻击怪物
            fightMonster () {
                this.isFighting = true;
                if (this.monster.health <= 0) return;
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
                // 怪物是否闪避
                const isMHit = Math.random() > this.player.dodge;
                // 玩家是否闪避
                const isPHit = Math.random() > this.monster.dodge;

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

                // 怪物没有闪避
                if (isMHit) this.player.health -= monsterHarm;

                // 玩家没有闪避
                if (isPHit) this.monster.health -= playerHarm;

                this.player.health = Math.max(0, this.player.health);
                this.monster.health = Math.max(0, this.monster.health);

                if (this.guashaRounds > 1) {
                    // 扣除回合数
                    this.guashaRounds--;
                    // 野怪气血小于等于0
                    if (this.monster.health <= 0) {
                        // 增加击杀数量
                        this.player.taskNum++;
                        // 增加培养丹
                        const reincarnation = this.player.reincarnation ? 1 + 1 * this.player.reincarnation : 1
                        this.player.props.cultivateDan += reincarnation;
                        // 发送提示
                        this.texts = [...this.texts, `击败${this.monster.name}后你获得了${reincarnation}颗培养丹`];
                        this.findTreasure(this.monster.name);
                        this.stopFight();
                    } else if (this.player.health <= 0) {
                        this.texts = [...this.texts, '你因为太弱被击败了。'];
                        this.stopFight();
                    } else {
                        // 玩家
                        this.texts = [...this.texts, !isPHit ? `你攻击了${this.monster.name}，对方闪避了你的攻击，你未造成伤害，剩余${this.monster.health}气血。` : `你攻击了${this.monster.name}，${isCritical ? '触发暴击' : ''}造成了${playerHarm}点伤害，剩余${this.monster.health}气血。`];
                        // 野怪
                        this.texts = [...this.texts, !isMHit ? `${this.monster.name}攻击了你，你闪避了对方的攻击，对方未造成伤害。` : `${this.monster.name}攻击了你，${isMCritical ? '触发暴击' : ''}造成了${monsterHarm}点伤害`];
                    }
                } else {
                    this.guashaRounds = 10;
                    this.texts = [...this.texts, `回合结束, 你未战胜${this.monster.name}你输了。`];
                    this.stopFight();
                }
                // 更新玩家存档
                this.$store.setPlayer(this.player);
            },
            // 逃跑
            runAway () {
                this.guashaRounds--;
                if (equip.getRandomInt(0, 1)) {
                    this.isFailedRetreat = true;
                    this.texts = [...this.texts, '撤退失败，继续战斗。'];
                } else {
                    this.guashaRounds = 10;
                    this.$router.push('/map');
                    this.$notifys({ title: '提示', message: '你选择了撤退。' });
                }
            },
            // 发现道具
            findTreasure () {
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
                this.texts = [...this.texts, `你击败${this.monster.name}后，发现了一个宝箱，打开后获得了<span class="el-tag el-tag--${equipItem.quality}">${this.$levels[equipItem.quality]}${equipItem.name}(${this.$genre[equipItem.type]})</span>`];
                this.openEquipItemInfo = equipItem;
                // 如果装备背包当前容量大于等于背包总容量
                if (this.player.inventory.length >= this.player.backpackCapacity) {
                    this.texts = [...this.texts, `当前装备背包容量已满, 该装备自动丢弃, 转生可增加背包容量`];
                } else {
                    // 玩家获得道具
                    this.player.inventory.push(equipItem);
                }
                // 如果没有满级
                if (this.player.level < this.$maxLv) {
                    // 增加修为
                    // 如果当前境界小于最高境界当前修为大于等于总修为
                    if (this.player.level < this.$maxLv) {
                        if (this.player.cultivation >= this.player.maxCultivation) {
                            // 如果玩家等级大于10并且击杀数低于当前等级
                            if (this.player.level > 10 && this.player.level > this.player.taskNum) {
                                this.texts = [...this.texts, `当前境界修为已满, 你需要通过击败<span style="color: #f56c6c;">(${this.player.taskNum} / ${this.player.level})</span>个敌人证道突破`];
                                return;
                            }
                            // 清空已击杀敌人
                            this.player.taskNum = 0;
                            // 增加境界
                            this.player.level++;
                            // 增加点数
                            this.player.points += 3;
                            // 更新气血
                            this.player.health = this.player.maxHealth;
                            // 增加玩家总修为
                            this.player.maxCultivation = Math.floor(100 * Math.pow(2, this.player.level));
                            this.texts = [...this.texts, `恭喜你突破了！当前境界：${this.$levelNames(this.player.level)}`];
                        } else {
                            // 当前修为
                            this.player.cultivation += exp;
                        }
                    } else {
                        this.isStop = false;
                        this.isStart = false;
                        this.player.level = this.$maxLv;
                        this.player.maxCultivation = Math.floor(100 * Math.pow(2, this.$maxLv));
                        this.texts = [...this.texts, '你当前的境界已修炼圆满, 需要转生后才能继续修炼'];
                    }
                }
                // 更新玩家存档
                this.$store.setPlayer(this.player);
            },
            // 发现的装备信息
            openEquipmentInfo (item) {
                if (!this.victory) return;
                this.$confirm('', item.name, {
                    center: true,
                    message: `<div class="monsterinfo">
                        <div class="monsterinfo-box">
                            <p>类型: ${this.$genre[item.type] ?? '未知'}</p>
                            <p>境界: ${this.$levelNames(item.level)}</p>
                            <p>品质: ${this.$levels[item.quality] ?? '未知'}</p>
                            <p>气血: ${this.$formatNumberToChineseUnit(item.health)}</p>
                            <p>攻击: ${this.$formatNumberToChineseUnit(item.attack)}</p>
                            <p>防御: ${this.$formatNumberToChineseUnit(item.defense)}</p>
                            <p>闪避率: ${(item.dodge * 100).toFixed(2) ?? 0}%</p>
                            <p>暴击率: ${(item.critical * 100).toFixed(2) ?? 0}%</p>
                        </div>
                    </div>`,
                    showCancelButton: false,
                    confirmButtonText: '确定',
                    dangerouslyUseHTMLString: true
                }).catch(() => { });
            },
            // 继续探索
            // keepExploring () {
            //     // 清空日志
            //     this.texts = [];
            //     // 恢复回合数
            //     this.guashaRounds = 10;
            //     // 继续探索
            //     this.encounterMonster();
            //     this.isEnd = false;
            //     this.isFighting = false;
            //     this.isFailedRetreat = false;
            //     this.isCaptureFailed = false;
            // },
            // 收服灵宠
            harvestPet (item) {
                this.isCaptureFailed = true;
                // 成功几率
                const successRate = this.calculateCaptureRate();
                // 是否成功收服
                const isSuccess = successRate >= this.getRandomInt(1, 100);
                // 如果成功收服
                if (isSuccess) {
                    // 总背包容量大于灵宠背包容量就可以收服对方
                    if (this.player.backpackCapacity > this.player.pets.length) {
                        // 收服后的属性根据收服前的成功率算
                        const newProperties = Math.floor((100 - successRate) * 0.5);
                        // 攻击
                        const attack = Math.floor(this.getRandomInt(50, 150) * newProperties);
                        // 防御
                        const defense = Math.floor(this.getRandomInt(1, 15) * newProperties);
                        // 血量
                        const health = Math.floor(this.getRandomInt(100, 500) * newProperties);
                        // 闪避
                        const dodge = parseFloat(this.getRandomFloatInRange(0.001, 0.01) * newProperties);
                        // 暴击
                        const critical = parseFloat(this.getRandomFloatInRange(0.001, 0.01) * newProperties);
                        // 添加到灵宠背包里
                        this.player.pets.push({
                            id: Date.now(),
                            lock: false,
                            name: item.name,
                            level: 1,
                            score: equip.calculateEquipmentScore(dodge, attack, health, critical, defense),
                            dodge,
                            health,
                            attack,
                            defense,
                            critical,
                            // 初始数据
                            initial: {
                                dodge,
                                health,
                                attack,
                                defense,
                                critical,
                                rootBone: newProperties
                            },
                            // 悟性
                            rootBone: newProperties,
                            // 好感度
                            favorability: 0,
                            // 转生
                            reincarnation: 0
                        });
                        // 玩家灵宠成就
                        const petAchievement = this.player.achievement.pet;
                        // 完成成就
                        const checkAchievement = (item) => {
                            const conditions = item.condition;
                            return (
                                (conditions.health === 0 || conditions.health <= health) &&
                                (conditions.attack === 0 || conditions.attack <= attack) &&
                                (conditions.defense === 0 || conditions.defense <= defense) &&
                                (conditions.dodge === 0 || conditions.dodge <= dodge.toFixed(2)) &&
                                (conditions.critical === 0 || conditions.critical <= critical.toFixed(2))
                            );
                        };
                        // 完成成就
                        achievement.pet().forEach(item => {
                            // 检查成就条件是否达成并且成就尚未完成
                            if (checkAchievement(item) && !petAchievement.find(i => i.id === item.id)) {
                                // 添加成就
                                this.player.achievement.pet.push({ id: item.id });
                                // 增加培养丹
                                this.player.props.cultivateDan += item.award;
                                // 发送通知
                                this.notify({ title: '获得成就提示', message: `恭喜你完成了${item.name}成就` });
                            }
                        });
                        this.texts = [...this.texts, `收服${item.name}成功`];
                        // 更新玩家存档
                        this.$store.setPlayer(this.player);
                    } else {
                        this.texts = [...this.texts, `灵宠背包容量已满, 收服${item.name}失败, 转生可增加灵宠背包容量`];
                    }
                    // 恢复回合数
                    this.guashaRounds = 10;
                    this.stopFight();
                    // 如果没有收服
                } else {
                    this.isCaptureFailed = true;
                    this.texts = [...this.texts, `收服${item.name}失败`];
                }
            },
            // 计算收服灵宠成功概率
            calculateCaptureRate () {
                // 基础100%几率
                const baseRate = 100;
                // 每升一级减少的基础几率
                const decayFactor = 0.9800;
                // 根据等级计算实际几率
                let captureRate = baseRate * Math.pow(decayFactor, this.player.level);
                // 确保几率在 0% 到 100% 之间
                captureRate = Math.floor(Math.max(0, Math.min(100, captureRate)));
                return captureRate;
            },
            getRandomInt (min, max) {
                min = Math.ceil(min);
                max = Math.floor(max);
                return Math.floor(Math.random() * (max - min + 1)) + min;
            },
            getRandomFloatInRange (min, max) {
                return Math.random() * (max - min) + min;
            }
        }
    }
</script>

<style scoped>
    .actions .action {
        width: calc(33.333% - 10px);
        margin: 5px;
    }

    .shortcutKeys {
        color: rgba(169, 169, 169, 0.4);
        margin-left: 2px;
    }

    .cultivate.error {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 770px;
    }

    @media only screen and (max-width: 750px) {
        .shortcutKeys {
            display: none;
        }
    }
</style>