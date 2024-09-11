<template>
    <div>
        <div class="legend">
            <div class="legend-item">
                <div class="color-box player"></div> 玩家
            </div>
            <div class="legend-item">
                <div class="color-box npc"></div> NPC
            </div>
            <div class="legend-item">
                <div class="color-box obstacle"></div> 障碍物
            </div>
            <div class="legend-item">
                <div class="color-box empty"></div> 空地
            </div>
        </div>
        <div class="map">
            <div class="grid-container">
                <div v-for="(cell, index) in grid" :key="index" :ref="'cell-' + index" :class="['grid-item', cell.type]" :style="{ backgroundColor: cell.his }" @click="gridInfo(index, cell)"></div>
            </div>
        </div>
        <div class="controls">
            <el-button class="home-button" @click="$router.push('/home');">回家</el-button>
            <el-button class="up-button" @click="move('up')" :disabled="isTopObstacle || playerY == 0">往北</el-button>
            <el-button class="dialogue-button" @click="talkToNpc" :disabled="!isNpc">对话</el-button>
            <el-button class="left-button" @click="move('left')" :disabled="isLeftObstacle || playerX === 0">往西</el-button>
            <el-button class="down-button" @click="move('down')" :disabled="isDownObstacle || playerY === gridSize - 1">往南</el-button>
            <el-button class="right-button" @click="move('right')" :disabled="isRightObstacle || playerX === gridSize - 1">往东</el-button>
        </div>
        <el-drawer v-model="npcShow" :title="npcInfo.name" direction="rtl" class="strengthen">
            <div class="wife-box">
                <div class="attributes">
                    <div class="attribute-box">
                        <div class="tag attribute">
                            境界: {{ $levelNames(npcInfo.lv) }} ({{ npcInfo.reincarnation }}转)
                        </div>
                        <div class="tag attribute">
                            气血: 不详
                        </div>
                        <div class="tag attribute">
                            攻击: 不详
                        </div>
                        <div class="tag attribute">
                            防御: 不详
                        </div>
                        <div class="tag attribute">
                            闪避: 不详
                        </div>
                        <div class="tag attribute">
                            暴击: 不详
                        </div>
                        <div class="tag attribute">
                            好感度: {{ npcInfo.favorability }}
                        </div>
                    </div>
                </div>
                <div class="click-box">
                    <el-button type="primary" @click="giftShow = !giftShow">
                        {{giftShow ? '取消赠送' : '赠送礼物'}}
                    </el-button>
                    <el-button type="primary" :disabled="npcInfo.favorability < 1000 || isHaveWife(npcInfo.name)" @click="harvestNpc(npcInfo)">
                        {{ isHaveWife(npcInfo.name) ? '已结为道侣' : '结为道侣' }}
                    </el-button>
                </div>
                <div class="gift-box" v-if="giftShow">
                    <div class="gift-item" v-for="(item, index) in giftItems" :key="index" @click="giftInfo(item, index)">
                        <tag :type="item.lv">{{item.name}}</tag>
                        <span class="gift-name">{{item.price}}灵石</span>
                    </div>
                </div>
            </div>
        </el-drawer>
    </div>
</template>

