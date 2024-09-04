<template>
    <div class="cultivate">
        <div class="storyText">
            <div class="storyText-box">
                <el-scrollbar ref="scrollbar" always>
                    <p v-for="(item, index) in texts" :key="index" v-html="item" />
                </el-scrollbar>
            </div>
        </div>
        <div class="actions">
            <div class="action">
                <el-button class="item" @click="startCultivate" :disabled="!isStart">
                    开始修炼
                </el-button>
            </div>
            <div class="action">
                <el-button class="item" @click="stopCultivate" :disabled="!isStop">
                    停止修炼
                </el-button>
            </div>
            <div class="action">
                <el-button class="item" @click="reincarnationBreakthrough">
                    转生突破
                </el-button>
            </div>
            <div class="action">
                <el-button class="item" @click="$router.push('/home')">
                    返回家里
                </el-button>
            </div>
        </div>
    </div>
</template>

<script>
    import equip from '@/plugins/equip';
    export default {
        data () {
            return {
                texts: [],
                player: {},
                isStop: false,
                isStart: false,
                timerIds: [],
                observer: null // 用于保存 MutationObserver 实例
            };
        },
        beforeDestroy () {
            this.stopCultivate();
            this.stopObserving(); // 停止观察
        },
        mounted () {
            this.player = this.$store.state.player;
            this.startCultivate();
            this.setupObserver(); // 设置 MutationObserver
        },
        methods: {
            startCultivate () {
                this.isStart = false;
                const zs = this.player.reincarnation * 10;
                const time = zs >= 200 ? 100 : 300 - zs;
                const timerId = setInterval(() => {
                    if (this.player.cultivation <= this.player.maxCultivation) {
                        this.isStop = true;
                        this.isStart = false;
                        const exp = this.player.level <= 10 ? Math.floor(this.player.maxCultivation / equip.getRandomInt(10, 30)) : Math.floor(this.player.maxCultivation / 100);
                        this.texts = [...this.texts, this.player.level < this.$maxLv ? '你开始冥想，吸收周围的灵气。修为提升了！' : '你当前的境界已修炼圆满, 需要转生后才能继续修炼'];
                        this.breakThrough(exp);
                    } else {
                        this.breakThrough(100);
                    }
                }, time);
                this.timerIds.push(timerId);
            },
            stopCultivate () {
                this.timerIds.forEach(id => {
                    clearInterval(id);
                });
                this.timerIds = [];
                this.isStart = true;
                this.isStop = false;
            },
            breakThrough (exp) {
                const reincarnation = this.player.reincarnation ? this.player.reincarnation + 1 : 1;
                if (this.player.level < this.$maxLv) {
                    if (this.player.cultivation >= this.player.maxCultivation) {
                        if (this.player.level > 10 && this.player.level > this.player.taskNum) {
                            this.stopCultivate();
                            this.isStop = false;
                            this.isStart = false;
                            this.texts = [...this.texts, `当前境界修为已满, 你需要通过击败<span style="color: #f56c6c;">(${this.player.taskNum} / ${this.player.level})</span>个敌人证道突破`];
                            return;
                        }
                        this.player.taskNum = 0;
                        this.player.level++;
                        this.player.points += 3;
                        this.player.health = this.player.maxHealth;
                        this.player.maxCultivation = Math.floor(100 * Math.pow(2, this.player.level * reincarnation));
                        this.texts = [...this.texts, `恭喜你突破了！当前境界：${this.$levelNames(this.player.level)}`];
                    } else {
                        this.player.cultivation += exp;
                    }
                } else {
                    this.isStop = false;
                    this.isStart = false;
                    this.player.level = this.$maxLv;
                    this.player.maxCultivation = Math.floor(100 * Math.pow(2, this.$maxLv * reincarnation));
                    this.stopCultivate();
                }
                this.$store.commit('setPlayer', this.player);
            },
            reincarnationBreakthrough () {
                let reincarnation = this.player.reincarnation;
                reincarnation = reincarnation == 0 ? 1 * 100 : reincarnation * 100;
                if (this.player.level == this.$maxLv) {
                    if (this.player.points) {
                        this.$notifys({ title: '未满足转生条件', message: `当前还有${this.player.points}境界点未使用, 无法转生` });
                        return;
                    }
                    if (this.player.taskNum >= reincarnation) {
                        const txt = this.player.reincarnation == 0 ? '转生之后的敌人属性是转生前的百倍<br>转生前请务必确认自己的实力是否足够战胜转生后的对手, 避免卡档后删档重练' : '转生操作不可逆, 是否确定要转生?';
                        this.$confirm(txt, '转生提醒', {
                            center: true,
                            cancelButtonText: '取消转生',
                            confirmButtonText: '立即转生',
                            dangerouslyUseHTMLString: true
                        }).then(() => {
                            this.player.level = 0;
                            this.player.cultivation = 0;
                            this.player.maxCultivation = 100;
                            this.player.taskNum = 0;
                            this.player.reincarnation++;
                            this.player.backpackCapacity += 50;
                            this.$notifys({
                                title: '转生提示',
                                message: `转生成功, 当前为${this.player.reincarnation}转, 背包总容量增加50`,
                                dangerouslyUseHTMLString: true
                            });
                            this.$store.commit('setPlayer', this.player);
                        }).catch(() => {
                        });
                    } else {
                        this.$notifys({
                            title: '未满足转生条件',
                            message: `需要通过击败<span style="color: #f56c6c;">(${this.player.taskNum} / ${reincarnation})</span>个敌人证道转生`,
                            dangerouslyUseHTMLString: true
                        });
                    }
                } else {
                    this.$notifys({
                        title: '未满足转生条件',
                        message: `境界需要达到<span style="color: #f56c6c;">${this.$levelNames(this.$maxLv)}</span>才能满足转生条件`,
                        dangerouslyUseHTMLString: true
                    });
                }
            },
            setupObserver () {
                const element = this.$refs.scrollbar.wrapRef;
                if (element) {
                    this.observer = new MutationObserver(() => {
                        this.$smoothScrollToBottom(element);
                    });
                    this.observer.observe(element, {
                        childList: true,
                        subtree: true
                    });
                }
            },
            stopObserving () {
                if (this.observer) {
                    this.observer.disconnect();
                    this.observer = null;
                }
            }
        }
    }
</script>

<style scoped>
    .actions .action {
        width: calc(50% - 10px);
        margin: 5px;
    }
</style>