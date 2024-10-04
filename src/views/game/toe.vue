<template>
  <div class="tic-tac-toe">
    <!-- 游戏主板 -->
    <div class="game-board">
      <!-- 遍历每一行 -->
      <div  v-for="(row, rowIndex) in board" :key="rowIndex" class="row">
        <!-- 遍历每一个单元格 -->
        <button
          v-for="(cell, colIndex) in row"
          :key="colIndex"
          @click="makeMove(rowIndex, colIndex)"
          :disabled="cell !== ' ' || !canPlay"
          class="cell"
        >
          {{ cell }}
        </button>
      </div>
    </div>
    <!-- 显示当前游戏状态 -->
    <p v-if="canPlay" class="game-status">{{ gameStatus }}</p>
    <!-- 重置游戏按钮 -->
    <el-button @click="resetGame" :disabled="!gameEnded && !canPlay">
      {{ gameEnded ? '重新开始' : (canPlay ? '重置游戏' : (hasEnoughMoney ? '冷却中' : '灵石不足')) }}
    </el-button>
    <!-- 显示下次游戏时间 -->
    <div class="timer" v-if="!canPlay">
      下次游戏时间: {{ formatTime(nextGameTime) }}
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';

// 定义获胜组合
const WINNING_LINES = [
  [[0, 0], [0, 1], [0, 2]],
  [[1, 0], [1, 1], [1, 2]],
  [[2, 0], [2, 1], [2, 2]],
  [[0, 0], [1, 0], [2, 0]],
  [[0, 1], [1, 1], [2, 1]],
  [[0, 2], [1, 2], [2, 2]],
  [[0, 0], [1, 1], [2, 2]],
  [[0, 2], [1, 1], [2, 0]]
];

export default {
  name: 'TicTacToe',
  data() {
    return {
      // 游戏棋盘，3x3阵列，初始填充为空格
      board: [
        [' ', ' ', ' '],
        [' ', ' ', ' '],
        [' ', ' ', ' ']
      ],
      // 当前玩家，'X' 或 'O'
      currentPlayer: 'X',
      // 游戏是否已经结束
      gameEnded: false,
      // 游戏状态信息
      gameStatus: '轮到玩家 X',
    }
  },
  computed: {
    // 从 Vuex store 获取玩家信息
    player() {
      return this.$store.player;
    },
    // 计算下次游戏可用时间
    nextGameTime() {
      return this.player.nextGameTimes?.ticTacToe || 0;
    },
    // 判断玩家是否有足够的钱
    hasEnoughMoney() {
      return this.player.props.money >= 1000;
    },
    // 判断玩家是否可以进行游戏
    canPlay() {
      return Date.now() >= this.nextGameTime && this.hasEnoughMoney;
    },
  },
  methods: {
    // 处理玩家的移动
    makeMove(row, col) {
      // 检查单元格是否为空，游戏是否未结束，以及玩家是否可以进行游戏
      if (this.board[row][col] === ' ' && !this.gameEnded && this.canPlay) {
        // 更新棋盘并检查游戏状态
        this.updateBoard(row, col, this.currentPlayer);
        if (this.checkWinner()) {
          this.endGame(`玩家 ${this.currentPlayer} 胜利！`, true);
        } else if (this.isBoardFull()) {
          this.endGame('平局！', false);
        } else {
          // 切换玩家并进行计算机移动
          this.switchPlayer();
          this.computerMove();
        }
      }
    },
    // 处理计算机的移动
    computerMove() {
      if (!this.gameEnded) {
        setTimeout(() => {
          let row, col;
          const emptyCells = [];
          this.board.forEach((r, i) => r.forEach((c, j) => c === ' ' && emptyCells.push([i, j])));
          [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
          this.updateBoard(row, col, this.currentPlayer);
          if (this.checkWinner()) {
            this.endGame(`计算机 ${this.currentPlayer} 胜利！`, false);
          } else if (this.isBoardFull()) {
            this.endGame('平局！', false);
          } else {
            this.switchPlayer();
          }
        }, 500);
      }
    },
    // 更新棋盘数据
    updateBoard(row, col, player) {
      this.board[row][col] = player;
    },
    // 切换当前玩家
    switchPlayer() {
      this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
      this.gameStatus = `轮到${this.currentPlayer === 'X' ? '玩家' : '计算机'} ${this.currentPlayer}`;
    },
    // 检查是否有玩家获胜
    checkWinner() {
      return WINNING_LINES.some(line =>
        line.every(([row, col]) => this.board[row][col] === this.currentPlayer)
      );
    },
    // 检查棋盘是否已满
    isBoardFull() {
      return this.board.flat().every(cell => cell !== ' ');
    },
    // 重置游戏状态
    resetGame() {
      this.board = [
        [' ', ' ', ' '],
        [' ', ' ', ' '],
        [' ', ' ', ' ']
      ];
      this.currentPlayer = 'X';
      this.gameEnded = false;
      this.gameStatus = '轮到玩家 X';
    },
    // 结束游戏并处理结果
    endGame(status, playerWon) {
      this.gameStatus = status;
      this.gameEnded = true;
      const reward = playerWon ? 1000 : -1000;
      this.$emit('game-result', { success: playerWon, reward });
      const newNextGameTime = Date.now() + 10 * 60 * 1000;
      this.player.nextGameTimes.ticTacToe = newNextGameTime;
      this.$emit('update-next-game-time', { game: 'ticTacToe', time: newNextGameTime });
    },
    // 格式化时间戳
    formatTime(timestamp) {
      const date = new Date(timestamp);
      return date.toLocaleTimeString();
    }
  }
}
</script>

<style scoped>
.tic-tac-toe {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background-color: var(--el-bg-color);
  border-radius: 12px;
  box-shadow: var(--el-box-shadow-light);
}

.game-board {
  display: grid;
  grid-template-rows: repeat(3, 1fr);
  gap: 10px;
}

.row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.cell {
  width: 80px;
  height: 80px;
  font-size: 40px;
  font-weight: bold;
  background-color: var(--el-fill-color-light);
  color: var(--el-text-color-primary);
  border: none;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.3s;
}

.cell:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.cell:hover:not(:disabled) {
  background-color: var(--el-fill-color);
}

.game-status {
  font-size: 18px;
  font-weight: bold;
  color: var(--el-text-color-primary);
}

.timer {
  margin-top: 20px;
  font-style: italic;
  color: var(--el-text-color-secondary);
}

h3 {
  color: var(--el-text-color-primary);
}
</style>