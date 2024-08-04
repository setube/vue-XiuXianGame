<template>
  <div class="cultivate">
    <div class="storyText">
      <div
        class="storyText-box"
        ref="storyText"
      >
        <p
          v-for="(item, index) in texts"
          :key="index"
          v-html="item"
        />
      </div>
    </div>
    <div class="actions">
      <el-button @click="$router.push('/')">
        返回家里
      </el-button>
      <el-button
        type="success"
        @click="startCultivate"
        :disabled="!isStart"
      >
        开始修炼
      </el-button>
      <el-button
        type="primary"
        @click="stopCultivate"
        :disabled="!isStop"
      >
        停止修炼
      </el-button>
      <el-button
        type="danger"
        @click="reincarnationBreakthrough"
      >
        转生突破
      </el-button>
    </div>
  </div>
</template>

<script>
    // 装备
    import equip from '@/plugins/equip';
    export default {
        data () {
            return {
                // 日志
                texts: [],
                player: {},
                // 停止修炼
                isStop: false,
                // 开始修炼
                isStart: false,
                timerId: null
            }
        },
        beforeDestroy () {
            this.stopCultivate();
        },
        mounted () {
            this.player = this.$store.state.player;
            // 自动开始修炼
            this.startCultivate();
        },
        methods: {
            // 开始修炼
            startCultivate () {
                this.timerId = setInterval(() => {
                    // 如果当前修为小于总修为
                    if (this.player.cultivation <= this.player.maxCultivation) {
                        this.isStop = true;
                        this.isStart = false;
                        // 增加当前修为
                        const exp = this.player.level <= 10 ? Math.floor(this.player.maxCultivation / equip.getRandomInt(10, 30)) : Math.floor(this.player.maxCultivation / 100);
                        this.breakThrough(exp);
                        this.texts = [...this.texts, '你开始冥想，吸收周围的灵气。修为提升了！'];
                    } else {
                        this.breakThrough(100);
                    }
                    const element = this.$refs.storyText;
                    element.scrollTo(0, element.scrollHeight);
                }, 300)
            },
            // 停止修炼
            stopCultivate () {
                clearInterval(this.timerId);
                this.timerId = null;
                this.isStart = true;
                this.isStop = false;
            },
            // 修为突破
            breakThrough (exp) {
                // 如果当前境界小于最高境界当前修为大于等于总修为
                if (this.player.level < this.$maxLv) {
                    if (this.player.cultivation >= this.player.maxCultivation) {
                        // 如果玩家等级大于10并且击杀数低于当前等级
                        if (this.player.level > 10 && this.player.level > this.player.taskNum) {
                            this.isStop = false;
                            this.isStart = false;
                            this.texts = [...this.texts, `当前境界修为已满, 你需要通过击败<span style="color: #f56c6c;">(${this.player.taskNum} / ${this.player.level})</span>个敌人证道突破`];
                            this.stopCultivate();
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
                        this.texts = [...this.texts, `恭喜你突破了！当前境界：${this.$levelNames[this.player.level]}`];
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
                    this.stopCultivate();
                }
                this.$store.commit('setPlayer', this.player);
            },
            // 转生突破
            reincarnationBreakthrough () {
                // 转生次数
                let reincarnation = this.player.reincarnation;
                // 转生任务所需击杀怪物数量
                reincarnation = reincarnation == 0 ? 1 * 100 : reincarnation * 100;
                // 如果击杀数大于等于转生次数 * 100
                if (this.player.level == this.$maxLv) {
                    if (this.player.points) {
                        this.$notify({ title: '未满足转生条件', message: `当前还有${this.player.points}境界点未使用, 无法转生` });
                        return;
                    }
                    if (this.player.taskNum >= reincarnation) {
                        this.$confirm('转生之后的敌人属性是转生前的百倍<br>转生前请务必确认自己的实力是否足够战胜转生后的对手, 避免导致卡档', '转生提醒', {
                            center: true,
                            cancelButtonText: '再发育发育',
                            confirmButtonText: '知道了, 我会对我的操作负责',
                            dangerouslyUseHTMLString: true
                        }).then(() => {
                            // 境界重置
                            this.player.level = 0;
                            // 修为重置
                            this.player.cultivation = 0;
                            // 总修为重置
                            this.player.maxCultivation = 100;
                            // 重置击杀次数
                            this.player.taskNum = 0;
                            // 增加转生次数
                            this.player.reincarnation++;
                            this.$notify({
                                title: '转生提示',
                                message: `转生成功, 当前为${this.player.reincarnation}转`,
                                dangerouslyUseHTMLString: true
                            });
                            // 更新玩家存档
                            this.$store.commit('setPlayer', this.player);
                        }).catch(() => { });
                    } else {
                        this.$notify({
                            title: '未满足转生条件',
                            message: `需要通过击败<span style="color: #f56c6c;">(${this.player.taskNum} / ${reincarnation})</span>个敌人证道转生`,
                            dangerouslyUseHTMLString: true
                        });
                    }
                } else {
                    this.$notify({
                        title: '未满足转生条件',
                        message: `境界需要达到<span style="color: #f56c6c;">${this.$levelNames[this.$maxLv]}</span>才能满足转生条件`,
                        dangerouslyUseHTMLString: true
                    });
                }
            }
        }
    }
</script>

<style scoped></style>