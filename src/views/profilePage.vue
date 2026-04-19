<template>
  <div class="profile-container">
    <div class="profile-header">
      <el-button 
        type="primary" 
        text 
        @click="goBack"
        class="back-btn"
      >
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
      <h1 class="title">修士信息</h1>
    </div>

    <div class="profile-content">
      <div class="avatar-section">
        <el-avatar 
          :size="100" 
          :src="user.avatar || defaultAvatar"
          class="main-avatar"
        />
        <div class="avatar-info">
          <h2 class="dao-name">{{ user.daoName || '无名修士' }}</h2>
          <p class="login-status">
            <el-tag :type="user.isLoggedIn ? 'success' : 'info'" size="small">
              {{ user.isLoggedIn ? '已登录' : '游客模式' }}
            </el-tag>
          </p>
        </div>
      </div>

      <el-divider>基本仙籍</el-divider>

      <el-form 
        :model="editForm" 
        :rules="formRules"
        ref="formRef"
        label-position="left"
        label-width="100px"
        class="info-form"
      >
        <el-form-item label="道名" prop="daoName">
          <el-input 
            v-model="editForm.daoName" 
            placeholder="请输入您的道名"
            :disabled="!isEditing"
            clearable
          />
          <span class="form-tip">道名是您在修仙界的称号</span>
        </el-form-item>

        <el-form-item label="道号">
          <el-input 
            v-model="editForm.nickname" 
            placeholder="请输入您的道号"
            :disabled="!isEditing"
            clearable
          />
          <span class="form-tip">道号是您的别称，如\"青云真人\"</span>
        </el-form-item>

        <el-form-item label="仙讯">
          <el-input 
            v-model="editForm.phone" 
            placeholder="未绑定仙讯"
            disabled
          />
          <span class="form-tip">仙讯用于接收修仙界重要通知</span>
        </el-form-item>

        <el-form-item label="仙籍编号">
          <el-input 
            :value="user.uid || '待分配'" 
            disabled
          />
          <span class="form-tip">仙籍编号是您在修仙界的唯一标识</span>
        </el-form-item>

        <el-form-item label="登录时间">
          <el-input 
            :value="loginTimeText" 
            disabled
          />
        </el-form-item>
      </el-form>

      <el-divider>修仙成就</el-divider>

      <div class="achievements-section">
        <div class="achievement-item">
          <div class="achievement-icon">
            <el-icon :size="30"><Trophy /></el-icon>
          </div>
          <div class="achievement-info">
            <p class="achievement-title">当前境界</p>
            <p class="achievement-value">{{ levelName }}</p>
          </div>
        </div>
        <div class="achievement-item">
          <div class="achievement-icon">
            <el-icon :size="30"><TrendCharts /></el-icon>
          </div>
          <div class="achievement-info">
            <p class="achievement-title">总体实力</p>
            <p class="achievement-value">{{ formatNumber(player.score) }}</p>
          </div>
        </div>
        <div class="achievement-item">
          <div class="achievement-icon">
            <el-icon :size="30"><Coin /></el-icon>
          </div>
          <div class="achievement-info">
            <p class="achievement-title">修仙年龄</p>
            <p class="achievement-value">{{ player.age }}岁</p>
          </div>
        </div>
      </div>

      <div class="action-section">
        <el-button 
          v-if="!isEditing"
          type="primary" 
          size="large"
          @click="startEdit"
        >
          编辑信息
        </el-button>
        <template v-else>
          <el-button 
            type="primary" 
            size="large"
            :loading="isSaving"
            @click="saveProfile"
          >
            保存修改
          </el-button>
          <el-button 
            size="large"
            @click="cancelEdit"
          >
            取消
          </el-button>
        </template>
      </div>

      <div class="logout-section" v-if="user.isLoggedIn">
        <el-button 
          type="danger" 
          text
          @click="handleLogout"
        >
          退出登录
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMainStore } from '@/plugins/store'
import { ElMessage, ElMessageBox } from 'element-plus'
import { maxLv, levelNames, formatNumberToChineseUnit } from '@/plugins/game'

