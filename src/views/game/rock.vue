<template>
    <div class="rps-game">
      <div class="bet-amount">
        <el-input-number v-model="betAmount" :min="100" :step="100" :max="10000000" placeholder="下注金额"></el-input-number>
      </div>
      <div class="options">
        <el-button v-for="option in options" :key="option" @click="play(option)" :disabled="!canPlay">
          {{ option }}
        </el-button>
      </div>


      <div class="game-result" v-if="result">
        <div class="player-choice">
          <img :src="getImagePath(result.playerChoice)" :alt="result.playerChoice" class="choice-image">
          <p>你的选择</p>
        </div>
        <div class="vs">VS</div>
        <div class="computer-choice">
          <img :src="getImagePath(result.computerChoice)" :alt="result.computerChoice" class="choice-image">
          <p>电脑的选择</p>
        </div>
      </div>
      <div v-if="result" class="result">
        <p>{{ result.message }}</p>
      </div>
      <el-button>
      {{ canPlay ? '开始游戏' : (hasEnoughMoney ? '冷却中' : '灵石不足')}}
    </el-button>
    </div>
  </template>
  
  <script>
  export default {
    name: 'RockPaperScissors',
    data() {
      return {
        options: ['石头', '剪刀', '布'],
        result: null,
        betAmount: 100
      }
    },
    computed: {
      player() {
        return this.$store.player;
      },
      nextGameTime() {
        return this.player.nextGameTimes?.rps || 0;
      },
      hasEnoughMoney() {
    return this.player.props.money >= this.betAmount;
  },
  canPlay() {
        return Date.now() >= this.nextGameTime && this.hasEnoughMoney;
      },
    },
    methods: {
      play(playerChoice) {
        if (!this.canPlay) return;
  
        const computerChoice = this.options[Math.floor(Math.random() * 3)];
        let won = false;
  
        if (
          (playerChoice === '石头' && computerChoice === '剪刀') ||
          (playerChoice === '剪刀' && computerChoice === '布') ||
          (playerChoice === '布' && computerChoice === '石头')
        ) {
          won = true;
        }
  
        const reward = won ? this.betAmount * 2 : this.betAmount;
        this.result = {
          playerChoice,
          computerChoice,
          message: won ? `恭喜您赢得了 ${reward} 灵石！` : '很遗憾，您输了。',
        };
  
        this.$emit('game-result', { success: won, reward });
        
        const newNextGameTime = Date.now() + 10 * 60 * 1000; // 10 minutes
        this.player.nextGameTimes.rps = newNextGameTime
        this.$emit('update-next-game-time', { game: 'rps', time: newNextGameTime });
      },
      formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString();
      },
      getImagePath(choice) {
        return `../src/assets/${choice}.svg`;
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
    margin-top: 20px;
  }
  .player-choice, .computer-choice {
    text-align: center;
  }
  .vs {
    font-size: 24px;
    font-weight: bold;
  }
  .choice-image {
    width: 100px;
    height: 100px;
    object-fit: contain;
  }
  .result {
    margin-top: 20px;
    text-align: center;
  }
  .el-button {
    margin-bottom: 5px;
    font-style: italic;
  }
  </style>