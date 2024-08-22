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
                <div v-for="(cell, index) in grid" :key="index" :class="['grid-item', cell.type]" @click="gridInfo(index, cell)"></div>
            </div>
        </div>
        <div class="controls">
            <el-button class="home-button" @click="$router.push('/home');">回家</el-button>
            <el-button class="up-button" @click="move('up')">往北</el-button>
            <el-button class="dialogue-button" @click="talkToNpc" :disabled="!canTalk">对话</el-button>
            <el-button class="left-button" @click="move('left')">往西</el-button>
            <el-button class="down-button" @click="move('down')">往南</el-button>
            <el-button class="right-button" @click="move('right')">往东</el-button>
        </div>
        <el-drawer :title="npcInfo.name" :visible.sync="npcShow" direction="rtl" class="strengthen">
            <div class="wife-box">
                <div class="attributes">
                    <div class="attribute-box">
                        <div class="tag attribute">
                            境界: {{ $levelNames[npcInfo.lv] }} ({{ npcInfo.reincarnation }}转)
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
                    <el-button type="primary" :disabled="npcInfo.favorability >= 1000" @click="harvestNpc(npcInfo)">
                        结为道侣
                    </el-button>
                </div>
                <div class="gift-box" v-if="giftShow">
                    <div class="gift-item" v-for="(item, index) in giftItems" :key="index" @click="giftInfo(item, index)">
                        <el-tag :type="item.lv">{{item.name}}</el-tag>
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
    // 怪物
    import monster from '@/plugins/monster';

    export default {
        data () {
            return {
                player: {},
                npcInfo: [],
                npcShow: false,
                gridSize: 50, // 地图的大小 (50x50)
                grid: [], // 保存每个格子的状态
                playerX: 0, // 玩家在X轴的位置
                playerY: 0, // 玩家在Y轴的位置
                giftShow: false,
                obstacleCount: 0, // 障碍物的数量 (总格子的10%)
                npcCount: 10, // NPC的数量
            };
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
            canTalk () {
                // 计算玩家附近是否有NPC
                const nearbyIndices = [
                    (this.playerY - 1) * this.gridSize + this.playerX, // 上
                    (this.playerY + 1) * this.gridSize + this.playerX, // 下
                    this.playerY * this.gridSize + (this.playerX - 1), // 左
                    this.playerY * this.gridSize + (this.playerX + 1)  // 右
                ];
                return nearbyIndices.some(index => this.grid[index]?.type === 'npc');
            }
        },
        created () {
            this.player = this.$store.state.player;
            this.obstacleCount = Math.floor(this.totalCells * 0.1);
            this.initializeGrid();
        },
        methods: {
            // 初始化地图
            initializeGrid () {
                this.grid = Array(this.totalCells).fill().map(() => ({ type: 'empty' }));
                // 定义安全区域，防止障碍物包围玩家
                const safeZone = new Set([
                    this.playerY * this.gridSize + this.playerX,
                    (this.playerY - 1) * this.gridSize + this.playerX,
                    (this.playerY + 1) * this.gridSize + this.playerX,
                    this.playerY * this.gridSize + (this.playerX - 1),
                    this.playerY * this.gridSize + (this.playerX + 1)
                ]);
                // 随机生成障碍物，避开安全区域
                this.generateItems('obstacle', this.obstacleCount, safeZone);
                // 随机生成NPC，避开安全区域和障碍物
                this.generateNpcs(this.npcCount, safeZone);
                // 更新玩家初始位置
                this.updatePlayerPosition();
            },
            // 生成指定数量的物品（障碍物或NPC）
            generateItems (type, count, excludeSet) {
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
                const npcs = this.player.npcs.length ? this.player.npcs : npc.npcNames();
                const isData = this.player.npcs.length;
                const createNPCData = (name, index, favorability) => {
                    return {
                        lv: 40,
                        name,
                        position: index,
                        favorability: isData ? favorability : 0,
                        reincarnation: 10,
                    };
                };
                let arr = [];
                for (let i = 0; i < count; i++) {
                    for (let placed = false; !placed;) {
                        const index = Math.floor(Math.random() * this.totalCells);
                        if (!excludeSet.has(index) && this.grid[index].type === 'empty') {
                            this.grid[index].type = 'npc';
                            const npcData = isData ? createNPCData(npcs[i].name, index, npcs[i].favorability) : createNPCData(npcs[i], index, 0);
                            arr.push(npcData);
                            this.player.npcs = arr;
                            placed = true;
                            // 更新玩家存档
                            this.$store.commit('setPlayer', this.player);
                        }
                    }
                }
            },
            harvestNpc (item) {
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
                // 更新玩家存档
                this.$store.commit('setPlayer', this.player);
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
                        this.$notify({ title: '赠送提示' + index, message: '灵石不足, 赠送失败', position: 'top-left' });
                        return;
                    }
                    // 扣除灵石数量
                    this.player.props.money -= item.price;
                    // 增加好感度
                    this.npcInfo.favorability += item.plus;
                    // 增加传送符
                    this.player.props.flying += index;
                    // 更新玩家存档
                    this.$store.commit('setPlayer', this.player);
                    this.$notify({ title: '赠送提示', message: `赠送成功, ${this.npcInfo.name}对你的好感度增加了, 并赠与了你${index}张传送符`, position: 'top-left' });
                }).catch(() => { });
            },
            // 地图信息
            gridInfo (index, item) {
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
                    confirmButtonText: '立即传送',
                    dangerouslyUseHTMLString: true
                }).then(() => {
                    if (!this.player.props.flying) {
                        this.$notify({ title: '传送提示', message: '传送失败, 传送符不足', position: 'top-left' });
                        return;
                    }
                    if (item.type != 'empty') {
                        this.$notify({ title: '传送提示', message: '传送失败, 该坐标有障碍物或NPC', position: 'top-left' });
                        return;
                    }
                    this.playerY = y;
                    this.playerX = x;
                    this.updatePlayerPosition();
                    this.$notify({ title: '传送提示', message: '传送成功', position: 'top-left' });
                }).catch(() => { });
            },
            // 更新玩家在地图上的位置
            updatePlayerPosition () {
                this.grid.forEach(cell => (cell.type === 'player' ? cell.type = 'empty' : cell.type));
                const playerIndex = this.playerY * this.gridSize + this.playerX;
                this.grid[playerIndex].type = 'player';
                const rand = monster.getRandomInt(1, 100);
                if (rand >= 50 && playerIndex != 0) {
                    this.$router.push('/explore');
                }
            },
            // 根据方向移动玩家
            move (direction) {
                let newX = this.playerX;
                let newY = this.playerY;
                switch (direction) {
                    case 'up':
                        if (newY > 0) newY--;
                        break;
                    case 'down':
                        if (newY < this.gridSize - 1) newY++;
                        break;
                    case 'left':
                        if (newX > 0) newX--;
                        break;
                    case 'right':
                        if (newX < this.gridSize - 1) newX++;
                        break;
                }
                const newIndex = newY * this.gridSize + newX;
                // 仅在目标位置为空地时移动玩家
                if (this.grid[newIndex].type === 'empty') {
                    this.playerX = newX;
                    this.playerY = newY;
                }
                this.updatePlayerPosition();
            },
            // 找到并与附近的NPC对话
            talkToNpc () {
                const nearbyIndices = [
                    (this.playerY - 1) * this.gridSize + this.playerX, // 上
                    (this.playerY + 1) * this.gridSize + this.playerX, // 下
                    this.playerY * this.gridSize + (this.playerX - 1), // 左
                    this.playerY * this.gridSize + (this.playerX + 1)  // 右
                ];
                this.npcShow = true;
                this.npcInfo = this.player.npcs.find(npc => nearbyIndices.includes(npc.position));
            },
        }
    };
</script>

<style scoped>
    .map {
        max-width: 770px;
        overflow: auto;
    }

    .grid-container {
        display: grid;
        grid-template-columns: repeat(50, 12px);
        grid-template-rows: repeat(50, 12px);
        gap: 1px;
        width: fit-content;
        margin: 20px auto;
        border: 2px solid #000;
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
        background-color: blue;
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
        /* 让按钮一左一右分开 */
        grid-column: span 3;
        /* 占据三列的宽度 */
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

    .attributes {
        display: flex;
        justify-content: center;
    }

    .attribute-box {
        display: flex;
        flex-wrap: wrap;
    }

    .attribute {
        width: 100%;
        margin: 4px;
    }

    .tag {
        height: 32px;
        padding: 0 10px;
        line-height: 30px;
        font-size: 12px;
        border-width: 1px;
        border-style: solid;
        border-radius: 4px;
        box-sizing: border-box;
        white-space: nowrap;
        display: inline-block;
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