const router = useRouter()
const store = useMainStore()

const formRef = ref(null)
const isEditing = ref(false)
const isSaving = ref(false)

const user = computed(() => store.user)
const player = computed(() => store.player)

const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

const editForm = reactive({
  daoName: '',
  nickname: ''
})

const formRules = {
  daoName: [
    { required: true, message: '请输入道名', trigger: 'blur' },
    { min: 2, max: 10, message: '道名长度在 2 到 10 个字符', trigger: 'blur' }
  ]
}

const levelName = computed(() => {
  return levelNames(player.value.level)
})

const loginTimeText = computed(() => {
  if (!user.value.loginTime) return '未登录'
  const date = new Date(user.value.loginTime)
  return date.toLocaleString('zh-CN')
})

const formatNumber = (num) => {
  return formatNumberToChineseUnit(num)
}

const goBack = () => {
  router.back()
}

const startEdit = () => {
  editForm.daoName = user.value.daoName || ''
  editForm.nickname = user.value.nickname || ''
  isEditing.value = true
}

const cancelEdit = () => {
  isEditing.value = false
  editForm.daoName = ''
  editForm.nickname = ''
}

const saveProfile = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate((valid) => {
    if (valid) {
      isSaving.value = true
      
      setTimeout(() => {
        store.user.daoName = editForm.daoName
        store.user.nickname = editForm.nickname
        store.player.name = editForm.daoName
        
        isSaving.value = false
        isEditing.value = false
        
        ElMessage({
          message: '仙籍信息更新成功！',
          type: 'success'
        })
      }, 500)
    }
  })
}

const handleLogout = () => {
  ElMessageBox.confirm(
    '确定要退出登录吗？您的游戏进度将保留。',
    '退出登录',
    {
      confirmButtonText: '确定退出',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    store.user = {
      isLoggedIn: false,
      daoName: '无名修士',
      phone: '',
      uid: '',
      avatar: '',
      nickname: '',
      openid: '',
      loginTime: null
    }
    
    ElMessage({
      type: 'success',
      message: '已退出登录'
    })
    
    router.push('/login')
  }).catch(() => {
    // 用户取消
  })
}

onMounted(() => {
  // 初始化表单数据
})
</script>

<style scoped>
.profile-container {
  min-height: 80vh;
  padding: 20px;
}

.profile-header {
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

.profile-content {
  max-width: 600px;
  margin: 0 auto;
  padding: 30px;
  background: var(--el-bg-color);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.avatar-section {
  display: flex;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  margin-bottom: 20px;
}

.main-avatar {
  border: 4px solid rgba(255, 255, 255, 0.3);
}

.avatar-info {
  margin-left: 20px;
}

.dao-name {
  margin: 0 0 10px 0;
  font-size: 24px;
  font-weight: 600;
  color: #fff;
}

.login-status {
  margin: 0;
}

.info-form {
  margin-top: 20px;
}

.form-tip {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.achievements-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 20px;
}

.achievement-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: var(--el-fill-color-light);
  border-radius: 8px;
}

.achievement-icon {
  margin-right: 12px;
  color: var(--el-color-primary);
}

.achievement-info {
  flex: 1;
}

.achievement-title {
  margin: 0 0 4px 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.achievement-value {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.action-section {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 30px;
}

.logout-section {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--el-border-color-lighter);
}

@media (max-width: 768px) {
  .profile-content {
    padding: 20px;
  }
  
  .avatar-section {
    flex-direction: column;
    text-align: center;
  }
  
  .avatar-info {
    margin-left: 0;
    margin-top: 16px;
  }
  
  .achievements-section {
    grid-template-columns: 1fr;
  }
  
  .action-section {
    flex-direction: column;
  }
}
</style>
