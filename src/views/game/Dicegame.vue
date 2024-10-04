<template>
    <div class="dice-game">
      <div class="options">
        <el-radio-group v-model="betType">
          <el-radio-button value="big">大</el-radio-button>
          <el-radio-button value="small">小</el-radio-button>
          <el-radio-button value="odd">单</el-radio-button>
          <el-radio-button value="even">双</el-radio-button>
        </el-radio-group>
      </div>
      <div class="bet-amount">
        <el-input-number v-model="betAmount" :min="100" :step="100" :max="1000000" placeholder="下注金额"></el-input-number>
      </div>
      <el-button @click="placeBet" :disabled="!canBet">
        {{ canBet ? '下注' : (hasEnoughMoney ? '冷却中' : '灵石不足') }}
      </el-button>
      
      <div   class="dice-container" >
        <img :src="diceImage" :class="{ 'rolling': isRolling }" alt="骰子" class="dice-image"  >
      </div>
  
      <div v-if="result" class="result">
        <p>骰子点数: {{ result.dice }}</p>
        <p>{{ result.message }}</p>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'DiceGame',
    data() {
      return {
        betType: 'big',
        betAmount: 100,
        result: null,
        isRolling: false,
        diceNumber: 1
      }
    },
    computed: {
      player() {
        return this.$store.player;
      },
      hasEnoughMoney() {
    return this.player.props.money >= this.betAmount;
  },
      nextGameTime() {
        return this.player.nextGameTimes?.dice || 0;
      },
      canBet() {
        return Date.now() >= this.nextGameTime && this.hasEnoughMoney;
      },
      diceImage() {
        return `../src/assets/dice${this.diceNumber}.svg`;
      }
    },
    methods: {
      decreaseBet() {
        if (this.betAmount > 100) {
          this.betAmount -= 100;
        }
      },
      increaseBet() {
        if (this.betAmount < 10000) {
          this.betAmount += 100;
        }
      },
      placeBet() {
        if (!this.canBet) return;
  
        this.isRolling = true;
        this.result = null;
  
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
      finishRoll() {
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
        this.result = {
          dice,
          message: won ? `恭喜您赢得了 ${reward} 灵石！` : '很遗憾，您输了。',
        };
  
        this.$emit('game-result', { success: won, reward });
  
        const newNextGameTime = Date.now() + 10 * 60 * 1000; // 10 minutes
        this.player.nextGameTimes.dice = newNextGameTime
        this.$emit('update-next-game-time', { game: 'dice', time: newNextGameTime });
  
        this.isRolling = false;
      },
      formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString();
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
    margin-bottom: 20px;
  }
  .bet-amount {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .result {
    margin-top: 20px;
    text-align: center;
  }
  .timer {
    margin-top: 10px;
    margin-bottom: 10px;
    font-style: italic;
  }
  .dice-container {
    width: 100px;
    height: 100px;
    margin: 20px 0;
  }
  .dice-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  .rolling {
    animation: roll 0.1s linear infinite;
  }
  @keyframes roll {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  .el-button {
    margin-bottom: 10px;
    font-style: italic;
  }
  </style>