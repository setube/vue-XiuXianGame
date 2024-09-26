<template>
    <div class="cultivate">
        <div class="cultivation-info">
            <div class="realm-display">
                当前境界：<span class="realm-text">{{ $levelNames(player.level) }} ({{ player.reincarnation || 0 }}转)</span>
            </div>
            <el-progress :percentage="cultivationPercentage" :format="formatProgress" :stroke-width="20"
                status="success" class="custom-progress"></el-progress>

        </div>
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
    data() {
        return {
            texts: [],
            player: {},
            isStop: false,
            isStart: false,
            timerIds: [],
            observer: null,
            randomEvents: [
                { type: 'resource', name: '灵石', amount: 100, description: '你发现了一堆灵石！' },
                { type: 'cultivation', name: '顿悟', amount: 500, description: '你突然顿悟，修为大涨！' },
                { type: 'item', name: '丹药', effect: '增加100点修为', description: '你获得了一颗珍贵的丹药！' },
                { type: 'skill', name: '剑法', effect: '增加10%攻击力', description: '你领悟了一门高深剑法！' },
                { type: 'lucky', name: '雷劫', effect: '修为降低10%', description: '你遭遇了雷劫！' },
            ]
        };
    },
    beforeUnmount() {
        this.stopCultivate();
        this.stopObserving(); // 停止观察
    },
    computed: {
        cultivationPercentage() {
            return Math.min(100, (this.player.cultivation / this.player.maxCultivation) * 100);
        }
    },
    mounted() {
        this.player = this.$store.player;
        this.startCultivate();
        this.setupObserver(); // 设置 MutationObserver

    },
    methods: {
        startCultivate() {
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
                    // 添加随机事件逻辑
                    if (Math.random() < 0.1) {  // 10%的概率触发随机事件
                        this.triggerRandomEvent();
                    }
                } else {
                    this.breakThrough(100);
                }
            }, time);
            this.timerIds.push(timerId);
        },

        triggerRandomEvent() {
            const event = this.randomEvents[Math.floor(Math.random() * this.randomEvents.length)];
            this.texts.push(`<span style="color: #E6A23C;">${event.description}</span>`);

            switch (event.type) {
                case 'resource':
                    this.player.props.money += event.amount;
                    break;
                case 'cultivation':
                    this.player.cultivation += event.amount;
                    break;
                case 'item':
                    this.player.cultivation += this.player.cultivation * 0.05;  // 简化处理，直接增加修为
                    break;
                case 'lucky':
                    this.player.cultivation -= this.player.cultivation * 0.1;  // 简化处理，直接减少修为
                    break;
                case 'skill':
                    this.player.attack *= 1.1;  // 简化处理，直接增加攻击力
                    break;
            }

            this.$store.setPlayer(this.player);
        },
        stopCultivate() {
            this.timerIds.forEach(id => {
                clearInterval(id);
            });
            this.timerIds = [];
            this.isStart = true;
            this.isStop = false;
        },
        formatProgress(percentage) {
            return `${this.player.cultivation.toFixed(0)} / ${this.player.maxCultivation}`;
        },
        breakThrough(exp) {
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
            this.$store.setPlayer(this.player);
        },
        reincarnationBreakthrough() {
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
                        this.$store.setPlayer(this.player);
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
        setupObserver() {
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
        stopObserving() {
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
    /* 或者您想要的最大宽度 */
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
    color: #409EFF;
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

/* 响应式设计 */
@media (max-width: 768px) {
    .actions {
        flex-direction: column;
    }

    .action {
        margin: 5px 0;
    }
}
</style>