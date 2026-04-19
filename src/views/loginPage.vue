<template>
  <div class="login-container">
    <div class="login-box">
      <h1 class="title">微信扫码登录</h1>
      <div class="qr-section">
        <div class="qr-container">
          <img 
            :src="qrImageUrl" 
            alt="微信登录二维码"
            class="qr-image"
          />
          <div class="qr-overlay">
            <el-icon class="refresh-icon" @click="refreshQrCode"><Refresh /></el-icon>
          </div>
        </div>
        <p class="qr-tip">请使用微信扫描二维码登录</p>
        <p class="qr-subtip">模拟环境：点击下方按钮模拟扫码成功</p>
      </div>
      
      <div class="mock-login-section">
        <el-button 
          type="primary" 
          size="large" 
          :loading="isLogging"
          @click="mockWechatLogin"
          class="mock-btn"
        >
          模拟扫码登录
        </el-button>
      </div>

      <div class="visitor-section">
        <el-button 
          type="info" 
          size="default"
          text
          @click="visitorLogin"
        >
          游客模式进入
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMainStore } from '@/plugins/store'
import { ElNotification } from 'element-plus'

const router = useRouter()
const store = useMainStore()

const qrTimestamp = ref(Date.now())
const isLogging = ref(false)

const qrImageUrl = computed(() => {
  const content = encodeURIComponent(`weixin://xiuxian/login?t=${qrTimestamp.value}`)
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${content}&color=1296db`
})

const refreshQrCode = () => {
  qrTimestamp.value = Date.now()
}

const mockWechatLogin = () => {
  isLogging.value = true
  
  setTimeout(() => {
    const mockUserInfo = {
      isLoggedIn: true,
      daoName: '青云真人',
      phone: '138****8888',
      uid: 'WX_' + Math.random().toString(36).substring(2, 10).toUpperCase(),
      avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
      nickname: '修仙小能手',
      openid: 'oA5x_' + Math.random().toString(36).substring(2, 20),
      loginTime: new Date().getTime()
    }
    
    store.user = { ...store.user, ...mockUserInfo }
    store.player.name = mockUserInfo.daoName
    
    ElNotification({
      title: '登录成功',
      message: `欢迎回来，${mockUserInfo.daoName}！`,
      type: 'success'
    })
    
    isLogging.value = false
    router.push('/home')
  }, 1000)
}

const visitorLogin = () => {
  router.push('/home')
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 20px;
}

.login-box {
  width: 100%;
  max-width: 400px;
  padding: 40px;
  background: var(--el-bg-color);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.title {
  margin: 0 0 30px 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.qr-section {
  margin-bottom: 30px;
}

.qr-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 16px;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
  position: relative;
  overflow: hidden;
}

.qr-image {
  width: 200px;
  height: 200px;
  display: block;
}

.qr-overlay {
  position: absolute;
  bottom: 10px;
  right: 10px;
}

.refresh-icon {
  font-size: 20px;
  color: var(--el-color-primary);
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  padding: 6px;
}

.refresh-icon:hover {
  color: var(--el-color-primary-dark-2);
  transform: rotate(180deg);
}

.qr-tip {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: var(--el-text-color-regular);
}

.qr-subtip {
  margin: 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.mock-login-section {
  margin-bottom: 20px;
}

.mock-btn {
  width: 100%;
  height: 44px;
  font-size: 16px;
  border-radius: 8px;
}

.visitor-section {
  padding-top: 20px;
  border-top: 1px solid var(--el-border-color-lighter);
}
</style>
