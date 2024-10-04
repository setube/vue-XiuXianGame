<template>
  <div class="entertainment">
    <div class="game-options">
      <el-button v-for="(button, index) in buttonList" :key="index" @click="button.click"
        :class="{ 'active': isSelectedGame(button.game.name) }" v-text="button.text" />
    </div>

    <div v-if="selectedGame" class="game-container">
      <component :is="selectedGame.component" @game-result="processGameResult"></component>
    </div>

    <div class="stats">
      <div class="attribute-box">
        <div class="attribute" v-for="(attribute, index) in attributeList" :key="index">
          <span class="attribute-label">{{ attribute.name }}</span>
          <span class="attribute-value">{{ attribute.value }}</span>
        </div>
        <div class="attribute" @click="$router.push('/home')">
          <span class="attribute-label">撤退回家</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import tag from '@/components/tag.vue';
import DiceGame from './Dicegame.vue';
import RockPaperScissors from './rock.vue';
import FortuneTelling from './fortunetelling.vue';
import CheckIn from './checkin.vue';
import Toe from './toe.vue';
import SecretRealm from './SecretRealm.vue';  

export default {
  components: {
    tag,
    DiceGame,
    RockPaperScissors,
    FortuneTelling,
    CheckIn,
    Toe,
    SecretRealm,
  },
  data() {
    return {
      player: {},
      selectedGame: null,
      gameList: [
        { name: 'checkin', label: '签到', component: 'CheckIn' },
        { name: 'dice', label: '骰子', component: 'DiceGame' },
        { name: 'rps', label: '猜拳', component: 'RockPaperScissors' },
        { name: 'fortune', label: '算卦', component: 'FortuneTelling' },
        { name: 'toe', label: '井棋', component: 'Toe' },
        { name: 'secret-realm', label: '秘境', component: 'SecretRealm' },
      ],
    }
  },
  created() {
    this.player = this.$store.player;
    this.$nextTick(() => {
      this.selectGame(this.gameList.find(game => game.name === 'checkin'));
    });
  },
  mounted() {
    this.checkDailyReset();
  },
  computed: {
    buttonList() {
      return this.gameList.map(game => ({
        text: game.label,
        click: () => this.selectGame(game),
        game: game
      }));
    },
    attributeList() {
      return [
        { name: '签到天数', value: this.player.checkinDays },
        { name: '灵石', value: this.player.props.money },
        { name: '胜利次数', value: this.player.gameWins },
        { name: '失败次数', value: this.player.gameLosses },
      ];
    }
  },
  methods: {
    selectGame(game) {
      this.$nextTick(() => {
        this.selectedGame = game;
      });
    },
    processGameResult(result) {
      if (result.success) {
        this.updatePlayerWins(result);
      } else {
        this.updatePlayerLosses(result);
      }
    },
    updatePlayerWins(result) {
      this.player.gameWins++;
      const reward = result.reward;
      if (reward) {
        if (typeof reward === 'object') {
          Object.entries(reward).forEach(([key, value]) => {
            this.player.props[key] += value;
          });
        } else {
          this.player.props.money += reward;
        }
      }
    },
    updatePlayerLosses(result) {
      this.player.props.money -= result.reward;
      this.player.gameLosses++;
    },
    checkDailyReset() {
      const now = new Date();
      const lastCheckinDate = new Date(this.player.lastCheckinDate);
      if (now.toDateString() !== lastCheckinDate.toDateString()) {
        this.player.checkedInToday = false;
      }
    },
    isSelectedGame(gameName) {
      return this.selectedGame && this.selectedGame.name === gameName;
    }
  }
}
</script>

<style scoped>
.entertainment {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

.game-options {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
  border-radius: 10px;
  padding: 10px;
  box-shadow: var(--el-box-shadow-lighter);
}

.game-options .el-button {
  background-color: transparent;
  border: none;
  color: var(--el-color-primary);
  font-weight: 500;
  transition: all 0.3s ease;
}

.game-options .el-button.active {
  background-color: var(--el-color-primary);
  color: var(--el-color-white);
  border-radius: 8px;
}

.game-container {
  background-color: var(--el-bg-color);
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: var(--el-box-shadow-light);
}

.stats {
  border-radius: 12px;
}

.attribute-box {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.attribute {
  background-color: var(--el-bg-color);
  border-radius: 8px;
  padding: 10px 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex: 1 1 calc(50% - 5px);
  box-shadow: var(--el-box-shadow-lighter);
}

.attribute-label {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.attribute-value {
  font-weight: 600;
  color: var(--el-color-primary);
}

@media (max-width: 768px) {
  .game-options {
    flex-wrap: wrap;
  }

  .game-options .el-button {
    flex: 1 0 40%;
    margin: 5px;
  }

  .attribute {
    flex: 1 1 100%;
  }
}
</style>