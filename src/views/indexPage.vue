<template>
  <div class="index">
    <div class="index2">
      <div class="welcome-section">
        <h1 class="game-title">修仙世界</h1>
        <p class="game-subtitle">踏入修仙界，开启你的长生之路</p>
      </div>
      
      <div class="login-section">
        <el-button class="button primary-btn" type="primary" size="large" @click="goLogin">
          <el-icon><Connection /></el-icon>
          微信登录
        </el-button>
        
        <div class="divider">
          <span>或者</span>
        </div>
        
        <el-button class="button guest-btn" size="large" @click="goHome">
          <el-icon><User /></el-icon>
          游客模式进入
        </el-button>
      </div>
      
      <el-button class="button policy-btn" text @click="dialogVisible = true">
        查看隐私政策
      </el-button>
    </div>
    
    <el-dialog v-model="dialogVisible" :lock-scroll="false" title="隐私政策" width="420px">
      <div class="custom-html md-stream-desktop">
        <p>
          我们非常重视您的隐私，并致力于保护您的个人信息。鉴于我的文字修仙全靠刷是一款完全离线的单机游戏，我们特此明确声明：
        </p>
        <el-collapse v-model="activeName" accordion>
          <el-collapse-item name="1">
            <template #title>
              <div class="custom-title">无数据收集</div>
            </template>
            <p>
              游戏设计为无需网络连接即可运行的单机游戏。因此，我们不会通过任何方式收集、存储、传输或使用您的个人信息，包括但不限于您的姓名、联系方式、地理位置、设备信息或游戏内行为数据。
            </p>
          </el-collapse-item>
          <el-collapse-item name="2">
            <template #title>
              <div class="custom-title">无第三方数据共享</div>
            </template>
            <p>
              由于游戏不收集任何个人信息，我们自然也不会将任何数据分享给第三方机构或个人。我们承诺尊重并保护您的隐私权益，确保您的游戏体验不受任何不必要的干扰。
            </p>
          </el-collapse-item>
          <el-collapse-item name="3">
            <template #title>
              <div class="custom-title">本地存储</div>
            </template>
            <p>
              虽然游戏可能需要在您的设备上存储一些必要的游戏文件（如存档、设置等），但这些数据仅用于游戏的正常运行，且完全存储在您的本地设备上。我们不会将这些数据上传至服务器或用于除游戏运行以外的任何目的。
            </p>
          </el-collapse-item>
          <el-collapse-item name="4">
            <template #title>
              <div class="custom-title">隐私权保护</div>
            </template>
            <p>
              我们理解隐私权对于每位玩家都至关重要。因此，我们承诺将持续关注并遵守所有适用的隐私保护法律法规，不断改进和优化我们的隐私保护措施。
            </p>
          </el-collapse-item>
          <el-collapse-item name="5">
            <template #title>
              <div class="custom-title">政策更新</div>
            </template>
            <p>
              虽然游戏的离线特性意味着我们的隐私政策不太可能发生重大变化，但我们仍保留根据法律法规变化或游戏技术更新对隐私政策进行修订的权利。任何政策更新都将在此页面上公布，并注明生效日期。
            </p>
          </el-collapse-item>
          <el-divider>结语</el-divider>
          <p>感谢您游玩本游戏！我们承诺将继续努力，为您带来安全、愉快的游戏体验。</p>
        </el-collapse>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">关 闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
  import { ref, onMounted, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { useMainStore } from '@/plugins/store'
  import { ElNotification } from 'element-plus'

  const router = useRouter()
  const local = useMainStore()
  const player = ref({})
  const user = ref({})
  const activeName = ref('')
  const dialogVisible = ref(false)

  const goLogin = () => {
    router.push('/login')
  }

  const goHome = () => {
    router.push('/home')
  }

  onMounted(() => {
    if (local) {
      player.value = local.player
      user.value = local.user
      
      player.value.zc = player.value.zc ? player.value.zc : true
      
      if (user.value.isLoggedIn) {
        router.push('/home')
        return
      }
      
      if (location.host != 'appassets.androidplatform.net' && player.value.zc) {
        return
      }
    }
  })
</script>
<style scoped>
  .index {
    position: relative;
    min-height: 574px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .index2 {
    width: 100%;
    max-width: 400px;
    padding: 40px 30px;
    text-align: center;
  }

  .welcome-section {
    margin-bottom: 40px;
  }

  .game-title {
    margin: 0 0 10px 0;
    font-size: 36px;
    font-weight: 700;
    color: var(--el-color-primary);
    text-shadow: 2px 2px 4px rgba(64, 158, 255, 0.3);
  }

  .game-subtitle {
    margin: 0;
    font-size: 16px;
    color: var(--el-text-color-secondary);
  }

  .login-section {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .login-section .button {
    width: 100%;
    height: 48px;
    font-size: 16px;
    border-radius: 8px;
  }

  .login-section .primary-btn {
    margin-bottom: 0;
  }

  .divider {
    display: flex;
    align-items: center;
    width: 100%;
    margin: 20px 0;
  }

  .divider::before,
  .divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background-color: var(--el-border-color-lighter);
  }

  .divider span {
    padding: 0 15px;
    font-size: 14px;
    color: var(--el-text-color-secondary);
  }

  .policy-btn {
    margin-top: 30px;
    font-size: 14px;
  }

  @media only screen and (max-width: 768px) {
    .index2 {
      padding: 30px 20px;
    }

    .game-title {
      font-size: 28px;
    }

    .game-subtitle {
      font-size: 14px;
    }
  }
</style>
