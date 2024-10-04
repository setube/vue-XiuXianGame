<template>
    <div class="secret-realm">

        <div class="game-info">
            <div class="info-item">
                <span class="info-label">剩余探索次数:</span>
                <span class="info-value">{{ movesLeft }}</span>
            </div>
            <div class="info-item">
                <span class="info-label">获得灵石:</span>
                <span class="info-value">{{ rewardMoney }}</span>
            </div>
        </div>

        <div class="game-board">
            <div v-for="(row, rowIndex) in board" :key="rowIndex" class="board-row">
                <div v-for="(cell, colIndex) in row" :key="colIndex" class="board-cell"
                    :class="{ 'revealed': cell.revealed, [cell.type]: cell.revealed }"
                    @click="revealCell(rowIndex, colIndex)">
                    {{ cell.revealed ? getCellContent(cell) : '' }}
                </div>
            </div>
        </div>

        <el-button @click="startNewGame" :disabled="!gameOver" class="new-game-button">
            {{ !canExplore ? `下次探索时间:${formatTime(nextExploreTime)} ` : (gameOver ? '开始新的探索' : '探索中') }}
        </el-button>

        <div class="timer">

        </div>
    </div>
</template>

<script>
export default {
    name: 'SecretRealm',
    data() {
        return {
            boardSize: 8,
            board: [],
            movesLeft: 20,
            rewardMoney: 0,
            gameOver: false,
            cooldown: 0,
            cellTypes: {
                EMPTY: 'empty',
                REWARD: 'reward',
                MONSTER: 'monster',
                TRAP: 'trap',
                EVENT: 'event'
            }
        }
    },
    computed: {
        player() {
            return this.$store.player;
        },
        nextExploreTime() {
            return this.player.nextGameTimes?.secretrealm || 0;
        },
        canExplore() {
            return Date.now() >= this.nextExploreTime;
        }
    },
    methods: {
        initializeBoard() {
            this.board = Array(this.boardSize).fill().map(() =>
                Array(this.boardSize).fill().map(() => ({
                    revealed: false,
                    type: this.cellTypes.EMPTY
                }))
            );

            this.placeRandomCells(this.cellTypes.REWARD, 10);
            this.placeRandomCells(this.cellTypes.MONSTER, 5);
            this.placeRandomCells(this.cellTypes.TRAP, 3);
            this.placeRandomCells(this.cellTypes.EVENT, 5);
        },
        placeRandomCells(type, count) {
            for (let i = 0; i < count; i++) {
                let row, col;
                do {
                    row = Math.floor(Math.random() * this.boardSize);
                    col = Math.floor(Math.random() * this.boardSize);
                } while (this.board[row][col].type !== this.cellTypes.EMPTY);
                this.board[row][col].type = type;
            }
        },
        revealCell(row, col) {
            if (this.gameOver || this.board[row][col].revealed || !this.canExplore) return;

            const cell = this.board[row][col];
            cell.revealed = true;
            this.movesLeft--;

            switch (cell.type) {
                case this.cellTypes.REWARD:
                    const reward = Math.floor(Math.random() * 5000) + 500;
                    this.$notifys({ title: '找到灵石啦', message: `获得${reward}灵石` });
                    this.rewardMoney += reward;
                    this.player.props.money += reward;
                    break;
                case this.cellTypes.MONSTER:
                    this.$notifys({ title: '你真倒霉', message: `遇到了一只怪物` });
                    this.startBattle();
                    break;
                case this.cellTypes.TRAP:
                    const damage = Math.floor(Math.random() * 2000) + 500;
                    this.player.health = Math.max(0, this.player.health - damage);
                    this.$notifys({ title: '真晦气', message: `生命值减少${damage}` });
                    break;
                case this.cellTypes.EVENT:
                    this.triggerRandomEvent();
                    break;
            }

            if (this.movesLeft === 0) {
                this.gameOver = true;
                this.setCooldown();
            }
        },
        getCellContent(cell) {
            const contents = {
                [this.cellTypes.REWARD]: '💰',
                [this.cellTypes.MONSTER]: '👹',
                [this.cellTypes.TRAP]: '💥',
                [this.cellTypes.EVENT]: '❓'
            };
            return contents[cell.type] || '';
        },
        startBattle() {
            const playerWon = Math.random() > 0.5;
            if (playerWon) {
                const battleReward = Math.floor(Math.random() * 200) + 100;
                this.rewardMoney += battleReward;
                this.player.props.money += battleReward;
            } else {
                const damage = Math.floor(Math.random() * 30) + 20;
                this.player.health = Math.max(0, this.player.health - damage);
            }
        },
        triggerRandomEvent() {
            const events = [
                { name: '幸运符', effect: () => { this.rewardMoney *= 2; } },
                { name: '遭雷劈', effect: () => { this.player.health = Math.max(0, this.player.health - 50); } },
                { name: '灵感顿悟', effect: () => { this.player.cultivation += 100; } },
                { name: '迷失方向', effect: () => { this.movesLeft = Math.max(1, this.movesLeft - 5); } },
                { name: '宝藏地图', effect: () => { this.movesLeft += 5; } }
            ];

            const event = events[Math.floor(Math.random() * events.length)];
            this.$notifys({ title: '随机事件', message: event.name });
            event.effect();
        },
        startNewGame() {
            if (!this.canExplore) return;
            this.movesLeft = 20;
            this.rewardMoney = 0;
            this.gameOver = false;
            this.initializeBoard();
        },
        setCooldown() {
            this.cooldown = 120 * 60 * 1000;
            this.player.nextGameTimes.secretrealm = Date.now() + this.cooldown
        },
        formatTime(timestamp) {
            const date = new Date(timestamp);
            return date.toLocaleTimeString();
        }
    },
    mounted() {
        this.startNewGame();
    }
}
</script>

<style scoped>
.secret-realm {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    color: var(--el-text-color-primary);
    background-color: var(--el-bg-color);
}

.title {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 20px;
    color: var(--el-color-primary);
}

.game-info {
    display: flex;
    justify-content: space-between;
    width: 100%;
    max-width: 400px;
    margin-bottom: 20px;
}

.info-item {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.info-label {
    font-size: 14px;
    color: var(--el-text-color-secondary);
}

.info-value {
    font-size: 18px;
    font-weight: 600;
    color: var(--el-color-primary);
}

.game-board {
    display: inline-grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 0px;
    background-color: var(--el-border-color);
    border-radius: 5px;
    margin-left: 5px;
    margin-right: 5px;
}

.board-cell {
    width: 40px;
    height: 40px;
    background-color: var(--el-fill-color-light);
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 20px;
    cursor: pointer;
    transition: background-color 0.3s;
    border-radius: 4px;
}

.board-cell:hover {
    background-color: var(--el-fill-color);
}

.board-cell.revealed {
    background-color: var(--el-bg-color);
}

.board-cell.reward {
    background-color: var(--el-color-success-light-5);
}

.board-cell.monster {
    background-color: var(--el-color-danger-light-5);
}

.board-cell.trap {
    background-color: var(--el-color-warning-light-5);
}

.board-cell.event {
    background-color: var(--el-color-info-light-5);
}

.new-game-button {
    margin-top: 20px;
    width: 200px;
}

.timer {
    margin-top: 20px;
    font-style: italic;
    color: var(--el-text-color-secondary);
}
</style>