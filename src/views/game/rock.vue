<template>
    <div class="rps-game">
        <div class="bet-amount">
            <el-input-number v-model="betAmount" :min="100" :step="100" :max="10000000" :disabled="!canPlay" />
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
            <p v-text="canPlay ? '请选择' : '灵石不足'" :disabled="!canPlay" v-if="canPlay" />
            <el-countdown title="冷却中" :value="nextGameTime" @finish="canPlay = true" v-else />
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
                betAmount: 100
            }
        },
        computed: {
            player () {
                return this.$store.player;
            },
            canPlay () {
                return Date.now() >= this.nextGameTime && this.hasEnoughMoney;
            },
            nextGameTime () {
                return this.player.nextGameTimes?.rps || 0;
            },
            hasEnoughMoney () {
                return this.player.props.money >= this.betAmount;
            }
        },
        methods: {
            play (playerChoice) {
                if (!this.canPlay) return;
                const computerChoice = this.options[Math.floor(Math.random() * 3)];
                const won = (playerChoice === '石头' && computerChoice === '剪刀') || (playerChoice === '剪刀' && computerChoice === '布') || (playerChoice === '布' && computerChoice === '石头');
                const reward = won ? this.betAmount * 2 : this.betAmount;
                this.result = {
                    message: won ? `恭喜您赢得了${reward}灵石！` : '很遗憾，您输了。',
                    playerChoice,
                    computerChoice
                };
                this.$emit('game-result', { success: won, reward });
                const newNextGameTime = Date.now() + 10 * 60 * 1000;
                this.player.nextGameTimes.rps = newNextGameTime
                this.$emit('update-next-game-time', { game: 'rps', time: newNextGameTime });
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