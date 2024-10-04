<template>
    <div class="games">
        <el-tabs v-model="tabs">
            <el-tab-pane v-for="(item, index) in gameList" :label="item.label" :name="item.name">
                <component :is="item.component" @game-result="processGameResult" />
            </el-tab-pane>
        </el-tabs>
        <div class="stats">
            <div class="attribute-box">
                <el-row>
                    <el-col :span="12" class="attribute-col" v-for="(item, index) in attributeList" :key="index">
                        <div class="el-statistic">
                            <div class="el-statistic__head">{{ item.name }}</div>
                            <div class="el-statistic__content">
                                <span class="el-statistic__number">{{ $formatNumberToChineseUnit(item.value) }}{{ item.unit }}</span>
                            </div>
                        </div>
                    </el-col>
                </el-row>
            </div>
            <el-button class="attribute-label" @click="$router.push('/home')">返回家中</el-button>
        </div>
    </div>
</template>

<script>
    import tag from '@/components/tag.vue';
    import Toe from './toe.vue';
    import CheckIn from './checkin.vue';
    import DiceGame from './Dicegame.vue';
    import SecretRealm from './SecretRealm.vue';
    import FortuneTelling from './fortunetelling.vue';
    import RockPaperScissors from './rock.vue';

    export default {
        components: {
            tag,
            Toe,
            CheckIn,
            DiceGame,
            SecretRealm,
            FortuneTelling,
            RockPaperScissors,
        },
        data () {
            return {
                tabs: 'checkin',
                player: {},
                selectedGame: null,
                gameList: [
                    { name: 'checkin', label: '签到', component: 'CheckIn' },
                    { name: 'dice', label: '骰子', component: 'DiceGame' },
                    { name: 'rps', label: '猜拳', component: 'RockPaperScissors' },
                    { name: 'fortune', label: '算卦', component: 'FortuneTelling' },
                    { name: 'toe', label: '井棋', component: 'Toe' },
                    { name: 'secret-realm', label: '秘境', component: 'SecretRealm' }
                ]
            }
        },
        watch: {
            tabs (type) {
                this.selectedGame = type;
            }
        },
        created () {
            this.player = this.$store.player;
        },
        mounted () {
            this.checkDailyReset();
        },
        computed: {
            attributeList () {
                return [
                    { name: '签到天数', unit: '天', value: this.player.checkinDays },
                    { name: '拥有灵石', unit: '', value: this.player.props.money },
                    { name: '胜利次数', unit: '次', value: this.player.gameWins },
                    { name: '失败次数', unit: '次', value: this.player.gameLosses }
                ];
            }
        },
        methods: {
            processGameResult (result) {
                if (result.success) this.updatePlayerWins(result);
                else this.updatePlayerLosses(result);
            },
            updatePlayerWins (result) {
                this.player.gameWins++;
                const reward = result.reward;
                if (reward) {
                    if (typeof reward === 'object') Object.entries(reward).forEach(([key, value]) => { this.player.props[key] += value; });
                    else this.player.props.money += reward;
                }
            },
            updatePlayerLosses (result) {
                this.player.props.money -= result.reward;
                this.player.gameLosses++;
            },
            checkDailyReset () {
                const now = new Date();
                const lastCheckinDate = new Date(this.player.lastCheckinDate);
                if (now.toDateString() !== lastCheckinDate.toDateString()) this.player.checkedInToday = false;
            }
        }
    }
</script>

<style scoped>
    .game-container {
        border-radius: 12px;
        margin-bottom: 20px;
    }

    .attribute-box {
        margin-bottom: 10px;
    }

    .attribute-col {
        margin-top: 10px;
    }

    .attribute-label {
        margin: 15px 0;
        width: 40%;
    }
</style>