<template>
    <div class="cultivate">
        <div class="cultivation-info">
            <div class="realm-display">
                当前境界：<span class="realm-text" v-text="`${$levelNames(player.level)}(${player.reincarnation || 0}转)`" />
            </div>
            <el-progress :percentage="cultivationPercentage" text-inside :stroke-width="20" status="success" class="custom-progress" />
        </div>
        <div class="storyText">
            <div class="storyText-box">
                <el-scrollbar ref="scrollbar" always>
                    <p v-for="(item, index) in texts" :key="index" v-html="item" />
                </el-scrollbar>
            </div>
        </div>
        <div class="actions">
            <div class="action" v-for="(item, index) in buttonsFor" :key="index">
                <el-button class="item" @click="item.click" :disabled="item.disabled" v-text="item.text" />
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
                observer: null
            };
        },
        beforeUnmount () {
            this.stopCultivate();
            this.stopObserving();
        },
        computed: {
            buttonsFor () {
                return [
                    { text: '开始修炼', click: () => this.startCultivate(), disabled: !this.isStart },
                    { text: '停止修炼', click: () => this.stopCultivate(), disabled: !this.isStop },
                    { text: '转生突破', click: () => this.reincarnationBreakthrough() },
                    { text: '返回家里', click: () => this.$router.push('/home') }
                ];
            },
            cultivationPercentage () {
                const { cultivation, maxCultivation } = this.$store.player;
                return Math.min(100, (cultivation / maxCultivation) * 100).toFixed(2);
            }
        },
        mounted () {
            this.player = this.$store.player;
            this.startCultivate();
            this.setupObserver();
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
                        this.texts.push(this.player.level < this.$maxLv ? '你开始冥想，吸收周围的灵气。修为提升了！' : '你当前的境界已修炼圆满, 需要转生后才能继续修炼');
                        this.breakThrough(exp);
                        // 10%的概率触发随机事件
                        if (Math.random() < 0.1) this.triggerRandomEvent();
                    } else {
                        this.breakThrough(100);
                    }
                }, time);
                this.timerIds.push(timerId);
            },
            triggerRandomEvent () {
                const randomEvents = [
                    { type: 'resource', name: '灵石', amount: 100, description: '你发现了一堆灵石！' },
                    { type: 'cultivation', name: '顿悟', amount: 500, description: '你突然顿悟，修为大涨！' },
                    { type: 'item', name: '丹药', effect: '增加100点修为', description: '你获得了一颗珍贵的丹药！' },
                    { type: 'skill', name: '剑法', effect: '增加10%攻击力', description: '你领悟了一门高深剑法！' },
                    { type: 'lucky', name: '雷劫', effect: '修为降低10%', description: '你遭遇了雷劫！' },
                ];
                const event = randomEvents[Math.floor(Math.random() * randomEvents.length)];
                this.texts.push(`<span style="color: #E6A23C;">${event.description}</span>`);
                switch (event.type) {
                    case 'resource':
                        this.player.props.money += event.amount;
                        break;
                    case 'cultivation':
                        this.player.cultivation += event.amount;
                        break;
                    // 增加修为
                    case 'item':
                        this.player.cultivation += this.player.cultivation * 0.05;
                        break;
                    // 减少修为
                    case 'lucky':
                        this.player.cultivation -= this.player.cultivation * 0.1;
                        break;
                    // 增加攻击力
                    case 'skill':
                        this.player.attack *= 1.1;
                        break;
                }
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
                            this.texts.push(`当前境界修为已满, 你需要通过击败<span class="textColor">(${this.player.taskNum} / ${this.player.level})</span>个敌人证道突破`);
                            return;
                        }
                        this.player.taskNum = 0;
                        this.player.level++;
                        this.player.points += 3;
                        this.player.health = this.player.maxHealth;
                        this.player.maxCultivation = Math.floor(100 * Math.pow(2, this.player.level * reincarnation));
                        this.texts.push(`恭喜你突破了！当前境界：${this.$levelNames(this.player.level)}`);
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
                            this.player.taskNum = 0;
                            this.player.cultivation = 0;
                            this.player.maxCultivation = 100;
                            this.player.reincarnation++;
                            this.player.backpackCapacity += 50;
                            this.$notifys({
                                title: '转生提示',
                                message: `转生成功, 当前为${this.player.reincarnation}转, 背包总容量增加50`,
                                dangerouslyUseHTMLString: true
                            });
                        }).catch(() => { });
                    } else {
                        this.$notifys({
                            title: '未满足转生条件',
                            message: `需要通过击败<span class="textColor">(${this.player.taskNum} / ${reincarnation})</span>个敌人证道转生`,
                            dangerouslyUseHTMLString: true
                        });
                    }
                } else {
                    this.$notifys({
                        title: '未满足转生条件',
                        message: `境界需要达到<span class="textColor">${this.$levelNames(this.$maxLv)}</span>才能满足转生条件`,
                        dangerouslyUseHTMLString: true
                    });
                }
            },
            setupObserver () {
                const element = this.$refs.scrollbar.wrapRef;
                if (element) {
                    this.observer = new MutationObserver(() => this.$smoothScrollToBottom(element));
                    this.observer.observe(element, { subtree: true, childList: true });
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
    .cultivate {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        max-width: 600px;
        margin: 0 auto;
    }

    .cultivation-info {
        width: 100%;
        margin-bottom: 20px;
    }

    .custom-progress {
        width: 100%;
    }

    .realm-display {
        margin-bottom: 10px;
        font-size: 16px;
        text-align: center;
    }

    .realm-text {
        color: var(--el-color-primary);
        font-weight: bold;
    }

    .storyText {
        width: 100%;
    }

    .storyText-box {
        max-height: 300px;
        overflow-y: auto;
        padding: 10px;
        border: 1px solid #dcdfe6;
        border-radius: 4px;
        margin-bottom: 20px;
        width: 100%;
        box-sizing: border-box;
    }

    .actions {
        display: flex;
        justify-content: space-between;
        width: 100%;
    }

    .action {
        flex: 1;
        margin: 0 5px;
    }

    .item {
        width: 100%;
    }

    .event-text {
        color: #E6A23C;
        font-weight: bold;
    }

    @media (max-width: 768px) {
        .actions {
            flex-direction: column;
        }

        .action {
            margin: 5px 0;
        }
    }
</style>
