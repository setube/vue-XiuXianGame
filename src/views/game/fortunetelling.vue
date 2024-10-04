<template>
  <div class="fortune-telling">
    <el-button @click="tellFortune" :disabled="!canTellFortune" class="fortune-button">
      {{ canTellFortune ? '开始算卦' : '今日已算卦' }}
    </el-button>
    <div v-if="result" class="result">
      <p>{{ result.message }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FortuneTelling',
  data() {
    return {
      result: null,
    }
  },
  computed: {
    player() {
      return this.$store.player;
    },
    canTellFortune() {
      const now = new Date();
      const lastFortune = new Date(this.player.fortuneTellingDate);
      return !this.player.fortuneTellingDate || 
             now.toDateString() !== lastFortune.toDateString();
    }
  },
  methods: {
    tellFortune() {
      if (!this.canTellFortune) return;

      const fortunes = [
        '大吉', '中吉', '小吉', '吉', '末吉', '凶', '大凶'
      ];
      const fortune = fortunes[Math.floor(Math.random() * fortunes.length)];
      const reward = fortune === '大吉' ? 50 : (fortune === '中吉' ? 30 : (fortune === '小吉' ? 20 : 0));

      this.result = {
        message: `您的运势是: ${fortune}${reward > 0 ? `，获得 ${reward} 灵石！` : ''}`
      };

      this.player.fortuneTellingDate = new Date().toISOString();
      this.player.props.money += reward;

      //this.$store.commit('updatePlayer', this.player);
      this.$emit('game-result', { success: reward > 0, reward });
    }
  }
}
</script>

<style scoped>
.fortune-telling {
  padding: 20px;
  background-color: var(--el-bg-color);
  border-radius: 12px;
  box-shadow: var(--el-box-shadow-light);
}

.fortune-button {
  width: 100%;
  background-color: var(--el-color-primary);
  color: var(--el-color-white);
  border: none;
  padding: 12px;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s ease;
}

.fortune-button:hover {
  opacity: 0.9;
}

.fortune-button:disabled {
  background-color: var(--el-button-disabled-bg-color);
  color: var(--el-button-disabled-text-color);
}

.result {
  margin-top: 20px;
  font-size: 16px;
  color: var(--el-text-color-primary);
}
</style>