<script>
    // npc
    import npc from '@/plugins/npc';
    import tag from '@/components/tag.vue';

    // 优先队列实现
    class PriorityQueue {
        constructor() {
            this.elements = [];
        }
        add (element, priority) {
            this.elements.push({ element, priority });
            this.elements.sort((a, b) => a.priority - b.priority);
        }
        poll () {
            return this.elements.shift().element;
        }
        isEmpty () {
            return this.elements.length === 0;
        }
    }

    export default {
        data () {
            return {
                grid: [], // 保存每个格子的状态
                player: {},
                playerX: 0, // 玩家在X轴的位置
                playerY: 0, // 玩家在Y轴的位置
                npcInfo: {},
                npcShow: false,
                gridSize: 50, // 地图的大小 (50x50)
                giftShow: false,
                npcCount: 10, // NPC的数量
                obstacleCount: 0, // 障碍物的数量 (总格子的10%)
            };
        },
        components: {
            tag
        },
        computed: {
            giftItems () {
                const arr = [];
                const num = {
                    1: '一', 2: '二', 3: '三',
                    4: '四', 5: '五', 6: '六'
                };
                const lv = {
                    1: 'info', 2: 'success', 3: 'primary',
                    4: 'purple', 5: 'warning', 6: 'danger'
                };
                const price = {
                    1: 200, 2: 400, 3: 800,
                    4: 1500, 5: 2000, 6: 3000
                };
                for (let i = 1; i < 7; i++) {
                    arr.push({
                        lv: lv[i],
                        plus: price[i] / 100,
                        name: `${num[i]}品驻颜丹`,
                        price: price[i]
                    });
                }
                return arr;
            },
            totalCells () {
                return this.gridSize * this.gridSize;
            },
            nearbyIndices () {
                return [
                    (this.playerY - 1) * this.gridSize + this.playerX, // 上
                    (this.playerY + 1) * this.gridSize + this.playerX, // 下
                    this.playerY * this.gridSize + (this.playerX - 1), // 左
                    this.playerY * this.gridSize + (this.playerX + 1)  // 右
                ];
            },
            // 计算玩家附近是否有NPC
            isNpc () {
                return this.nearbyIndices.some(index => this.grid[index]?.type === 'npc');
            },
            // 判断玩家上方有没有障碍物
            isTopObstacle () {
                return this.checkDirection('up');
            },
            // 判断玩家左方有没有障碍物
            isLeftObstacle () {
                return this.checkDirection('left');
            },
            // 判断玩家下方有没有障碍物
            isDownObstacle () {
                return this.checkDirection('down');
            },
            // 判断玩家右方有没有障碍物
            isRightObstacle () {
                return this.checkDirection('right');
            }
        },
        mounted () {
            this.player = this.$store.player;
            this.obstacleCount = Math.floor(this.totalCells * 0.1);
            const mapData = this.$store.mapData;
            if (mapData.map.length) {
                this.grid = mapData.map;
                this.playerY = mapData.y;
                this.playerX = mapData.x;
            } else {
                this.initializeGrid();
            }
            window.addEventListener('keydown', this.move);
        },
        beforeUnmount () {
            window.removeEventListener('keydown', this.move);
        },
        methods: {
            // 初始化地图
            initializeGrid () {
                this.grid = Array(this.totalCells).fill().map(() => ({ his: '', type: 'empty' }));
                const safeZone = this.createSafeZone();
                // 生成障碍物
                this.generateItems('obstacle', this.obstacleCount, safeZone);
                // 确保障碍物生成不会堵塞路径
                this.ensurePathAvailability();
                // 生成NPC
                this.generateNpcs(this.npcCount, safeZone);
                // 确保NPC生成不会堵塞路径
                this.ensurePathAvailability();
                // 更新玩家初始位置
                this.updatePlayerPosition();
            },
            // 创建安全区域
            createSafeZone () {
                const safeZone = new Set();
                for (let y = this.playerY - 1; y <= this.playerY + 1; y++) {
                    for (let x = this.playerX - 1; x <= this.playerX + 1; x++) {
                        if (y >= 0 && y < this.gridSize && x >= 0 && x < this.gridSize) safeZone.add(y * this.gridSize + x);
                    }
                }
                return safeZone;
            },
            // 确保地图的路径可用性
            ensurePathAvailability () {
                while (!this.isPathAvailable()) {
                    // 重新生成障碍物
                    this.generateItems('obstacle', this.obstacleCount, this.createSafeZone());
                    // 重新生成NPC
                    this.generateNpcs(this.npcCount, this.createSafeZone());
                }
            },
            // 使用 A* 算法检查路径可用性
            isPathAvailable () {
                const start = [this.playerY, this.playerX];
                const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
                const heuristic = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
                const end = [0, 0];
                const openSet = new PriorityQueue();
                const cameFrom = new Map();
                const gScore = new Map();
                const fScore = new Map();
                openSet.add(start, 0);
                gScore.set(start.toString(), 0);
                fScore.set(start.toString(), heuristic(start, end));
                while (!openSet.isEmpty()) {
                    const current = openSet.poll();
                    if (current[0] === 0 || current[0] === this.gridSize - 1 || current[1] === 0 || current[1] === this.gridSize - 1) return true;
                    for (const [dy, dx] of directions) {
                        const newY = current[0] + dy;
                        const newX = current[1] + dx;
                        const neighbor = [newY, newX];
                        if (newY >= 0 && newY < this.gridSize && newX >= 0 && newX < this.gridSize &&
                            this.grid[newY * this.gridSize + newX].type === 'empty') {
                            const tentativeGScore = gScore.get(current.toString()) + 1;
                            if (!gScore.has(neighbor.toString()) || tentativeGScore < gScore.get(neighbor.toString())) {
                                cameFrom.set(neighbor.toString(), current);
                                gScore.set(neighbor.toString(), tentativeGScore);
                                fScore.set(neighbor.toString(), tentativeGScore + heuristic(neighbor, end));
                                openSet.add(neighbor, fScore.get(neighbor.toString()));
                            }
                        }
                    }
                }
                return false;
            },
            // 生成指定数量的障碍物
            generateItems (type, count, excludeSet) {
                this.grid.forEach(cell => {
                    if (cell.type === 'obstacle') cell.type = 'empty';
                });
                let placed = 0;
                while (placed < count) {
                    const index = Math.floor(Math.random() * this.totalCells);
                    if (!excludeSet.has(index) && this.grid[index].type === 'empty') {
                        this.grid[index].type = type;
                        placed++;
                    }
                }
            },
            // 生成指定数量的NPC
            generateNpcs (count, excludeSet) {
                window.player = this.player
                this.grid.forEach(cell => {
                    if (cell.type === 'npc') cell.type = 'empty';
                });
                const npcs = this.player.npcs.length ? this.player.npcs : npc.npcNames();
                const isData = this.player.npcs.length;
                const createNPCData = (name, index, favorability) => {
                    return {
                        lv: 144,
                        name,
                        position: index,
                        favorability: isData ? favorability : 0,
                        reincarnation: 10
                    };
                };
                let arr = [];
                for (let i = 0; i < count; i++) {
                    for (let placed = false; !placed;) {
                        const index = Math.floor(Math.random() * this.totalCells);
                        if (!excludeSet.has(index) && this.grid[index].type === 'empty') {
                            const favorability = isData ? npcs[i].favorability : 0;
                            const lightness = this.calculateLightness(favorability);
                            this.grid[index].his = `hsl(340, 82%, ${lightness}%, 1)`;
                            this.grid[index].type = 'npc';
                            const npcData = isData ? createNPCData(npcs[i].name, index, npcs[i].favorability) : createNPCData(npcs[i], index, 0);
                            arr.push(npcData);
                            this.player.npcs = arr;
                            placed = true;
                            this.$store.setPlayer(this.player);
                        }
                    }
                }
            },// 根据亲密度计算颜色亮度
            calculateLightness (favorability) {
                const maxFavorability = 1000;
                const minLightness = 30; // 最暗
                const maxLightness = 80; // 最亮
                // 根据亲密度百分比计算亮度
                const percentage = favorability / maxFavorability;
                return minLightness + (maxLightness - minLightness) * percentage;
            },
            harvestNpc (item) {
                this.$confirm('与对方结为道侣有50%的概率失败, 失败后好感度会清空, 请问还想与对方结为道侣吗?', '结为道侣', {
                    center: true,
                    cancelButtonText: '取消',
                    confirmButtonText: '确定',
                }).then(() => {
                    const rand = this.isLucky(50);
                    if (rand) {
                        // 添加道侣
                        this.player.wifes.push({
                            name: item.name,
                            level: 0,
                            dodge: 0,
                            attack: 10,
                            health: 100,
                            defense: 10,
                            critical: 0,
                            reincarnation: 0
                        });
                        this.$notifys({ title: '提示', message: '你成功邀请对方与你结为道侣', position: 'top-left' });
                    } else {
                        this.npcInfo.favorability = 0;
                        this.$notifys({ title: '提示', message: '对方拒绝了你的邀请, 好感度清空', position: 'top-left' });
                    }
                    // 更新玩家存档
                    this.$store.setPlayer(this.player);
                }).catch(() => { });
            },
            // 礼物信息
            giftInfo (item, index) {
                this.$confirm('', '赠送礼物', {
                    center: true,
                    message: `<div class="monsterinfo">
                        <div class="monsterinfo-box">
                            <p>名称: ${item.name}</p>
                            <p>价格: ${item.price}</p>
                            <p>增加好感度: ${item.plus}</p>
                        </div>
                    </div>`,
                    lockScroll: false,
                    cancelButtonText: '取消赠送',
                    confirmButtonText: '立即赠送',
                    dangerouslyUseHTMLString: true
                }).then(() => {
                    if (item.price > this.player.props.money) {
                        this.$notifys({ title: '赠送提示', message: '灵石不足, 赠送失败', position: 'top-left' });
                        return;
                    }
                    // 扣除灵石数量
                    this.player.props.money -= item.price;
                    // 增加好感度
                    this.npcInfo.favorability += item.plus;
                    // 增加传送符
                    this.player.props.flying += index;
                    // 增加情缘点
                    this.player.props.qingyuan += index;
                    // 更新玩家存档
                    this.$store.setPlayer(this.player);
                    this.$notifys({ title: '赠送提示', message: `赠送成功, ${this.npcInfo.name}对你的好感度增加了, 并赠与了你${index}张传送符和${index}点情缘`, position: 'top-left' });
                }).catch(() => { });
            },
            // 地图信息
            gridInfo (index, item) {
                // 如果坐标不是空地
                if (item.type != 'empty') return;
                const x = index % this.gridSize;
                const y = Math.floor(index / this.gridSize);
                this.$confirm('地图坐标信息', '地图坐标信息', {
                    center: true,
                    message: `<div class="monsterinfo">
                        <div class="monsterinfo-box">
                            <p>X轴: ${x}</p>
                            <p>Y轴: ${y}</p>
                        </div>
                    </div>`,
                    lockScroll: false,
                    cancelButtonText: '取消传送',
                    confirmButtonText: '立即传送',
                    dangerouslyUseHTMLString: true
                }).then(() => {
                    if (!this.player.props.flying) {
                        this.$notifys({ title: '传送提示', message: '传送失败, 传送符不足', position: 'top-left' });
                        return;
                    }
                    this.playerY = y;
                    this.playerX = x;
                    this.updatePlayerPosition();
                    this.$notifys({ title: '传送提示', message: '传送成功', position: 'top-left' });
                }).catch(() => { });
            },
            // 更新玩家在地图上的位置
            updatePlayerPosition () {
                this.grid.forEach(cell => (cell.type === 'player' ? cell.type = 'empty' : cell.type));
                const playerIndex = this.playerY * this.gridSize + this.playerX;
                this.grid[playerIndex].type = 'player';
                // 更新地图数据
                this.$store.setMapData({
                    y: this.playerY,
                    x: this.playerX,
                    map: this.grid,
                });
                // 20%概率遇怪
                const rand = this.isLucky(20);
                if (rand && playerIndex != 0) {
                    this.$router.push('/explore');
                    // 移除键盘监听
                    window.removeEventListener('keydown', this.move);
                }
                // 每次更新玩家位置后调用
                if (playerIndex != 0) this.updateScroll(playerIndex);
            },
            // 计算玩家指定方向是否有NPC或障碍物
            checkDirection (direction) {
                const directions = {
                    up: (this.playerY - 1) * this.gridSize + this.playerX,
                    down: (this.playerY + 1) * this.gridSize + this.playerX,
                    left: this.playerY * this.gridSize + (this.playerX - 1),
                    right: this.playerY * this.gridSize + (this.playerX + 1)
                };
                const index = directions[direction];
                return ['obstacle', 'npc'].includes(this.grid[index]?.type);
            },
            // 根据方向移动玩家
            move (direction) {
                let newX = this.playerX;
                let newY = this.playerY;
                direction = typeof direction === 'string' ? direction : direction.key;
                switch (direction) {
                    case 'w':
                    case 'up':
                    case 'ArrowUp':
                        if (newY > 0) newY--;
                        break;
                    case 's':
                    case 'down':
                    case 'ArrowDown':
                        if (newY < this.gridSize - 1) newY++;
                        break;
                    case 'a':
                    case 'left':
                    case 'ArrowLeft':
                        if (newX > 0) newX--;
                        break;
                    case 'd':
                    case 'right':
                    case 'ArrowRight':
                        if (newX < this.gridSize - 1) newX++;
                        break;
                    case 'Enter':
                        if (this.isNpc) this.talkToNpc();
                        break;
                    default: return;
                }
                const newIndex = newY * this.gridSize + newX;
                // 仅在目标位置为空地时移动玩家
                if (this.grid[newIndex].type === 'empty') {
                    this.playerX = newX;
                    this.playerY = newY;
                }
                this.updatePlayerPosition();
            },
            // 自动滚动到玩家所在行
            updateScroll (playerIndex) {
                const playerCell = this.$refs[`cell-${playerIndex}`][0];
                if (playerCell) playerCell.scrollIntoView({ block: 'center', inline: 'center', behavior: 'smooth' });
            },
            // 找到并与附近的NPC对话
            talkToNpc () {
                this.npcShow = true;
                this.npcInfo = this.player.npcs.find(npc => this.nearbyIndices.includes(npc.position));
            },
            // 概率计算
            isLucky (probability) {
                // 生成一个0到100之间的随机数
                const randomValue = Math.random() * 100;
                // 判断随机数是否小于等于传入的概率值
                return randomValue < probability;
            },
            // 判断玩家是否已当前NPC结为道侣
            isHaveWife (name) {
                if (name) return this.player.wifes.some(item => item.name === name);
            }
        }
    };
