<template>
    <div class="rps-game">
        <div class="bet-amount">
            <el-input-number v-model="betAmount" :min="100" :step="100" :max="100000" :disabled="!canPlay" />
        </div>
        <div class="options">
            <el-button v-for="option in options" :key="option" @click="play(option)" :disabled="!canPlay" v-text="option" />
        </div>
        <div class="game-result" v-if="result">
            <div class="player-choice">
                <div :class="['choice-image', type[result.playerChoice]]" />
                <p>你的选择</p>
            </div>
            <div class="vs">VS</div>
            <div class="computer-choice">
                <div :class="['choice-image', type[result.computerChoice]]" />
                <p>天道的选择</p>
            </div>
        </div>
        <div v-if="result" class="result">
            <p>{{ result.message }}</p>
        </div>
        <div class="message">
            <p v-if="canPlay">请选择</p>
            <p v-else-if="!hasEnoughMoney">灵石不足</p>
            <el-countdown v-else title="冷却中" :value="nextGameTime" @finish="updateCanPlay" />
        </div>
    </div>
</template>

<script>
    export default {
        name: 'RockPaperScissors',
        data () {
            return {
                type: {
                    '布': 'cloth',
                    '剪刀': 'scissors',
                    '石头': 'fist'
                },
                result: null,
                options: ['石头', '剪刀', '布'],
                betAmount: 100,
                canPlay: false
            }
        },
        computed: {
            player () {
                return this.$store.player;
            },
            nextGameTime () {
                return this.player.nextGameTimes?.rps || 0;
            },
            hasEnoughMoney () {
                return this.player.props.money >= this.betAmount;
            },
        },
        created() {
            this.updateCanPlay();
        },
        methods: {
            updateCanPlay() {
                this.canPlay = Date.now() >= this.nextGameTime && this.hasEnoughMoney;
            },
            play (playerChoice) {
                if (!this.canPlay) return;
                const computerChoice = this.options[Math.floor(Math.random() * 3)];
                const won = (playerChoice === '石头' && computerChoice === '剪刀') || (playerChoice === '剪刀' && computerChoice === '布') || (playerChoice === '布' && computerChoice === '石头');
                const draw = (playerChoice === computerChoice); 

                const reward = won ? this.betAmount * 2 :(draw?this.betAmount :0);
                this.result = {
                    message: won ? `恭喜您赢得了${reward}灵石！` : (draw?'很遗憾，五五开!':'很遗憾，您输了。'),
                    playerChoice,
                    computerChoice
                };
                if (won) {
                    this.player.props.money += reward - this.betAmount;
                } else {
                    this.player.props.money -= this.betAmount;
                }
                this.$emit('game-result', { success: won, reward });
                const newNextGameTime = Date.now() + 10 * 60 * 1000;
                this.player.nextGameTimes.rps = newNextGameTime;
                this.$emit('update-next-game-time', { game: 'rps', time: newNextGameTime });
                this.canPlay = false;
            }
        },
        watch: {
            betAmount() {
                this.updateCanPlay();
            }
        }
    }
</script>


<style scoped>
    .rps-game {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
    }

    .bet-amount {
        margin-top: 10px;
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .options {
        display: flex;
        gap: 10px;
    }

    .game-result {
        display: flex;
        justify-content: space-around;
        align-items: center;
        width: 100%;
    }

    .player-choice,
    .computer-choice {
        text-align: center;
    }

    .vs {
        font-size: 24px;
        font-weight: bold;
    }

    .choice-image {
        width: 100px;
        height: 100px;
        background-size: 100% 100%;
        background-repeat: no-repeat;
    }

    .result {
        text-align: center;
    }

    .fist {
        background-image: url(@/assets/fist.svg);
    }

    .cloth {
        background-image: url(@/assets/cloth.svg);
    }

    .scissors {
        background-image: url(@/assets/scissors.svg);
    }

    .message {
        margin-bottom: 20px;
    }
</style>