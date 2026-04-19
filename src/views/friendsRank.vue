<template>
  <div class="rank-container">
    <div class="rank-header">
      <el-button 
        type="primary" 
        text 
        @click="goBack"
        class="back-btn"
      >
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
      <h1 class="title">好友修仙榜</h1>
    </div>

    <div class="top-three">
      <div class="rank-item rank-second">
        <div class="rank-badge badge-silver">
          <span>2</span>
        </div>
        <el-avatar 
          :size="60" 
          :src="topList[1]?.avatar || defaultAvatar"
          class="avatar"
        />
        <p class="name">{{ topList[1]?.daoName || '虚位以待' }}</p>
        <p class="level">{{ topList[1]?.levelName || '-' }}</p>
        <p class="score">{{ topList[1]?.scoreText || '0' }}</p>
      </div>

      <div class="rank-item rank-first">
        <div class="rank-badge badge-gold">
          <el-icon><Crown /></el-icon>
        </div>
        <el-avatar 
          :size="70" 
          :src="topList[0]?.avatar || defaultAvatar"
          class="avatar"
        />
        <p class="name">{{ topList[0]?.daoName || '虚位以待' }}</p>
        <p class="level">{{ topList[0]?.levelName || '-' }}</p>
        <p class="score">{{ topList[0]?.scoreText || '0' }}</p>
      </div>

      <div class="rank-item rank-third">
        <div class="rank-badge badge-bronze">
          <span>3</span>
        </div>
        <el-avatar 
          :size="60" 
          :src="topList[2]?.avatar || defaultAvatar"
          class="avatar"
        />
        <p class="name">{{ topList[2]?.daoName || '虚位以待' }}</p>
        <p class="level">{{ topList[2]?.levelName || '-' }}</p>
        <p class="score">{{ topList[2]?.scoreText || '0' }}</p>
      </div>
    </div>

    <div class="my-rank" v-if="myRankInfo">
      <div class="rank-number my-rank-num">
        {{ myRankInfo.rank }}
      </div>
      <el-avatar 
        :size="50" 
        :src="myRankInfo.avatar || defaultAvatar"
        class="avatar"
      />
      <div class="info">
        <p class="name">
          {{ myRankInfo.daoName }}
          <el-tag type="primary" size="small" effect="plain">我</el-tag>
        </p>
        <p class="level">{{ myRankInfo.levelName }}</p>
      </div>
      <div class="score-section">
        <p class="score-label">总体实力</p>
        <p class="score">{{ myRankInfo.scoreText }}</p>
      </div>
    </div>

    <el-divider>排行榜</el-divider>

    <div 
      class="rank-list" 
      ref="listRef"
      @scroll="handleScroll"
    >
      <div 
        v-for="(item, index) in rankList" 
        :key="`${item.uid}-${index}`"
        class="rank-list-item"
        :class="{ 'is-me': item.isMe }"
      >
        <div class="rank-number" :class="getRankClass(item.rank)">
          <span v-if="item.rank <= 3">
            <el-icon v-if="item.rank === 1"><Crown /></el-icon>
            <span v-else>{{ item.rank }}</span>
          </span>
          <span v-else>{{ item.rank }}</span>
        </div>
        <el-avatar 
          :size="50" 
          :src="item.avatar || defaultAvatar"
          class="avatar"
        />
        <div class="info">
          <p class="name">
            {{ item.daoName }}
            <el-tag v-if="item.isMe" type="primary" size="small" effect="plain">我</el-tag>
          </p>
          <p class="level">{{ item.levelName }}</p>
        </div>
        <div class="score-section">
          <p class="score-label">总体实力</p>
          <p class="score">{{ item.scoreText }}</p>
        </div>
      </div>

      <div v-if="loading" class="loading-section">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>加载中...</span>
      </div>

      <div v-if="!hasMore && rankList.length > 0" class="no-more">
        <el-divider>已加载全部</el-divider>
      </div>

      <div v-if="rankList.length === 0 && !loading" class="empty-section">
        <el-empty description="暂无好友数据" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMainStore } from '@/plugins/store'
import { levelNames, formatNumberToChineseUnit } from '@/plugins/game'

