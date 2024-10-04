<template>
    <div class="dice-game">
        <div class="options">
            <el-radio-group v-model="betType">
                <el-radio value="big" :disabled="!canBet" label="大" />
                <el-radio value="small" :disabled="!canBet" label="小" />
                <el-radio value="odd" :disabled="!canBet" label="单" />
                <el-radio value="even" :disabled="!canBet" label="双" />
            </el-radio-group>
        </div>
        <el-input-number class="bet-amount" v-model="betAmount" :min="100" :step="100" :max="1000000" :disabled="!canBet" />
        <el-button @click="placeBet" :disabled="!canBet" v-text="'下注灵石'" v-if="canBet" />
        <el-countdown :title="hasEnoughMoney ? '冷却中' : '灵石不足'" :value="nextGameTime" @finish="canBet = true" v-else />
        <div :class="['dice', 'dice-' + diceNumber, { 'rolling': isRolling }]" />
    </div>
</template>

<script>
    export default {
        name: 'DiceGame',
        data () {
            return {
                canBet: false,
                betType: 'big',
                betAmount: 100,
                isRolling: false,
                diceNumber: 1
            }
        },
        computed: {
            player () {
                return this.$store.player;
            },
            hasEnoughMoney () {
                return this.player.props.money >= this.betAmount;
            },
            nextGameTime () {
                return this.player.nextGameTimes?.dice || 0;
            }
        },
        created () {
            this.canBet = Date.now() >= this.nextGameTime && this.hasEnoughMoney;
        },
        methods: {
            placeBet () {
                if (!this.canBet) return;
                this.isRolling = true;
                let rollCount = 0;
                const rollInterval = setInterval(() => {
                    this.diceNumber = Math.floor(Math.random() * 6) + 1;
                    rollCount++;
                    if (rollCount >= 20) {
                        clearInterval(rollInterval);
                        this.finishRoll();
                    }
                }, 100);
            },
            finishRoll () {
                const dice = this.diceNumber;
                let won = false;
                switch (this.betType) {
                    case 'big':
                        won = dice > 3;
                        break;
                    case 'small':
                        won = dice <= 3;
                        break;
                    case 'odd':
                        won = dice % 2 !== 0;
                        break;
                    case 'even':
                        won = dice % 2 === 0;
                        break;
                }
                const reward = won ? this.betAmount * 2 : this.betAmount;
                this.canBet = won;
                this.$notifys({ title: `骰子点数: ${dice}`, message: won ? `恭喜您赢得了${reward}灵石！` : '很遗憾，您输了。' });
                this.$emit('game-result', { success: won, reward });
                const newNextGameTime = Date.now() + 10 * 60 * 1000;
                this.player.nextGameTimes.dice = newNextGameTime
                this.$emit('update-next-game-time', { game: 'dice', time: newNextGameTime });
                this.isRolling = false;
            }
        }
    }
</script>

<style scoped>
    .dice-game {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
    }

    .options {
        margin-top: 10px;
    }

    .bet-amount {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .dice {
        width: 100px;
        height: 100px;
        background-size: 100% 100%;
        background-repeat: no-repeat;
    }

    .dice-1 {
        background-image: url(@/assets/dice1.svg);
    }

    .dice-2 {
        background-image: url(@/assets/dice2.svg);
    }

    .dice-3 {
        background-image: url(@/assets/dice3.svg);
    }


    .dice-4 {
        background-image: url(@/assets/dice4.svg);
    }


    .dice-5 {
        background-image: url(@/assets/dice5.svg);
    }


    .dice-6 {
        background-image: url(@/assets/dice6.svg);
    }


    .rolling {
        animation: roll 0.1s linear infinite;
    }

    @keyframes roll {
        0% {
            transform: rotate(0deg);
        }

        100% {
            transform: rotate(360deg);
        }
    }
</style>