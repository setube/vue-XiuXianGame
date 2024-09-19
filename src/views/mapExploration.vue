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
                <div class="color-box fishing"></div> 钓鱼点
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
                <div v-for="(cell, index) in grid" :key="index" :ref="'cell-' + index" :class="['grid-item', cell.type, `x-${index % this.gridSize}`, `y-${Math.floor(index / this.gridSize)}`]" :style="{ backgroundColor: cell.his }" @click="gridInfo(index, cell)"></div>
            </div>
        </div>
        <div class="controls">
            <el-button class="home-button" @click="move('q')">
                回家<span class="shortcutKeys">(Q)</span>
            </el-button>
            <el-button class="up-button" @click="move('up')" :disabled="isTopObstacle || playerY == 0">
                往北<span class="shortcutKeys">(W)</span>
            </el-button>
            <el-button class="dialogue-button" @click="move('e')" :disabled="!isNpc && !isFishing">
                {{ isNpc || !isFishing ? '对话' : '钓鱼'}}<span class="shortcutKeys">(E)</span>
            </el-button>
            <el-button class="left-button" @click="move('left')" :disabled="isLeftObstacle || playerX === 0">
                往西<span class="shortcutKeys">(A)</span>
            </el-button>
            <el-button class="down-button" @click="move('down')" :disabled="isDownObstacle || playerY === gridSize - 1">
                往南<span class="shortcutKeys">(S)</span>
            </el-button>
            <el-button class="right-button" @click="move('right')" :disabled="isRightObstacle || playerX === gridSize - 1">
                往东<span class="shortcutKeys">(D)</span>
            </el-button>
        </div>
        <el-drawer v-model="fishingShow" @close="endGame" title="钓鱼" direction="rtl" class="strengthen">
            <div class="game-container">
                <div class="time">倒计时: {{ fishing.timeLeft }}秒</div>
                <div class="outer-wrapper">
                    <div class="progress-bar-container">
                        <div class="progress-bar" ref="progressBar" :style="{ height: fishing.progressPercentage }"></div>
                        <div class="progress-text">{{ fishing.progressText }}%</div>
                    </div>
                    <div class="outer-container" ref="outerContainer" :style="{ border: fishing.overlap ? '2px solid var(--el-color-warning)' : '2px solid var(--el-border-color)'}">
                        <div class="moving-container" ref="movingContainer" :style="{ animation: fishing.overlap ? 'wobble .5s ease-in-out infinite' : '', transformorigin: fishing.overlap ?  'bottom center' : ''}">
                            <svg viewBox="0 0 1024 1024">
                                <path d="M942 619.8c-27.4-29.4-42.5-67.6-42.5-107.8s15.1-78.4 42.5-107.8c14.8-15.8 18.6-38 10-58-8.6-19.8-27.3-32.2-48.9-32.3h-0.9c-35.3 0-70 9.4-100.2 27.2-29.4 17.3-53.9 41.9-71.1 71.4-2.8 4.8-7.3 6-9.7 6.4-4.2 0.6-8.4-0.8-11.3-3.8-38.3-38.2-82.9-68.2-132.5-89.1-51.4-21.7-105.9-32.7-162.2-32.7-29.1 0-57.6 2.9-85.5 8.7l-1.1 0.3c-33.5 7.1-66 18.3-97.1 33.6-28.6 14.1-55.7 31.5-80.5 51.8l-0.2 0.2c-2.1 1.7-4.1 3.4-6.2 5.2-0.4 0.4-0.9 0.8-1.3 1.1l-4.5 3.9c-0.6 0.5-1.2 1.1-1.8 1.6-1.7 1.5-3.3 3-5 4.5-0.8 0.7-1.6 1.5-2.4 2.3-1 1-2.1 2-3.1 2.9-0.8 0.8-1.6 1.5-2.4 2.3l-4.5 4.5c-0.8 0.8-1.6 1.6-2.4 2.5-1 1.1-2.1 2.1-3.1 3.2-0.7 0.8-1.4 1.5-2.2 2.3l-4.5 4.8c-0.6 0.7-1.3 1.4-1.9 2.1-1.3 1.5-2.7 3-4 4.5-0.3 0.4-0.7 0.8-1 1.1-1.6 1.9-3.3 3.8-4.9 5.7-0.4 0.5-0.9 1-1.3 1.6-1.7 2-3.3 4-4.9 6-14.1 17.6-21.9 39.7-21.9 62.2s7.8 44.6 21.9 62.2c1.6 2 3.3 4 4.9 6 0.4 0.5 0.9 1 1.3 1.6 1.6 1.9 3.2 3.8 4.9 5.7 0.3 0.4 0.7 0.7 1 1.1 1.3 1.5 2.7 3 4 4.5 0.6 0.7 1.3 1.4 1.9 2.1 1.5 1.6 3 3.3 4.6 4.9 0.7 0.7 1.4 1.5 2.1 2.2 1 1.1 2.1 2.2 3.1 3.2l2.4 2.4c1.5 1.5 3 3 4.6 4.5 0.8 0.8 1.6 1.5 2.4 2.3 1 1 2.1 2 3.1 3 0.8 0.7 1.6 1.5 2.4 2.2 1.7 1.5 3.3 3 5 4.5 0.6 0.5 1.2 1.1 1.8 1.6l4.5 3.9c0.4 0.4 0.9 0.7 1.3 1.1 2.1 1.8 4.1 3.5 6.2 5.2 0.1 0 0.1 0.1 0.2 0.1 24.8 20.3 51.9 37.8 80.5 51.9 31.2 15.3 63.7 26.5 97.1 33.6l1.1 0.3c27.8 5.8 56.4 8.7 85.5 8.7 56.2 0 110.8-11 162.2-32.7 49.6-20.9 94.2-50.9 132.5-89.1 3-3 7.1-4.3 11.3-3.8 2.4 0.3 6.9 1.6 9.7 6.4 17.1 29.4 41.7 54.1 71.1 71.4 30.3 17.8 64.9 27.2 100.2 27.2h0.9c21.5-0.1 40.3-12.5 48.8-32.3 8.6-20.3 4.8-42.5-10-58.3z m-619.8 59.4c-76.3-19.4-145.4-62.9-196.3-123.6-0.3-0.4-0.6-0.7-0.9-1.1-1.5-1.8-2.9-3.5-4.4-5.3 0 0 0-0.1-0.1-0.1-11.5-14.4-15.5-32.4-11.9-49.4 0.3-1.6 0.8-3.2 1.2-4.8s1-3.2 1.6-4.7c2.2-5.4 5.2-10.6 9-15.4 1.5-1.8 3-3.7 4.5-5.5 0.3-0.3 0.6-0.7 0.9-1 50.9-60.7 120.1-104.2 196.3-123.6 54.7 38.3 87.1 100.2 87.1 167.2 0.1 67.2-32.3 129.1-87 167.3z m593.1-17.3c-1.1 2.5-4.4 8.2-12.3 8.2h-0.8c-28.2 0-55.8-7.5-80-21.7-23.5-13.8-43.1-33.5-56.8-57-8.3-14.3-22.6-23.7-39.1-25.9-16.6-2.2-32.9 3.3-44.8 15.1-71.3 71-165.9 110.2-266.4 110.2-13.9 0-27.8-0.8-41.4-2.3 47.9-45.6 75.5-108.9 75.5-176.6s-27.6-131-75.5-176.6c13.7-1.5 27.5-2.3 41.4-2.3 100.5 0 195.2 39.1 266.4 110.2 11.8 11.8 28.1 17.3 44.8 15.1 16.5-2.2 30.8-11.6 39.1-25.9 13.7-23.5 33.3-43.2 56.8-57 24.1-14.2 51.8-21.7 80-21.7h0.7c7.9 0 11.2 5.7 12.3 8.2s3 8.9-2.5 14.8c-34.3 36.8-53.2 84.8-53.2 135.1s18.9 98.3 53.2 135.1c5.6 6.1 3.7 12.5 2.6 15z" :fill="fishing.overlap ? 'var(--el-color-warning)' : 'var(--el-border-color)'" />
                                <path d="M273 515.4m-30 0a30 30 0 1 0 60 0 30 30 0 1 0-60 0Z" :fill="fishing.overlap ? 'var(--el-color-warning)' : 'var(--el-border-color)'" />
                            </svg>
                        </div>
                        <div class="inner-container" ref="innerContainer">
                            <svg viewBox="0 0 1024 1024">
                                <path d="M893.456828 709.055005" :fill="fishing.overlap ? 'var(--el-color-warning)' : 'var(--el-border-color)'" />
                                <path d="M491.889987 337.939709" :fill="fishing.overlap ? 'var(--el-color-warning)' : 'var(--el-border-color)'" />
                                <path d="M568.154951 338.993714" :fill="fishing.overlap ? 'var(--el-color-warning)' : 'var(--el-border-color)'" />
                                <path d="M789.271978 570.404178c-10.123568-32.030507-33.907251-88.211041-88.099501-128.403438 59.974953 92.142583 39.444361 191.201693 16.587793 231.574193 19.583011-9.214872 48.428989-39.642882 48.428989-39.642882s5.043876 37.219693-1.590218 81.112366c-2.619664 2.876514-4.52199 6.466272-5.253654 10.576893-14.963807 83.60514-81.932034 172.931584-216.578664 172.931584-129.71634 0-226.874147-110.219287-226.874147-262.079974L315.892577 167.967526c0-1.240247 2.843768-2.440585 2.641153-3.623527 24.40483-7.115048 43.811832-29.649274 43.811832-56.31561 0-32.355919-25.581632-58.68968-57.93755-58.68968s-58.313104 26.332738-58.313104 58.68968c0 23.514553 11.484565 43.790342 31.504528 53.148477-0.724501 2.143826-3.66139 4.402263-3.66139 6.791683l0 468.503347c0 176.588881 114.748441 304.763099 269.192975 304.763099 130.210597 0 230.4066-78.81709 255.399831-201.286376 2.036379-0.156566 4.120854-0.963954 4.539386-2.777253C817.526485 674.573679 802.432719 618.005312 789.271978 570.404178zM305.160141 81.350796c14.71412 0 26.676569 11.962449 26.676569 26.676569s-11.962449 26.676569-26.676569 26.676569-26.676569-11.962449-26.676569-26.676569S290.446022 81.350796 305.160141 81.350796z" :fill="fishing.overlap ? 'var(--el-color-warning)' : 'var(--el-border-color)'" />
                            </svg>
                        </div>
                    </div>
                </div>
                <el-button @mousedown="startFishing" @mouseup="stopFishing" @mouseleave="stopFishing" @click="moveButton('click')" :disabled="fishing.disabled" class="button">
                    钓鱼<span class="shortcutKeys">({{ holdingId ? '松开' : '长按'}})</span>
                </el-button>
            </div>
        </el-drawer>
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
    // 怪物
    import monster from '@/plugins/monster';

    export default {
        data () {
            return {
                // 保存每个格子的数据
                grid: [],
                // 玩家数据
                player: {},
                // 玩家在X轴的位置
                playerX: 0,
                // 玩家在Y轴的位置
                playerY: 0,
                npcInfo: {},
                // 钓鱼相关
                fishing: {
                    // 分数
                    score: 0,
                    bottom: '0px',
                    // 是否重叠
                    overlap: false,
                    // 存储定时
                    timerIds: [],
                    // 剩余时间
                    timeLeft: 60,
                    // 游戏结束
                    gameOver: false,
                    // 禁用按钮
                    disabled: false,
                    // 时间结束
                    timeExpired: false,
                    // 进度
                    progressText: 0,
                    // 内部容器位置
                    innerPosition: 0,
                    // 向上移动的动画ID
                    moveUpAnimationId: '',
                    // 进度条百分比
                    progressPercentage: '0%',
                    // 向下移动的动画ID
                    moveDownAnimationId: '',
                    // 父容器的动画ID
                    moveParentContainerId: ''
                },
                npcShow: false,
                // 地图的大小
                gridSize: 50,
                giftShow: false,
                // NPC的数量
                npcCount: 10,
                // 是否正在长按
                holdingId: null,
                // 钓鱼点坐标
                fishingMap: [],
                // 钓鱼弹窗
                fishingShow: false,
                // 障碍物的数量
                obstacleCount: 0
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
            // 计算玩家附近是否有钓鱼点
            isFishing () {
                return this.nearbyIndices.some(index => this.grid[index]?.type === 'fishing');
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
            // 游戏数据
            const store = this.$store;
            // 玩家数据
            this.player = store.player;
            // 地图数据
            const mapData = store.mapData;
            if (mapData.map.length) {
                // 恢复地图数据
                this.grid = mapData.map;
                // 玩家所在Y轴
                this.playerY = mapData.y;
                // 玩家所在X轴
                this.playerX = mapData.x;
            } else {
                // 初始化地图数据
                this.initializeGrid();
            }
            // 恢复玩家滚动条位置
            if (store.mapScroll) this.$nextTick(() => this.updateScroll(store.mapScroll))
            // 添加键盘监听
            window.addEventListener('keydown', this.move);
        },
        beforeUnmount () {
            // 清空所有定时
            this.clearAllTiming();
            // 移除键盘监听
            window.removeEventListener('keydown', this.move);
        },
        methods: {
            // 回家
            goHome () {
                this.$router.push('/home');
                if (this.playerX !== 0 || this.playerY !== 0) {
                    this.$store.mapData = { y: 0, x: 0, map: [] };
                    // 重置所有钓鱼数据
                    this.resetFishingData(false);
                    // 重置玩家所在行
                    this.$store.setMapScroll(0);
                }
            },
            // 清空所有定时
            clearAllTiming () {
                this.fishing.timerIds.forEach(id => clearInterval(id));
            },
            // 初始化地图
            initializeGrid () {
                // 生成地图
                this.grid = Array(this.totalCells).fill().map(() => ({ his: '', type: 'empty' }));
                const safeZone = this.createSafeZone();
                // 障碍物的数量
                this.obstacleCount = Math.floor(this.totalCells * 0.1);
                // 生成障碍物
                this.generateItems('obstacle', this.obstacleCount, safeZone);
                // 确保障碍物生成不会堵塞路径
                this.ensurePathAvailability();
                // 生成钓鱼点
                this.generateItems('fishing', 10, safeZone);
                // 确保钓鱼点生成不会堵塞路径
                this.ensurePathAvailability();
                // 生成NPC
                this.generateNpcs(this.npcCount, safeZone);
                // 确保NPC生成不会堵塞路径
                this.ensurePathAvailability();
                // 更新玩家初始位置
                this.updatePlayerPosition();
            },
            // 创建一个安全区域，该区域是围绕玩家当前位置的 5x5 网格
            createSafeZone () {
                const safeZone = new Set();
                for (let y = this.playerY - 2; y <= this.playerY + 2; y++) {
                    for (let x = this.playerX - 2; x <= this.playerX + 2; x++) {
                        // 确保坐标在有效的网格范围内
                        if (y >= 0 && y < this.gridSize && x >= 0 && x < this.gridSize)
                            safeZone.add(y * this.gridSize + x); // 将坐标转换为一维索引并添加到安全区域集合中
                    }
                }
                // 返回安全区域集合
                return safeZone;
            },
            // 确保地图中有可用路径，如果没有则重新生成障碍物和 NPC
            ensurePathAvailability () {
                while (!this.isPathAvailable()) {
                    // 重新生成障碍物，排除在安全区域内的网格
                    this.generateItems('obstacle', this.obstacleCount, this.createSafeZone());
                    // 重新生成 NPC，排除在安全区域内的网格
                    this.generateNpcs(this.npcCount, this.createSafeZone());
                }
            },
            // 使用 A* 算法检查从起点到终点的路径是否可用
            isPathAvailable () {
                // 起点坐标
                const start = [this.playerY, this.playerX];
                // 终点坐标
                const end = [49, 49];
                // 四个方向的移动方式
                const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
                // 计算启发式函数（曼哈顿距离加上一个小权重）
                const heuristic = (a, b) => {
                    const d1 = Math.abs(a[0] - b[0]);
                    const d2 = Math.abs(a[1] - b[1]);
                    return d1 + d2 + 0.1 * Math.min(d1, d2);
                }
                // 初始化 A* 算法所需的数据结构
                const openSet = new MinHeap(); // 用于存储待检查的节点
                const cameFrom = new Map(); // 记录路径
                const gScore = new Map(); // 记录从起点到当前节点的实际代价
                const fScore = new Map(); // 记录从起点到终点的估算代价
                gScore.set(start.toString(), 0);
                fScore.set(start.toString(), heuristic(start, end));
                openSet.add(start, fScore.get(start.toString()));
                while (!openSet.isEmpty()) {
                    // 获取具有最低 f 值的节点
                    const current = openSet.poll();
                    // 如果当前节点是终点，则路径可用
                    if (current[0] === 49 && current[1] === 49) return true;
                    for (const [dy, dx] of directions) {
                        const newY = current[0] + dy;
                        const newX = current[1] + dx;
                        const neighbor = [newY, newX];
                        // 确保邻居节点在有效的网格范围内且为空
                        if (newY >= 0 && newY < this.gridSize && newX >= 0 && newX < this.gridSize &&
                            this.grid[newY * this.gridSize + newX].type === 'empty') {
                            const tentativeGScore = gScore.get(current.toString()) + 1;
                            // 如果找到更短的路径
                            if (!gScore.has(neighbor.toString()) || tentativeGScore < gScore.get(neighbor.toString())) {
                                cameFrom.set(neighbor.toString(), current);
                                gScore.set(neighbor.toString(), tentativeGScore);
                                const fScoreValue = tentativeGScore + heuristic(neighbor, end);
                                fScore.set(neighbor.toString(), fScoreValue);
                                openSet.add(neighbor, fScoreValue);
                            }
                        }
                    }
                }
                // 如果没有找到路径，则返回 false
                return false;
            },
            // 生成指定数量的障碍物，并确保生成后路径仍然可用
            generateItems (type, count, excludeSet) {
                // 将所有现有的障碍物转换为空
                this.grid.forEach(cell => {
                    if (cell.type === type) cell.type = 'empty';
                });
                let placed = 0;
                const arr = [];
                // 用来存储每个钓鱼点周围的5x5区域
                const restrictedZone = new Set();
                while (placed < count) {
                    const index = Math.floor(Math.random() * this.totalCells);
                    const arrIndex = Math.floor(Math.random() * 25);
                    // 检查是否新生成的位置在安全区域或禁区内，并且该格子为空
                    if (!excludeSet.has(index) && !restrictedZone.has(index) && this.grid[index].type === 'empty') {
                        this.grid[index].type = type;
                        placed++;
                        // 如果是钓鱼点，存储钓鱼点坐标，并生成其周围的5x5禁区
                        if (type === 'fishing') {
                            arr.push(index);
                            this.$store.setFishingMap(arr);
                            // 将钓鱼点周围的5x5区域添加到禁区
                            this.addToRestrictedZone(index, restrictedZone);
                        }
                        // 生成障碍物后立即检查路径是否可行
                        if (!this.isPathAvailable()) {
                            // 如果阻塞路径，回溯这个障碍物的生成
                            this.grid[index].type = 'empty';
                            placed--;
                        }
                    }
                }
            },
            // 生成指定数量的 NPC，并确保生成后路径仍然可用
            generateNpcs (count, excludeSet) {
                // 将所有现有的 NPC 转换为空
                this.grid.forEach(cell => {
                    if (cell.type === 'npc') cell.type = 'empty';
                });
                const npcs = this.player.npcs.length ? this.player.npcs : npc.npcNames();
                const isData = this.player.npcs.length;
                let arr = [];
                let placed = 0;
                while (placed < count) {
                    const index = Math.floor(Math.random() * this.totalCells);
                    // 确保新生成的 NPC 不在安全区域内且为空
                    if (!excludeSet.has(index) && this.grid[index].type === 'empty') {
                        const favorability = isData ? npcs[placed].favorability : 0;
                        const lightness = this.calculateLightness(favorability);
                        // 设置 NPC 的颜色
                        this.grid[index].his = `hsl(340, 82%, ${lightness}%, 1)`;
                        this.grid[index].type = 'npc';
                        const npcData = {
                            lv: 144,
                            name: isData ? npcs[placed].name : npcs[placed],
                            position: index,
                            favorability: favorability,
                            reincarnation: 10
                        };
                        arr.push(npcData);
                        this.player.npcs = arr;
                        placed++;
                        this.$store.setPlayer(this.player);
                        // 生成 NPC 后立即检查路径是否可行
                        if (!this.isPathAvailable()) {
                            // 如果阻塞路径，回溯这个 NPC 的生成
                            this.grid[index].type = 'empty';
                            placed--;
                        }
                    }
                }
            },
            // 将目标的5x5范围改为禁区
            addToRestrictedZone (index, restrictedZone) {
                const gridX = index % this.gridSize;
                const gridY = Math.floor(index / this.gridSize);
                // 遍历钓鱼点周围的5x5区域
                for (let y = gridY - 2; y <= gridY + 2; y++) {
                    for (let x = gridX - 2; x <= gridX + 2; x++) {
                        if (y >= 0 && y < this.gridSize && x >= 0 && x < this.gridSize) {
                            // 将坐标转换为一维索引并添加到禁区集合中
                            restrictedZone.add(y * this.gridSize + x);
                        }
                    }
                }
            },
            // 根据亲密度计算颜色亮度
            calculateLightness (favorability) {
                const maxFavorability = 1000;
                const minLightness = 50; // 最暗
                const maxLightness = 76; // 最亮
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
                    map: this.grid
                });
                // 20%概率遇怪
                const rand = this.isLucky(20);
                if (rand && playerIndex != 0) {
                    // 玩家境界
                    let level = this.player.level == 0 ? 1 : this.player.level;
                    // 怪物难度根据玩家最高境界 + 转生次数
                    const monsterLv = level * this.player.reincarnation + level;
                    // 添加怪物数据
                    this.$store.setMonster({
                        // 名称
                        name: monster.monster_Names(monsterLv),
                        // 气血
                        health: monster.monster_Health(monsterLv),
                        // 攻击
                        attack: monster.monster_Attack(monsterLv),
                        // 防御
                        defense: monster.monster_Defense(monsterLv),
                        // 闪避率
                        dodge: monster.monster_Criticalhitrate(monsterLv),
                        // 暴击
                        critical: monster.monster_Criticalhitrate(monsterLv)
                    });
                    // 跳转对战
                    this.$router.push('/explore');
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
                return ['obstacle', 'fishing', 'npc'].includes(this.grid[index]?.type);
            },
            // 根据方向移动玩家
            move (direction) {
                let newX = this.playerX;
                let newY = this.playerY;
                direction = typeof direction === 'string' ? direction : direction.key;
                switch (direction) {
                    case 'q':
                        this.goHome();
                        return;
                    case 'w':
                    case 'up':
                    case 'ArrowUp':
                        if (newY > 0) {
                            newY--;
                            this.goPlayerXY(newY, newX);
                        }
                        break;
                    case 's':
                    case 'down':
                    case 'ArrowDown':
                        if (newY < this.gridSize - 1) {
                            newY++;
                            this.goPlayerXY(newY, newX);
                        }
                        break;
                    case 'a':
                    case 'left':
                    case 'ArrowLeft':
                        if (newX > 0) {
                            newX--;
                            this.goPlayerXY(newY, newX);
                        }
                        break;
                    case 'd':
                    case 'right':
                    case 'ArrowRight':
                        if (newX < this.gridSize - 1) {
                            newX++;
                            this.goPlayerXY(newY, newX);
                        }
                        break;
                    case 'e':
                        if (!this.isNpc && !this.isFishing) return;
                        if (this.isNpc) this.talkToNpc();
                        else this.startGame();
                        return;
                    default:
                        return;
                }
            },
            goPlayerXY (newY, newX) {
                const newIndex = newY * this.gridSize + newX;
                // 仅在目标位置为空地时移动玩家
                if (this.grid[newIndex].type === 'empty') {
                    this.playerX = newX;
                    this.playerY = newY;
                }
                this.updatePlayerPosition();
            },
            // 滚动条自动滚动到玩家所在行
            updateScroll (playerIndex) {
                const playerCell = this.$refs[`cell-${playerIndex}`][0];
                if (playerCell) {
                    this.$store.setMapScroll(playerIndex);
                    playerCell.scrollIntoView({ block: 'center', inline: 'center', behavior: 'smooth' });
                }
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
            },
            // 钓鱼
            moveButton () {
                // 平滑向上移动
                this.smoothMoveUp();
                // 检查碰撞
                this.checkCollision();
            },
            // 启动长按上浮逻辑
            startFishing () {
                if (!this.holdingId) {
                    this.moveButton();
                    this.holdingId = setInterval(this.moveButton, 100);
                }
            },
            // 停止上浮并启动自动下滑
            stopFishing () {
                if (this.holdingId) {
                    clearInterval(this.holdingId);
                    this.holdingId = null;
                }
            },
            // 移动鱼的位置
            moveParentContainer () {
                if (!this.fishingShow) return;
                if (!this.$refs.movingContainer) return;
                // 移动速度
                const speed = 3000;
                // 最大Y轴移动范围
                const maxY = this.$refs.outerContainer.clientHeight - this.$refs.movingContainer.clientHeight;
                const move = () => {
                    // 如果时间已到，停止移动
                    if (this.fishing.timeExpired) {
                        // 清空所有定时
                        this.clearAllTiming();
                        return;
                    }
                    // 随机生成新的Y轴位置
                    const newY = Math.random() * maxY;
                    // 设置新的位置
                    this.$refs.movingContainer.style.transition = `top ${speed}ms ease`;
                    this.$refs.movingContainer.style.top = `${newY}px`;
                    // 在动画结束后调用下一次移动
                    setTimeout(() => {
                        if (!this.fishing.timeExpired) {
                            this.fishing.moveParentContainerId = requestAnimationFrame(move);
                        }
                    }, speed);
                }
                // 启动移动
                move();
            },
            // 鱼钩自动向下移动
            autoMoveDown () {
                const step = () => {
                    const outerHeight = this.$refs.outerContainer.clientHeight;
                    const innerHeight = this.$refs.innerContainer.clientHeight;
                    // 检查钓鱼的容器是否触底
                    if (this.fishing.innerPosition <= 0) {
                        // 如果触底且没有重叠，则扣除分数和进度
                        if (!this.fishing.overlap) {
                            this.fishing.score = Math.max(this.fishing.score - 0.2, 0);
                            this.updateProgressBar();
                        }
                    } else {
                        // 向下移动
                        this.fishing.innerPosition -= 1;
                        this.$refs.innerContainer.style.bottom = `${this.fishing.innerPosition}px`;
                        // 检查碰撞
                        this.checkCollision();
                    }
                    // 请求下一帧动画
                    this.fishing.moveDownAnimationId = requestAnimationFrame(step);
                }
                // 启动自动向下移动
                this.fishing.moveDownAnimationId = requestAnimationFrame(step);
            },
            // 平滑向上移动鱼钩的位置
            smoothMoveUp () {
                // 目标位置
                const targetPosition = Math.min(this.fishing.innerPosition + 10, this.$refs.outerContainer.clientHeight - this.$refs.innerContainer.clientHeight);
                const step = () => {
                    if (this.fishing.innerPosition < targetPosition) {
                        // 向上移动
                        this.fishing.innerPosition += 2;
                        this.$refs.innerContainer.style.bottom = `${this.fishing.innerPosition}px`;
                        // 请求下一帧动画
                        this.fishing.moveUpAnimationId = requestAnimationFrame(step);
                    }
                }
                // 启动平滑向上移动
                this.fishing.moveUpAnimationId = requestAnimationFrame(step);
            },
            // 检查碰撞
            checkCollision () {
                // 如果游戏结束或时间到，停止检查
                if (this.fishing.gameOver || this.fishing.timeExpired) return;
                // 获取钓鱼容器的矩形区域
                const movingRect = this.$refs.movingContainer.getBoundingClientRect();
                // 获取内部容器的矩形区域
                const innerRect = this.$refs.innerContainer.getBoundingClientRect();
                // 判断是否有重叠
                this.fishing.overlap = !(
                    movingRect.bottom < innerRect.top ||
                    movingRect.top > innerRect.bottom ||
                    movingRect.right < innerRect.left ||
                    movingRect.left > innerRect.right
                );
                // 更新分数
                this.fishing.score = this.fishing.overlap ? this.fishing.score += 0.1 : Math.max(this.fishing.score - 0.2, 0);
                // 更新进度条
                this.updateProgressBar(this.fishing.score);
            },
            // 更新进度条
            updateProgressBar () {
                // 最大分数
                const maxScore = 100;
                // 计算进度百分比
                const progressPercentage = Math.min((this.fishing.score / maxScore) * 100, 100);
                if (this.fishing.score >= maxScore && !this.fishing.gameOver) {
                    this.fishing.gameOver = true;
                    const fishInfo = this.getRandomFish();
                    this.$confirm(fishInfo.description, fishInfo.name, {
                        center: true,
                        showClose: false,
                        lockScroll: false,
                        showCancelButton: false,
                        closeOnClickModal: false,
                        confirmButtonText: '卖掉这条鱼'
                    }).then(() => {
                        // 结束游戏
                        this.endGame();
                        // 增加灵石数量
                        this.player.props.money += fishInfo.price;
                        this.$notifys({ title: '提示', message: `你获得了${fishInfo.price}灵石`, position: 'top-left' });
                    }).catch(() => { });
                }
                // 更新进度条文字
                this.fishing.progressText = Math.round(progressPercentage);
                // 更新进度条高度
                this.fishing.progressPercentage = `${progressPercentage}%`;
            },
            // 启动计时器
            startTimer () {
                const timer = setInterval(() => {
                    this.fishing.timeLeft--;
                    // 倒计时结束
                    if (this.fishing.timeLeft == 0) {
                        this.$confirm('钓鱼失败，鱼溜走了！', '提示', {
                            center: true,
                            lockScroll: false,
                            showCancelButton: false,
                            confirmButtonText: '确定',
                            dangerouslyUseHTMLString: true
                        }).then(() => {
                            // 结束游戏
                            this.endGame();
                        }).catch(() => {
                            // 结束游戏
                            this.endGame();
                        });
                    }
                }, 1000);
                this.fishing.timerIds.push(timer);
            },
            // 结束游戏
            endGame () {
                this.fishingShow = false;
                // 清空所有定时
                this.clearAllTiming();
                // 移除钓鱼点
                const index = this.$store.fishingMap.find(index => this.nearbyIndices.includes(index));
                this.grid[index].type = 'empty';
                // 结束所有动画
                cancelAnimationFrame(this.fishing.moveUpAnimationId);
                cancelAnimationFrame(this.fishing.moveDownAnimationId);
                cancelAnimationFrame(this.fishing.moveParentContainerId);
                // 重置钓鱼数据
                this.resetFishingData(true);
            },
            // 开始游戏
            startGame () {
                this.fishingShow = true;
                this.resetFishingData(false);
                this.$nextTick(() => this.moveParentContainer())
                this.autoMoveDown();
                this.startTimer();
            },
            // 重置所有钓鱼数据
            resetFishingData (bool) {
                // 分数
                this.fishing.score = 0;
                // 是否重叠
                this.fishing.overlap = false;
                // 剩余时间
                this.fishing.timeLeft = 60;
                // 游戏结束
                this.fishing.gameOver = bool;
                // 禁用按钮
                this.fishing.disabled = bool;
                // 时间结束
                this.fishing.timeExpired = bool;
                // 内部容器位置
                this.fishing.innerPosition = 0;
                if (!bool) {
                    // 进度
                    this.fishing.progressText = 0;
                    // 更新进度条高度
                    this.fishing.progressPercentage = '0%';
                }
            },
            // 产出钓到鱼的信息
            getRandomFish () {
                const random = Math.random();
                let cumulativeProbability = 0;
                const fishList = [
                    { name: '金鳞鲤鱼', price: 100, description: '金色鳞片的鲤鱼，象征着好运和财富。', probability: 0.25 },
                    { name: '青铜鲑鱼', price: 150, description: '体型健硕的鲑鱼，常出现在清凉的河流中。', probability: 0.2 },
                    { name: '冰川鳟鱼', price: 200, description: '来自寒冷冰川地区的鳟鱼，肉质鲜美。', probability: 0.18 },
                    { name: '红尾锦鲤', price: 300, description: '具有漂亮红色尾巴的锦鲤，观赏价值极高。', probability: 0.15 },
                    { name: '银鳍鲢鱼', price: 80, description: '常见于淡水湖泊，银色鳍片在水中闪闪发光。', probability: 0.3 },
                    { name: '巨口鲶鱼', price: 180, description: '以其巨大的嘴巴和强劲的咬力著称，肉质肥美。', probability: 0.17 },
                    { name: '幽蓝灯鱼', price: 250, description: '深海中发出幽蓝光芒的小型鱼类，具有神秘色彩。', probability: 0.14 },
                    { name: '翡翠剑鱼', price: 500, description: '剑形的鱼嘴和翡翠般的色彩让它成为海中战士。', probability: 0.08 },
                    { name: '斑点鲈鱼', price: 90, description: '遍布斑点的鲈鱼，适应力极强，分布广泛。', probability: 0.28 },
                    { name: '火焰红鱼', price: 400, description: '拥有火焰般红色鳞片的稀有鱼类，价格不菲。', probability: 0.1 },
                    { name: '雷电鳗鱼', price: 350, description: '全身带有微弱电流的鳗鱼，捕食时能够电击猎物。', probability: 0.12 },
                    { name: '黑甲鲨', price: 600, description: '身披黑色盔甲般鳞片的鲨鱼，充满攻击性。', probability: 0.06 },
                    { name: '水晶鲤鱼', price: 120, description: '鳞片透明的鲤鱼，在阳光下晶莹剔透。', probability: 0.22 },
                    { name: '紫鳍金枪鱼', price: 700, description: '金枪鱼中的顶级品种，因其紫色鳍而得名。', probability: 0.05 },
                    { name: '珍珠贝鱼', price: 220, description: '外形酷似贝壳的鱼类，藏有珍珠般的光泽。', probability: 0.16 },
                    { name: '蓝鲸鱼苗', price: 1000, description: '蓝鲸的幼年鱼苗，体积虽小但潜力巨大。', probability: 0.03 },
                    { name: '彩虹鳟鱼', price: 280, description: '彩虹般斑斓的鳟鱼，深受垂钓者喜爱。', probability: 0.13 },
                    { name: '毒针河豚', price: 150, description: '体型小但带有剧毒的河豚，需小心处理。', probability: 0.2 },
                    { name: '黄金海马', price: 500, description: '稀有的海马品种，金黄色的身体闪闪发光。', probability: 0.08 },
                    { name: '深海魔鱼', price: 800, description: '生活在深海中的巨大鱼类，外表极具威胁性。', probability: 0.04 }
                ];
                // 遍历鱼类列表，根据概率抽取鱼
                for (const fish of fishList) {
                    // 累加概率
                    cumulativeProbability += fish.probability;
                    if (random < cumulativeProbability) {
                        // 一旦随机数小于当前累加的概率，返回该鱼
                        return fish;
                    }
                }
                // 如果没有匹配到
                return null;
            }
        }
    };
    // 基于最小堆的优先队列实现
    class MinHeap {
        constructor() {
            // 初始化堆为空数组
            this.heap = [];
        }
        // 向堆中添加一个新节点
        add (node, priority) {
            // 将新节点和优先级添加到堆的末尾
            this.heap.push({ node, priority });
            // 将新节点上浮到正确的位置以维护堆的性质
            this.bubbleUp(this.heap.length - 1);
        }
        // 上浮操作，将节点移动到正确的位置以维护堆的性质
        bubbleUp (index) {
            // 当前节点的父节点索引
            while (index > 0) {
                const parentIndex = Math.floor((index - 1) / 2);
                // 如果父节点的优先级小于等于当前节点的优先级，则堆的性质已经满足
                if (this.heap[parentIndex].priority <= this.heap[index].priority) break;
                // 交换当前节点与父节点的位置
                [this.heap[parentIndex], this.heap[index]] = [this.heap[index], this.heap[parentIndex]];
                // 更新当前节点的索引为其父节点的索引
                index = parentIndex;
            }
        }
        // 移除并返回堆中的最小节点（即优先级最高的节点）
        poll () {
            // 堆顶的最小节点
            const min = this.heap[0];
            // 从堆中移除最后一个节点并保存
            const end = this.heap.pop();
            // 如果堆中还有其他节点，则将最后一个节点移动到堆顶并进行下沉操作
            if (this.heap.length > 0) {
                this.heap[0] = end;
                this.bubbleDown(0);
            }
            // 返回最小节点
            return min.node;
        }
        // 下沉操作，将节点移动到正确的位置以维护堆的性质
        bubbleDown (index) {
            const length = this.heap.length;
            const element = this.heap[index];
            while (true) {
                // 当前节点的左子节点和右子节点的索引
                let leftChildIndex = 2 * index + 1;
                let rightChildIndex = 2 * index + 2;
                let swapIndex = null;
                // 如果左子节点存在且其优先级小于当前节点的优先级，则选择左子节点进行交换
                if (leftChildIndex < length) {
                    if (this.heap[leftChildIndex].priority < element.priority) {
                        swapIndex = leftChildIndex;
                    }
                }
                // 如果右子节点存在且其优先级小于当前节点或左子节点的优先级，则选择右子节点进行交换
                if (rightChildIndex < length) {
                    if (
                        (swapIndex === null && this.heap[rightChildIndex].priority < element.priority) ||
                        (swapIndex !== null && this.heap[rightChildIndex].priority < this.heap[leftChildIndex].priority)
                    ) swapIndex = rightChildIndex;
                }
                // 如果没有需要交换的子节点，退出循环
                if (swapIndex === null) break;
                // 交换当前节点与选择的子节点的位置
                [this.heap[index], this.heap[swapIndex]] = [this.heap[swapIndex], this.heap[index]];
                // 更新当前节点的索引为交换后子节点的索引
                index = swapIndex;
            }
        }
        // 检查堆是否为空
        isEmpty () {
            return this.heap.length === 0;
        }
    }
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
        margin: 0 auto;
    }

    .grid-item {
        width: 12px;
        height: 12px;
        background-color: #ddd;
    }

    .player {
        background-color: var(--el-color-success);
    }

    .fishing {
        background-color: var(--el-color-primary);
    }

    .obstacle {
        background-color: var(--el-color-warning);
    }

    .npc {
        background-color: var(--el-color-pink-light);
    }

    .empty {
        background-color: var(--el-color-info-light-8);
    }

    .x-0.y-0 {
        border-top-left-radius: 2px;
    }

    .x-49.y-0 {
        border-top-right-radius: 2px;
    }

    .x-0.y-49 {
        border-bottom-left-radius: 2px;
    }

    .x-49.y-49 {
        border-bottom-right-radius: 2px;
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

    @media only screen and (max-width: 750px) {
        .legend {
            flex-wrap: wrap;
        }

        .legend-item {
            width: 33.333%;
            margin: 10px 0 0 0;
            justify-content: center;
        }
    }

    .color-box {
        width: 12px;
        height: 12px;
        margin-right: 5px;
        border-radius: 2px;
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

    /* 钓鱼 */
    .game-container {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .time {
        font-size: 15px;
        margin-bottom: 10px;
    }

    .outer-wrapper {
        display: flex;
        align-items: center;
    }

    .progress-bar-container {
        width: 40px;
        height: 400px;
        margin-right: 10px;
        border: 2px solid var(--el-border-color);
        border-radius: 5px;
        position: relative;
        overflow: hidden;
    }

    .progress-bar {
        width: 100%;
        height: 0%;
        background-color: var(--el-color-success);
        position: absolute;
        bottom: 0;
        transition: height 0.3s ease;
        display: flex;
        justify-content: center;
        align-items: flex-end;
    }

    .progress-text {
        color: var(--el-text-color-primary);
        font-size: 13px;
        font-weight: bold;
        padding-bottom: 5px;
        position: relative;
        top: 50%;
        bottom: 0;
        text-align: center;
        transform: translateY(-50%);
    }

    .outer-container {
        width: 50px;
        height: 400px;
        position: relative;
        overflow: hidden;
        border: 2px solid var(--el-text-color-primary);
        border-radius: 5px;
    }

    .moving-container {
        width: 50px;
        height: 50px;
        /* background-color: lightblue; */
        position: absolute;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
    }

    .moving-container svg {
        width: 36px;
        height: 36px;
    }

    .inner-container {
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        transition: bottom 0.1s ease;
    }

    .inner-container svg {
        width: 36px;
        height: 36px;
        transform: scaleX(-1);
    }

    .button {
        margin-top: 10px;
        padding: 10px 20px;
        font-size: 16px;
        width: 100%;
    }

    /* 移动按钮 */
    .shortcutKeys {
        color: rgba(169, 169, 169, 0.4);
        margin-left: 2px;
    }

    @media only screen and (max-width: 750px) {
        .shortcutKeys {
            display: none;
        }
    }
</style>

<style>
    /* 钓鱼动画 */
    @keyframes wobble {
        0% {
            transform: translateX(-50%) rotate(0);
        }

        25% {
            transform: translateX(-50%) rotate(-5deg);
        }

        50% {
            transform: translateX(-50%) rotate(0);
        }

        75% {
            transform: translateX(-50%) rotate(5deg);
        }

        100% {
            transform: translateX(-50%) rotate(0);
        }
    }
</style>