const router = useRouter()
const store = useMainStore()

const listRef = ref(null)
const loading = ref(false)
const hasMore = ref(true)
const currentPage = ref(0)
const pageSize = ref(10)

const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

const daoNames = [
  '青云真人', '紫霞仙子', '凌霄道长', '玄天尊者', '玉虚真人',
  '太玄仙子', '无极道长', '清虚真人', '赤霞仙子', '丹霞真人',
  '青云子', '紫霞道人', '凌霄仙子', '玄天大帝', '玉虚子',
  '太玄真人', '无极仙子', '清虚道长', '赤霞真人', '丹霞仙子',
  '玄机子', '天璇真人', '天玑道长', '天权仙子', '玉衡真人',
  '开阳子', '摇光真人', '天枢道长', '天璇仙子', '天玑真人'
]

const avatars = [
  'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
  'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
  'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png',
  'https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png'
]

const baseFriendData = ref([])
const rankList = ref([])

const generateFriendData = () => {
  const data = []
  for (let i = 0; i < 50; i++) {
    const level = Math.floor(Math.random() * 20)
    const score = Math.floor(Math.random() * 10000000) + 1000
    data.push({
      uid: `FRIEND_${String(i + 1).padStart(6, '0')}`,
      daoName: daoNames[i % daoNames.length] + (i > daoNames.length ? `(${Math.floor(i / daoNames.length) + 1})` : ''),
      avatar: avatars[i % avatars.length],
      level: level,
      levelName: levelNames(level),
      score: score,
      scoreText: formatNumberToChineseUnit(score),
      rank: i + 1,
      isMe: false
    })
  }
  
  const user = store.user
  const player = store.player
  
  const myData = {
    uid: user.uid || 'MY_UID',
    daoName: user.daoName || player.name || '我',
    avatar: user.avatar || defaultAvatar,
    level: player.level,
    levelName: levelNames(player.level),
    score: player.score,
    scoreText: formatNumberToChineseUnit(player.score),
    rank: 0,
    isMe: true
  }
  
  const insertIndex = data.findIndex(item => item.score < myData.score)
  if (insertIndex === -1) {
    data.push(myData)
    myData.rank = data.length
  } else {
    data.splice(insertIndex, 0, myData)
    for (let i = insertIndex; i < data.length; i++) {
      data[i].rank = i + 1
    }
  }
  
  return data
}

const topList = computed(() => {
  return baseFriendData.value.slice(0, 3)
})

const myRankInfo = computed(() => {
  return baseFriendData.value.find(item => item.isMe)
})

const getRankClass = (rank) => {
  if (rank === 1) return 'rank-1'
  if (rank === 2) return 'rank-2'
  if (rank === 3) return 'rank-3'
  return ''
}

const goBack = () => {
  router.back()
}

const loadMoreData = () => {
  if (loading.value || !hasMore.value) return
  
  loading.value = true
  
  setTimeout(() => {
    const start = currentPage.value * pageSize.value
    const end = start + pageSize.value
    
    const baseData = baseFriendData.value
    const newData = []
    
    for (let i = start; i < end && i < baseData.length; i++) {
      const item = { ...baseData[i] }
      item.rank = i + 1
      newData.push(item)
    }
    
    if (newData.length > 0) {
      rankList.value = [...rankList.value, ...newData]
      currentPage.value++
      
      if (currentPage.value * pageSize.value >= baseData.length) {
        hasMore.value = false
      }
    } else {
      hasMore.value = false
    }
    
    loading.value = false
  }, 1000)
}

const handleScroll = (e) => {
  const target = e.target
  const scrollTop = target.scrollTop
  const scrollHeight = target.scrollHeight
  const clientHeight = target.clientHeight
  
  if (scrollTop + clientHeight >= scrollHeight - 50) {
    loadMoreData()
  }
}

onMounted(() => {
  baseFriendData.value = generateFriendData()
  loadMoreData()
})

onUnmounted(() => {
  // 清理
})
</script>

<style scoped>
.rank-container {
  min-height: 80vh;
  padding: 20px;
}

.rank-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.back-btn {
  margin-right: 20px;
  font-size: 16px;
}

