<template>
    <div class="tic-tac-toe">
        <div class="game-board">
            <div v-for="(row, rowIndex) in board" :key="rowIndex" class="row">
                <el-button v-for="(cell, colIndex) in row" :key="colIndex" @click="makeMove(rowIndex, colIndex)" :disabled="cell !== ' ' || !canPlay" class="cell" v-text="cell" />
            </div>
        </div>
        <p v-if="canPlay" class="game-status" v-text="gameStatus" />
        <el-button @click="resetGame" v-text="'重新开始'" v-if="canPlay && !gameEnded" />
        <el-countdown :title="hasEnoughMoney ? '冷却中' : '灵石不足'" :value="nextGameTime" @finish="finish" v-else />
    </div>
</template>

<script>
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
        data () {
            return {
                // 游戏棋盘，3x3阵列，初始填充为空格
                board: [
                    [' ', ' ', ' '],
                    [' ', ' ', ' '],
                    [' ', ' ', ' ']
                ],
                canPlay: false,
                // 当前玩家，'X' 或 'O'
                currentPlayer: 'X',
                // 游戏是否已经结束
                gameEnded: false
            }
        },
        computed: {
            // 从 Vuex store 获取玩家信息
            player () {
                return this.$store.player;
            },
            // 检查是否有玩家获胜
            checkWinner () {
                return WINNING_LINES.some(line =>
                    line.every(([row, col]) => this.board[row][col] === this.currentPlayer)
                );
            },
            // 检查棋盘是否已满
            isBoardFull () {
                return this.board.flat().every(cell => cell !== ' ');
            },
            // 计算下次游戏可用时间
            nextGameTime () {
                return this.player.nextGameTimes?.ticTacToe || 0;
            },
            // 判断玩家是否有足够的钱
            hasEnoughMoney () {
                return this.player.props.money >= 1000;
            }
        },
        created () {
            // 判断玩家是否可以进行游戏
            this.canPlay = Date.now() >= this.nextGameTime && this.hasEnoughMoney;
            this.gameStatus = `${this.player.name}的轮次`;
        },
        methods: {
            finish () {
                this.canPlay = true;
                this.gameEnded = false;
            },
            // 处理玩家的移动
            makeMove (row, col) {
                // 检查单元格是否为空，游戏是否未结束，以及玩家是否可以进行游戏
                if (this.board[row][col] === ' ' && !this.gameEnded && this.canPlay) {
                    // 更新棋盘并检查游戏状态
                    this.updateBoard(row, col, this.currentPlayer);
                    if (this.checkWinner) {
                        this.endGame(`恭喜${this.player.name}胜利！`, true);
                    } else if (this.isBoardFull) {
                        this.endGame('平局！', false);
                    } else {
                        // 切换玩家并进行天道的行动
                        this.switchPlayer();
                        this.computerMove();
                    }
                }
            },
            // 处理天道的行动
            computerMove () {
                if (!this.gameEnded) {
                    setTimeout(() => {
                        let row, col;
                        const emptyCells = [];
                        this.board.forEach((r, i) => r.forEach((c, j) => c === ' ' && emptyCells.push([i, j])));
                        [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
                        this.updateBoard(row, col, this.currentPlayer);
                        if (this.checkWinner) this.endGame(`恭喜天道胜利！`, false);
                        else if (this.isBoardFull) this.endGame('平局！', false);
                        else this.switchPlayer();
                    }, 500);
                }
            },
            // 更新棋盘数据
            updateBoard (row, col, player) {
                this.board[row][col] = player;
            },
            // 切换当前玩家
            switchPlayer () {
                this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
                this.gameStatus = `${this.currentPlayer === 'X' ? this.player.name : '天道'}的轮次`;
            },
            // 重置游戏状态
            resetGame () {
                this.board = [
                    [' ', ' ', ' '],
                    [' ', ' ', ' '],
                    [' ', ' ', ' ']
                ];
                this.currentPlayer = 'X';
                this.gameEnded = false;
                this.gameStatus = `${this.player.name}的轮次`;
            },
            // 结束游戏并处理结果
            endGame (status, playerWon) {
                this.gameStatus = status;
                this.gameEnded = true;
                const reward = playerWon ? 1000 : -1000;
                this.$emit('game-result', { success: playerWon, reward });
                const newNextGameTime = Date.now() + 10 * 60 * 1000;
                this.player.nextGameTimes.ticTacToe = newNextGameTime;
                this.$emit('update-next-game-time', { game: 'ticTacToe', time: newNextGameTime });
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
        /* border: none; */
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

    h3 {
        color: var(--el-text-color-primary);
    }
</style>