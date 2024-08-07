<template>
  <div class="cultivate">
    <div class="boss">
      <div class="boss-box">
        <span
          class="el-tag el-tag--warning"
          @click="openBossInfo"
        >{{ boss.name }}</span>
        <el-alert
          class="desc"
          :title="boss.desc"
          :closable="false"
          type="error"
        />
      </div>
    </div>
    <div class="storyText">
      <div
        class="storyText-box"
        ref="storyText"
      >
        <p
          class="fighting"
          v-if="isFighting"
        >
          {{ guashaRounds }}回合 / 50回合
        </p>
        <p
          v-for="(item, index) in texts"
          :key="index"
          v-html="item"
          @click="openEquipmentInfo(equipmentInfo)"
        />
      </div>
    </div>
    <div class="actions">
      <el-button
        @click="startFightBoss"
        :disabled="isEnd"
      >
        发起战斗
      </el-button>
      <el-button @click="$router.push('/')">
        回家疗伤
      </el-button>
    </div>
  </div>
</template>

<script>
    // 世界boss
    import boss from '@/plugins/boss';

    export default {
        data () {
            return {
                boss: {},
                isEnd: false,
                texts: [],
                player: {},
                timerIds: [],
                currency: 0,
                isFighting: false,
                startFight: false,
                isequipment: false,
                guashaRounds: 50,
                equipmentInfo: {}
            }
        },
        mounted () {
            this.boss = this.$store.state.boss;
            this.player = this.$store.state.player;
            this.currency = boss.getRandomInt(1, 10);
            this.assaultBoss();
        },
        beforeDestroy () {
            this.stopFightBoss();
        },
        methods: {
            // 开始攻击
            startFightBoss () {
                if (this.isEnd) return;
                this.isEnd = true;
                const timerId = setInterval(() => {
                    this.fightBoss();
                    const element = this.$refs.storyText;
                    const observer = new MutationObserver(() => {
                        this.$smoothScrollToBottom(element);
                    });
                    observer.observe(element, {
                        childList: true,
                        subtree: true
                    });
                }, 300);
                this.timerIds.push(timerId);
            },
            // 停止攻击
            stopFightBoss () {
                this.timerIds.forEach(id => {
                    clearInterval(id);
                });
                this.timerIds = [];
            },
            // boss信息
            openBossInfo () {
                const info = this.boss;
                this.$confirm('', info.name, {
                    center: true,
                    message: `<div class="monsterinfo">
                        <div class="monsterinfo-box">
                            <p>境界: ${this.$levelNames[info.level]}</p>
                            <p>气血: ${this.$formatNumberToChineseUnit(info.health)}</p>
                            <p>攻击: ${this.$formatNumberToChineseUnit(info.attack)}</p>
                            <p>防御: ${this.$formatNumberToChineseUnit(info.defense)}</p>
                            <p>闪避率: ${info.dodge > 0 ? (info.dodge * 100 > 100 ? 100 : (info.dodge * 100).toFixed(2)) : 0}%</p>
                            <p>暴击率: ${info.critical > 0 ? (info.critical * 100 > 100 ? 100 : (info.critical * 100).toFixed(2)) : 0}%</p>
                            <p>鸿蒙石掉落: ${this.currency}颗</p>
                            <p>神装掉落率: 100%</p>
                        </div>
                    </div>`,
                    dangerouslyUseHTMLString: true
                }).catch(() => { });
            },
            // 攻击世界boss
            fightBoss () {
                if (this.player.level < this.$maxLv) {
                    this.isEnd = true;
                    this.stopFightBoss();
                    this.texts = [...this.texts, `你的境界尚未达到${this.$levelNames[this.$maxLv]}, ${this.boss.name}对于你的挑战不屑一顾`];
                    return;
                }
                if (this.boss.health <= 0 || !this.boss.health) {
                    this.texts = [...this.texts, 'BOSS刷新时间还未到'];
                    return;
                }
                this.isFighting = true;
                // boss伤害计算
                const monsterAttack = this.boss.attack; // boss攻击
                const playerDefense = this.player.defense; // 玩家防御
                let monsterHarm = Math.max(0, Math.floor(monsterAttack - playerDefense)); // boss伤害
                monsterHarm = monsterHarm <= 1 ? 1 : monsterHarm; // 伤害小于1时强制破防
                // 玩家伤害计算  
                const playerAttack = this.player.attack; // 玩家攻击  
                const monsterDefense = this.boss.defense; // boss防御
                let playerHarm = Math.max(0, Math.floor(playerAttack - monsterDefense)); // 玩家伤害基础值
                playerHarm = playerHarm <= 1 ? 1 : playerHarm; // 伤害小于1时强制破防
                // 是否暴击
                let isMCritical = false, isCritical = false;
                // 是否闪避
                const isPlayerHit = Math.random() > this.boss.dodge;

                // 检查boss是否暴击  
                if (Math.random() < this.boss.critical) {
                    // boss暴击，伤害加倍  
                    monsterHarm *= 2;
                    // boss成功暴击
                    isMCritical = true;
                }

                // 检查玩家是否暴击  
                if (Math.random() < this.player.critical) {
                    // 玩家暴击，伤害加倍  
                    playerHarm *= 1.5;
                    // 玩家成功暴击
                    isCritical = true;
                }

                // 强制扣除玩家气血, 因为boss攻击必中
                this.player.health -= monsterHarm;

                // 如果boss没有闪避，扣除boss气血
                if (isPlayerHit) this.boss.health -= playerHarm;

                this.player.health = Math.max(0, this.player.health);
                this.boss.health = Math.max(0, this.boss.health);

                if (this.guashaRounds > 1) {
                    // 扣除回合数
                    this.guashaRounds--;
                    // boss气血小于等于0
                    if (this.boss.health <= 0) {
                        const equipItem = boss.boss_Equip(this.$maxLv);
                        this.isequipment = true;
                        this.equipmentInfo = equipItem;
                        this.texts = [...this.texts, `你击败${this.boss.name}后，获得了<span class="el-tag el-tag--${equipItem.quality}">${this.$levels[equipItem.quality]}${equipItem.name}(${this.$genre[equipItem.type]})</span>`];
                        // 如果装备背包当前容量大于等于背包总容量
                        if (this.player.inventory.length >= this.player.backpackCapacity) {
                            this.texts = [...this.texts, `当前装备背包容量已满, 该装备自动丢弃, 转生可增加背包容量`];
                        } else {
                            // 玩家获得道具
                            this.player.inventory.push(equipItem);
                        }
                        // 增加根骨丹
                        this.player.rootBone += 1;
                        // 获得根骨丹通知
                        this.texts = [...this.texts, '你获得了1颗根骨丹'];
                        // 增加鸿蒙石
                        this.player.currency += this.currency;
                        // 获得鸿蒙石通知
                        this.texts = [...this.texts, `你获得了${this.currency}块鸿蒙石`];
                        // 修改按钮状态
                        this.isEnd = true;
                        // 修改boss状态
                        this.boss.time = Math.floor(Date.now() / 1000);
                        this.boss.health = 0;
                        this.boss.conquer = true;
                        this.stopFightBoss();
                        this.$store.commit('setBoss', this.boss);
                    } else if (this.player.health <= 0) {
                        this.isEnd = true;
                        // 恢复boss血量
                        this.boss.health = this.boss.maxhealth;
                        this.texts = [...this.texts, '你因为太弱被击败了。'];
                        this.texts = [...this.texts, `${this.boss.text}`];
                        this.stopFightBoss();
                        this.guashaRounds = 50;
                    } else {
                        this.texts = [...this.texts, isPlayerHit ? `你攻击了${this.boss.name}，${isCritical ? '触发暴击' : ''}造成了${playerHarm}点伤害，剩余${this.boss.health}气血。` : `你攻击了${this.boss.name}，对方闪避了你的攻击，你未造成伤害，剩余${this.boss.health}气血。 `];
                        this.texts = [...this.texts, `${this.boss.name}攻击了你，${isMCritical ? '触发暴击' : ''}造成了${monsterHarm}点伤害`];
                    }
                } else {
                    // 恢复默认回合数
                    this.guashaRounds = 50;
                    this.stopFightBoss();
                    // 恢复boss血量
                    this.boss.health = this.boss.maxhealth;
                    this.texts = [...this.texts, `回合结束, 你未战胜${this.boss.name}你输了。`];
                    this.texts = [...this.texts, `${this.boss.text}`];
                }
                // 更新玩家存档
                this.$store.commit('setPlayer', this.player);
            },
            openEquipmentInfo (item) {
                if (!this.isequipment) return;
                this.$confirm('', item.name, {
                    center: true,
                    message: `<div class="monsterinfo">
                        <div class="monsterinfo-box">
                            <p>类型: ${this.$genre[item.type] ?? '未知'}</p>
                            <p>境界: ${this.$levelNames[item.level]}</p>
                            <p>品质: ${this.$levels[item.quality] ?? '未知'}</p>
                            <p>气血: ${this.$formatNumberToChineseUnit(item.health)}</p>
                            <p>攻击: ${this.$formatNumberToChineseUnit(item.attack)}</p>
                            <p>防御: ${this.$formatNumberToChineseUnit(item.defense)}</p>
                            <p>闪避率: ${(item.dodge * 100).toFixed(2) ?? 0}%</p>
                            <p>暴击率: ${(item.critical * 100).toFixed(2) ?? 0}%</p>
                        </div>
                    </div>`,
                    showClose: false,
                    closeOnClickModal: false,
                    closeOnPressEscape: false,
                    dangerouslyUseHTMLString: true
                }).then(() => {
                    this.$router.push('/');
                }).catch(() => {
                    this.$router.push('/');
                });
            },
            // 世界BOSS
            assaultBoss () {
                // boss生成的时间  
                const time = this.getMinuteDifference(this.boss.time);
                // boss难度根据玩家最高等级 + 转生次数  
                const bossLv = this.$maxLv * this.player.reincarnation + this.$maxLv;
                // 检查boss的血量和时间  
                if (this.boss.health > 0) {
                    // 如果boss还有血量，允许玩家挑战  
                    if (time >= 5) {
                        // boss没有血量但时间大于等于5分钟，重新生成boss  
                        this.boss = boss.drawPrize(bossLv);
                        // 存档boss信息  
                        this.$store.commit('setBoss', this.boss);
                    }
                    // 如果boss没有血量  
                } else {
                    if (time >= 5 || this.boss.time == 0) {
                        // boss没有血量但时间大于等于5分钟，重新生成boss  
                        this.boss = boss.drawPrize(bossLv);
                        // 存档boss信息  
                        this.$store.commit('setBoss', this.boss);
                    } else {
                        this.isEnd = true;
                        this.texts = [...this.texts, 'BOSS还未刷新，请等待5分钟后再次挑战'];
                        return;
                    }
                }
                //更新回合数
                this.guashaRounds = 50;
            },
            // 计算当前时间和指定时间相差多少分钟
            getMinuteDifference (specifiedTimestamp) {
                // 获取当前时间戳（秒数）
                const currentTimestamp = Math.floor(Date.now() / 1000);
                specifiedTimestamp = specifiedTimestamp == 0 ? currentTimestamp : specifiedTimestamp;
                // 计算时间差（分钟数）
                const timeDifferenceInSeconds = Math.abs(currentTimestamp - specifiedTimestamp);
                const timeDifferenceInMinutes = Math.floor(timeDifferenceInSeconds / 60);
                return timeDifferenceInMinutes;
            }
        }
    }
</script>

<style scoped>
    .boss-box .desc {
        margin: 10px 0;
    }
</style>