.title {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.top-three {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  margin-bottom: 30px;
  padding: 20px 0;
}

.rank-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  position: relative;
}

.rank-first {
  order: 2;
  z-index: 2;
}

.rank-second {
  order: 1;
  margin-right: -20px;
}

.rank-third {
  order: 3;
  margin-left: -20px;
}

.rank-badge {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 18px;
  color: #fff;
  margin-bottom: 10px;
  position: relative;
  z-index: 1;
}

.badge-gold {
  background: linear-gradient(135deg, #ffd700 0%, #ffb347 100%);
  box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4);
}

.badge-silver {
  background: linear-gradient(135deg, #c0c0c0 0%, #a8a8a8 100%);
  box-shadow: 0 4px 15px rgba(192, 192, 192, 0.4);
}

.badge-bronze {
  background: linear-gradient(135deg, #cd7f32 0%, #b87333 100%);
  box-shadow: 0 4px 15px rgba(205, 127, 50, 0.4);
}

.rank-first .rank-badge {
  width: 50px;
  height: 50px;
  font-size: 24px;
}

.rank-item .avatar {
  border: 3px solid var(--el-border-color);
}

.rank-first .avatar {
  border-color: #ffd700;
}

.rank-item .name {
  margin: 10px 0 5px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.rank-item .level {
  margin: 0 0 5px 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.rank-item .score {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-color-primary);
}

.my-rank {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.1) 0%, rgba(102, 126, 234, 0.1) 100%);
  border-radius: 12px;
  margin-bottom: 20px;
  border: 1px solid var(--el-color-primary-light-8);
}

.my-rank .rank-number {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 16px;
  background: var(--el-color-primary);
  color: #fff;
  margin-right: 16px;
}

.my-rank .info {
  flex: 1;
  margin-left: 12px;
}

.my-rank .name {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.my-rank .level {
  margin: 0;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.my-rank .score-section {
  text-align: right;
}

.my-rank .score-label {
  margin: 0 0 4px 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.my-rank .score {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--el-color-primary);
}

.rank-list {
  max-height: 500px;
  overflow-y: auto;
  padding-right: 10px;
}

.rank-list-item {
  display: flex;
  align-items: center;
  padding: 16px 12px;
  background: var(--el-bg-color);
  border-radius: 8px;
  margin-bottom: 10px;
  transition: all 0.2s ease;
}

.rank-list-item:hover {
  background: var(--el-fill-color-light);
}

.rank-list-item.is-me {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(102, 126, 234, 0.05) 100%);
  border: 1px solid var(--el-color-primary-light-8);
}

.rank-list-item .rank-number {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-light);
  margin-right: 12px;
}

.rank-list-item .rank-number.rank-1 {
  background: linear-gradient(135deg, #ffd700 0%, #ffb347 100%);
  color: #fff;
}

.rank-list-item .rank-number.rank-2 {
  background: linear-gradient(135deg, #c0c0c0 0%, #a8a8a8 100%);
  color: #fff;
}

.rank-list-item .rank-number.rank-3 {
  background: linear-gradient(135deg, #cd7f32 0%, #b87333 100%);
  color: #fff;
}

.rank-list-item .info {
  flex: 1;
  margin-left: 12px;
}

.rank-list-item .name {
  margin: 0 0 4px 0;
  font-size: 15px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.rank-list-item .level {
  margin: 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.rank-list-item .score-section {
  text-align: right;
}

.rank-list-item .score-label {
  margin: 0 0 4px 0;
  font-size: 11px;
  color: var(--el-text-color-secondary);
}

.rank-list-item .score {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-color-primary);
}

.loading-section {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.loading-section .el-icon {
  margin-right: 8px;
}

.no-more {
  padding: 10px 0;
  color: var(--el-text-color-secondary);
}

.empty-section {
  padding: 40px 0;
}

@media (max-width: 768px) {
  .top-three {
    flex-direction: column;
    align-items: center;
  }
  
  .rank-item {
    order: 0 !important;
    margin: 10px 0 !important;
  }
  
  .rank-first {
    order: 0;
  }
  
  .rank-list {
    max-height: 400px;
  }
}
</style>