</script>

<style scoped>
    .map {
        max-width: 770px;
        height: 500px;
        overflow: auto;
    }

    .grid-container {
        display: grid;
        grid-template-columns: repeat(50, 12px);
        grid-template-rows: repeat(50, 12px);
        gap: 1px;
        width: fit-content;
        margin: 20px auto;
    }

    .grid-item {
        width: 12px;
        height: 12px;
        background-color: #ddd;
    }

    .player {
        background-color: red;
    }

    .obstacle {
        background-color: gray;
    }

    .npc {
        background-color: rgb(139, 14, 56);
    }

    .empty {
        background-color: #ddd;
    }

    .controls {
        text-align: center;
        margin-top: 20px;
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        grid-template-rows: auto auto auto;
        width: 200px;
        margin: 20px auto;
    }

    .center-buttons {
        display: flex;
        justify-content: space-between;
        grid-column: span 3;
    }

    .controls>button,
    .center-buttons>button {
        padding: 10px;
        margin: 5px;
        font-size: 16px;
    }

    .legend {
        display: flex;
        justify-content: center;
        margin-bottom: 10px;
    }

    .legend-item {
        display: flex;
        align-items: center;
        margin: 0 10px;
    }

    .color-box {
        width: 12px;
        height: 12px;
        margin-right: 5px;
    }

    .wife-box {
        padding: 0 5px;
    }

    .attribute-box {
        display: flex;
        flex-wrap: wrap;
    }

    .attribute {
        width: 100%;
        margin: 4px;
    }

    .click-box {
        padding: 0 5px;
        margin-top: 10px;
        display: flex;
    }

    .click-box button {
        margin-top: 10px;
        width: 100%;
    }

    .gift-box {
        display: flex;
        flex-wrap: wrap;
        width: 100%;
        margin-top: 20px;
    }

    .gift-item {
        width: calc(50% - 8px);
        margin-top: 10px;
        display: grid;
        padding: 0 4px;
    }
</style>