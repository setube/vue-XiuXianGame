<template>
    <div class="Illustrations">
        <el-tabs v-model="activeName" type="border-card">
            <el-tab-pane label="装备图鉴" name="illustrations">
                <div class="tag inventory-box">
                    <el-tabs v-model="illustrationsActive" :stretch="true">
                        <el-tab-pane :label="i.name" :name="i.type" v-for="(i, k) in illustrationsItems" :key="k">
                            <div class="inventory-content">
                                <template v-for="(item, index) in i.data">
                                    <div class="Illustration-item" v-if="item.type == i.type" :key="index" @click="illustrationsInfo(k, index)">
                                        <tag :type="item.quality">
                                            {{ item.name }}
                                        </tag>
                                    </div>
                                </template>
                            </div>
                        </el-tab-pane>
                    </el-tabs>
                </div>
            </el-tab-pane>
            <el-tab-pane label="我的成就" name="achievement">
                <el-tabs v-model="achievementActive" :stretch="true">
                    <el-tab-pane :label="i.name" :name="i.type" v-for="(i, k) in achievementAll" :key="k">
                        <div class="achievement-content" v-if="i.data.length > 0">
                            <div class="achievement-item" v-for="(item, index) in i.data" :key="index" @click="achievementInfo(item)">
                                <tag :type="getTagClass(i.type, item.id) ? 'success' : 'info'">
                                    {{ item.name }}
                                    ({{ getTagClass(i.type, item.id) ? '已完成' : '未完成' }})
                                </tag>
                            </div>
                        </div>
                        <div class="achievement-content" v-else>
                            此类成就暂未发布
                        </div>
                    </el-tab-pane>
                </el-tabs>
            </el-tab-pane>
        </el-tabs>
        <div class="actions">
            <el-button type="success" @click="$router.push('/home')">
                返回家中
            </el-button>
        </div>
    </div>
</template>

<script>
    import tag from '@/components/tag.vue';
    // 图鉴
    import equipAll from '@/plugins/equipAll';
    // 成就
    import achievement from '@/plugins/achievement';

    export default {
        data () {
            return {
                activeName: 'illustrations',
                achievementAll: [],
                achievementActive: 'pet',
                illustrationsItems: [],
                illustrationsActive: 'weapon',
            }
        },
        components: {
            tag
        },
        mounted () {
            this.achievementAll = achievement.all();
            this.illustrationsItems = equipAll.drawPrize(this.$maxLv);
        },
        methods: {
            getTagClass (type, index) {
                const achievements1 = this.$store.state.player.achievement[type] || [];
                return Array.isArray(achievements1) && achievements1.some(ach => ach.id === index);
            },
            // 成就详细
            achievementInfo (item) {
                this.$confirm('', `${item.name}`, {
                    center: true,
                    message: `<div class="monsterinfo">
                        <div class="monsterinfo-box">
                            <p>气血: ${item.condition.health}</p>
                            <p>攻击: ${item.condition.attack}</p>
                            <p>防御: ${item.condition.defense}</p>
                            <p>闪避率: ${(item.condition.dodge * 100).toFixed(2)}%</p>
                            <p>暴击率: ${(item.condition.critical * 100).toFixed(2)}%</p>
                            <p>完成奖励: ${item.award}培养丹</p>
                        </div>
                    </div>`,
                    confirmButtonText: '知道了',
                    dangerouslyUseHTMLString: true
                }).then(() => { }).catch(() => { });
            },
            // 图鉴装备信息
            illustrationsInfo (i, ii) {
                const info = this.illustrationsItems[i].data[ii];
                this.$confirm('', info.name, {
                    center: true,
                    message: `<div class="monsterinfo">
                        <div class="monsterinfo-box">
                            <p>类型: ${this.$genre[info.type]}</p>
                            <p>境界: ${this.$levelNames(info.level)}</p>
                            <p>品质: ${this.$levels[info.quality]}</p>
                            <p>气血: ${this.$formatNumberToChineseUnit(info.health)}</p>
                            <p>攻击: ${this.$formatNumberToChineseUnit(info.attack)}</p>
                            <p>防御: ${this.$formatNumberToChineseUnit(info.defense)}</p>
                            <p>闪避率: ${info.dodge > 0 ? (info.dodge * 100 > 100 ? 100 : (info.dodge * 100).toFixed(2)) : 0}%</p>
                            <p>暴击率: ${info.critical > 0 ? (info.critical * 100 > 100 ? 100 : (info.critical * 100).toFixed(2)) : 0}%</p>
                            <p>装备评分: ${this.$formatNumberToChineseUnit(info.score)}</p>
                            <p>获得率: ${info.prize}%</p>
                        </div>
                    </div>`,
                    dangerouslyUseHTMLString: true
                }).catch(() => { });
            },
        }
    }
</script>

<style scoped>
    .Illustrations .inventory-content {
        height: 500px;
        display: flex;
        flex-wrap: wrap;
    }

    .Illustrations .Illustration-item {
        width: 20%;
    }

    .achievement-content {
        display: flex;
        flex-wrap: wrap;
        width: 100%;
        justify-content: center;
    }

    .achievement-item {
        width: 33.33%;
        margin-top: 10px;
    }

    @media only screen and (max-width: 750px) {
        .Illustrations .inventory-content {
            overflow: auto;
        }

        .Illustrations .Illustration-item {
            width: 33%;
            margin-top: 10px;
        }

        .achievement-item {
            width: 50%;
            margin-top: 10px;
        }
    }
</style>