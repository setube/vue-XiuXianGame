<template>
  <div class="game-container-wrapper" draggable="true">
    <div :class="['game-container', { dark: player.dark }]">
      <div class="header" v-if="showHeader">
        <div class="header-left">
          <span class="game-title">修仙世界</span>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleDropdownCommand" trigger="click">
            <div class="user-info">
              <el-avatar 
                :size="40" 
                :src="user.avatar || defaultAvatar"
                class="avatar"
              >
                <el-icon v-if="!user.avatar"><User /></el-icon>
              </el-avatar>
              <div class="user-text" v-if="user.isLoggedIn">
                <span class="dao-name">{{ user.daoName || '无名修士' }}</span>
                <span class="login-status">
                  <el-tag :type="'success'" size="small" effect="plain">已登录</el-tag>
                </span>
              </div>
              <div class="user-text" v-else>
                <span class="dao-name">游客</span>
                <span class="login-status">
                  <el-tag :type="'info'" size="small" effect="plain">未登录</el-tag>
                </span>
              </div>
              <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>
                  <span>个人信息</span>
                </el-dropdown-item>
                <el-dropdown-item command="friendsRank">
                  <el-icon><Trophy /></el-icon>
                  <span>好友排行榜</span>
                </el-dropdown-item>
                <el-dropdown-item divided v-if="user.isLoggedIn" command="logout">
                  <el-icon><SwitchButton /></el-icon>
                  <span>退出登录</span>
                </el-dropdown-item>
                <el-dropdown-item divided v-else command="login">
                  <el-icon><Connection /></el-icon>
                  <span>微信登录</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      
      <router-view v-slot="{ Component }">
        <keep-alive v-if="route.meta.keepAlive">
          <component :is="Component" :key="key" />
        </keep-alive>
        <component v-if="!route.meta.keepAlive" :is="Component" :key="key" />
      </router-view>
      <div class="footer">
        <el-switch size="large" v-model="player.dark">
          <template #active-action>
            <i class="el-icon">
              <svg viewBox="0 0 24 24" class="dark-icon">
                <path
                  d="M11.01 3.05C6.51 3.54 3 7.36 3 12a9 9 0 0 0 9 9c4.63 0 8.45-3.5 8.95-8c.09-.79-.78-1.42-1.54-.95A5.403 5.403 0 0 1 11.1 7.5c0-1.06.31-2.06.84-2.89c.45-.67-.04-1.63-.93-1.56z"
                  fill="currentColor"
                />
              </svg>
            </i>
          </template>
          <template #inactive-action>
            <i class="el-icon">
              <svg viewBox="0 0 24 24" class="light-icon">
                <path
                  d="M6.05 4.14l-.39-.39a.993.993 0 0 0-1.4 0l-.01.01a.984 0 0 0 0 1.4l.39.39c.39.39 1.01.39 1.4 0l.01-.01a.984 0 0 0 0-1.4zM3.01 10.5H1.99c-.55 0-.99.44-.99.99v.01c0 .55.44.99.99.99H3c.56.01 1-.43 1-.98v-.01c0-.56-.44-1-.99-1zm9-9.95H12c-.56 0-1 .44-1 .99v.96c0 .55.44.99.99.99H12c.56.01 1-.43 1-.98v-.97c0-.55-.44-.99-.99-.99zm7.74 3.21c-.39-.39-1.02-.39-1.41-.01l-.39.39a.984 0 0 0 0 1.4l.01.01c.39.39 1.02.39 1.4 0l.39-.39a.984 0 0 0 0-1.4zm-1.81 15.1l.39.39a.996 0 1 0 1.41-1.41l-.39-.39a.993 0 0 0-1.4 0c-.4.4-.4 1.02-.01 1.41zM20 11.49v.01c0 .55.44.99.99.99H22c.55 0 .99-.44.99-.99v-.01c0-.55-.44-.99-.99-.99h-1.01c-.55 0-.99.44-.99.99zM12 5.5c-3.31 0-6 2.69-6 6s2.69 6 6 6s6-2.69 6-6s-2.69-6-6-6zm-.01 16.95H12c.55 0 .99-.44.99-.99v-.96c0-.55-.44-.99-.99-.99h-.01c-.55 0-.99.44-.99.99v.96c0 .55.44.99.99.99zm-7.74-3.21c.39.39 1.02.39 1.41 0l-.39-.39a.993 0 0 0 0-1.4l-.01-.01a.996 0 0 0-1.41 0l-.39.39c-.38.4-.38 1.02.01 1.41z"
                  fill="currentColor"
                />
              </svg>
            </i>
          </template>
        </el-switch>
      </div>
    </div>
    <div class="wm_bg_1" v-if="!player.dark" />
    <div class="wm_bg_2" v-if="!player.dark" />
  </div>
</template>

<script setup>
  import { useRoute, useRouter } from 'vue-router'
  import { ref, watch, computed, onMounted } from 'vue'
  import { useMainStore } from './plugins/store'
  import { ElMessageBox } from 'element-plus'

  const router = useRouter()
  const store = useMainStore()
  const player = computed(() => store.player)
  const user = computed(() => store.user)
  const route = useRoute()
  const key = computed(() => route.path)
  
  const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

  const showHeader = computed(() => {
    return !['login'].includes(route.name)
  })

  const handleDropdownCommand = (command) => {
    switch (command) {
      case 'profile':
        router.push('/profile')
        break
      case 'friendsRank':
        router.push('/friends-rank')
        break
      case 'login':
        router.push('/login')
        break
      case 'logout':
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
        }).catch(() => {
          // 用户取消
        })
        break
    }
  }

  watch(
    () => player.value.dark,
    val => {
      document.querySelector('html').classList = val ? 'dark' : ''
    }
  )

  onMounted(() => {
    setInterval(() => {
      store.player.age += 1
      store.player.time = new Date().getTime()
    }, 60000)
    
    if (store.player.script) new Function(store.player.script)()
  })
</script>

<style scoped>
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px;
    margin-bottom: 10px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  .header-left .game-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--el-color-primary);
  }

  .header-right {
    display: flex;
    align-items: center;
  }

  .user-info {
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 5px 10px;
    border-radius: 8px;
    transition: background-color 0.2s ease;
  }

  .user-info:hover {
    background-color: var(--el-fill-color-light);
  }

  .user-info .avatar {
    border: 2px solid var(--el-color-primary-light-7);
  }

  .user-text {
    display: flex;
    flex-direction: column;
    margin-left: 12px;
    text-align: left;
  }

  .user-text .dao-name {
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    line-height: 1.2;
  }

  .user-text .login-status {
    margin-top: 4px;
    line-height: 1;
  }

  .dropdown-icon {
    margin-left: 8px;
    color: var(--el-text-color-secondary);
    font-size: 12px;
  }

  .story {
    padding: 0 30px;
  }

  .boss-box .desc {
    margin: 10px 0;
  }

  .game-container-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 90vh;
    -webkit-user-drag: none;
  }

  .game-container {
    min-width: 770px;
    max-width: 770px;
    min-height: 740px;
    margin: 0 auto;
    padding: 20px;
    background-color: rgba(255, 255, 255, 0.5);
    text-align: center;
    position: relative;
  }

  .game-container.dark {
    background-color: #141414;
  }

  @media only screen and (min-width: 800px) {
    .game-box {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 80%;
    }
  }

  .wm_bg_1,
  .wm_bg_2 {
    position: fixed;
    top: 0;
    left: 0;
    z-index: -1;
    width: 100%;
    height: 100%;
    background-size: 100% auto;
    transition: all 0.3s ease-out;
  }

  .wm_bg_1 {
    background: url(@/assets/wm_bg_1.png) top;
  }

  .wm_bg_2 {
    background: url(@/assets/wm_bg_2.png) top;
  }

  .el-icon svg {
    height: 1em;
    width: 1em;
  }

  .light-icon {
    color: #606266;
  }

  .dark-icon {
    border-radius: 50%;
    color: #cfd3dc;
    background-color: #141414;
  }

  @media only screen and (max-width: 768px) {
    .game-container {
      min-height: 574px;
      min-width: 356px;
    }
  }
</style>

<style>
  * {
    user-select: none;
  }

  html {
    background: #fff;
    overflow: auto;
    --el-color-pink-light: #f48fb1;
    --el-color-pink-light-8: #f8bbd0;
    --el-color-pink-light-9: #fce4ec;
    --el-color-purple-light: #8560f5;
    --el-color-purple-light-8: #d4adf7;
    --el-color-purple-light-9: #f1e3f5;
  }

  html.dark {
    color-scheme: dark;
    background: #141414;
    --el-color-pink-light-8: #5a3c47;
    --el-color-pink-light-9: #3c2a2e;
    --el-color-purple-light-8: #473b5a;
    --el-color-purple-light-9: #2d2636;
    --el-color-primary: #409eff;
    --el-color-primary-light-3: #3375b9;
    --el-color-primary-light-5: #2a598a;
    --el-color-primary-light-7: #213d5b;
    --el-color-primary-light-8: #1d3043;
    --el-color-primary-light-9: #18222c;
    --el-color-primary-dark-2: #66b1ff;
    --el-color-success: #67c23a;
    --el-color-success-light-3: #4e8e2f;
    --el-color-success-light-5: #3e6b27;
    --el-color-success-light-7: #2d481f;
    --el-color-success-light-8: #25371c;
    --el-color-success-light-9: #1c2518;
    --el-color-success-dark-2: #85ce61;
    --el-color-warning: #e6a23c;
    --el-color-warning-light-3: #a77730;
    --el-color-warning-light-5: #7d5b28;
    --el-color-warning-light-7: #533f20;
    --el-color-warning-light-8: #3e301c;
    --el-color-warning-light-9: #292218;
    --el-color-warning-dark-2: #ebb563;
    --el-color-danger: #f56c6c;
    --el-color-danger-light-3: #b25252;
    --el-color-danger-light-5: #854040;
    --el-color-danger-light-7: #582e2e;
    --el-color-danger-light-8: #412626;
    --el-color-danger-light-9: #2b1d1d;
    --el-color-danger-dark-2: #f78989;
    --el-color-error: #f56c6c;
    --el-color-error-light-3: #b25252;
    --el-color-error-light-5: #854040;
    --el-color-error-light-7: #582e2e;
    --el-color-error-light-8: #412626;
    --el-color-error-light-9: #2b1d1d;
    --el-color-error-dark-2: #f78989;
    --el-color-info: #909399;
    --el-color-info-light-3: #6b6d71;
    --el-color-info-light-5: #525457;
    --el-color-info-light-7: #393a3c;
    --el-color-info-light-8: #2d2d2f;
    --el-color-info-light-9: #202121;
    --el-color-info-dark-2: #a6a9ad;
    --el-box-shadow: 0px 12px 32px 4px rgba(0, 0, 0, 0.36), 0px 8px 20px rgba(0, 0, 0, 0.72);
    --el-box-shadow-light: 0px 0px 12px rgba(0, 0, 0, 0.72);
    --el-box-shadow-lighter: 0px 0px 6px rgba(0, 0, 0, 0.72);
    --el-box-shadow-dark: 0px 16px 48px 16px rgba(0, 0, 0, 0.72), 0px 12px 32px #000000, 0px 8px 16px -8px #000000;
    --el-bg-color-page: #0a0a0a;
    --el-bg-color: #141414;
    --el-bg-color-overlay: #1d1e1f;
    --el-text-color-primary: #e5eaf3;
    --el-text-color-regular: #cfd3dc;
    --el-text-color-secondary: #a3a6ad;
    --el-text-color-placeholder: #8d9095;
    --el-text-color-disabled: #6c6e72;
    --el-border-color-darker: #636466;
    --el-border-color-dark: #58585b;
    --el-border-color: #4c4d4f;
    --el-border-color-light: #414243;
    --el-border-color-lighter: #363637;
    --el-border-color-extra-light: #2b2b2c;
    --el-fill-color-darker: #424243;
    --el-fill-color-dark: #39393a;
    --el-fill-color: #303030;
    --el-fill-color-light: #262727;
    --el-fill-color-lighter: #1d1d1d;
    --el-fill-color-extra-light: #191919;
    --el-fill-color-blank: transparent;
    --el-mask-color: rgba(0, 0, 0, 0.8);
    --el-mask-color-extra-light: rgba(0, 0, 0, 0.3);
  }

  .dark .el-switch.is-checked .el-switch__core {
    background-color: #2c2c2c;
    border-color: #4c4d4f;
  }

  a {
    text-decoration: none;
  }

  @media only screen and (min-width: 800px) {
    /* 自定义滚动条 */
    ::-webkit-scrollbar {
      width: 6px;
    }

    /* ::-webkit-scrollbar-track { */
    /* background: #f1f1f1; */
    /* border-radius: 4px; */
    /* } */

    ::-webkit-scrollbar-thumb {
      background-color: rgba(0, 0, 0, 0.2);
      border-radius: 5px;
      opacity: 0.3;
    }

    ::-webkit-scrollbar-thumb:hover {
      background-color: rgba(0, 0, 0, 0.3);
    }
  }

  .attributes {
    display: flex;
    justify-content: center;
  }

  .tag {
    height: 32px;
    padding: 0 10px;
    line-height: 30px;
    font-size: 12px;
    border-width: 1px;
    border-style: solid;
    border-radius: 4px;
    border: var(--el-border);
    box-sizing: border-box;
    white-space: nowrap;
    display: inline-block;
  }

  .el-icon {
    vertical-align: middle;
  }

  .monsterinfo {
    display: flex;
    justify-content: center;
  }

  .monsterinfo-box {
    display: flex;
    flex-direction: column;
  }

  .monsterinfo p {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin: 0;
  }

  .monsterinfo p:first-child {
    justify-content: flex-start;
  }

  .el-tabs__nav-wrap {
    display: flex;
    justify-content: center;
  }

  /* 增加紫色装备配色 */
  .el-tag--purple {
    --el-tag-bg-color: var(--el-color-purple-light-9) !important;
    --el-tag-border-color: var(--el-color-purple-light-8) !important;
    --el-tag-text-color: var(--el-color-purple-light) !important;
  }

  .el-tag.el-tag--purple .el-tag__close {
    --el-tag-text-color: var(--el-color-purple-light) !important;
  }

  .el-tag.el-tag--purple .el-tag__close:hover {
    color: #fff !important;
    background-color: var(--el-color-purple-light) !important;
  }

  /* 增加粉色装备配色 */
  .el-tag--pink {
    --el-tag-bg-color: var(--el-color-pink-light-9) !important;
    --el-tag-border-color: var(--el-color-pink-light-8) !important;
    --el-tag-text-color: var(--el-color-pink-light) !important;
  }

  .el-tag.el-tag--pink .el-tag__close {
    --el-tag-text-color: var(--el-color-pink-light) !important;
  }

  .el-tag.el-tag--pink .el-tag__close:hover {
    color: #fff !important;
    background-color: var(--el-color-pink-light) !important;
  }

  /* .el-button--pink {
        color: #FFF !important;
        background-color: #FF82AB !important;
        border-color: #FF82AB !important;
    }

    .el-button--pink:focus,
    .el-button--pink:hover {
        background-color: #ff82abd4 !important;
        border-color: #ff82abd4 !important;
        color: #FFF !important;
    }

    .el-button--pink.is-disabled {
        background-color: #ff82ab8f !important;
        border-color: #ff82ab00 !important;
    } */

  .attribute .pet {
    border-color: transparent !important;
    background-color: transparent !important;
  }

  /* 折叠 */
  .custom-title {
    width: 100%;
  }

  /* 按钮 */
  .actions {
    margin: 1rem 0;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
  }

  .actions .action {
    width: calc(33.333% - 10px);
    margin: 5px;
  }

  .actions .action .item {
    width: 100%;
  }

  .textColor {
    color: var(--el-color-danger);
  }

  /* 日志 */
  .storyText {
    display: flex;
    justify-content: center;
  }

  .storyText-box {
    height: 650px;
    overflow: auto;
    padding: 0 20px 0 0;
  }

  .el-popover__title {
    text-align: center;
  }

  @media only screen and (max-width: 768px) {
    .el-message-box,
    .el-notification {
      width: 300px !important;
    }

    .el-upload {
      display: inline !important;
    }

    .levels.el-drawer.ltr {
      width: 70% !important;
    }

    .el-dialog,
    .strengthen.el-drawer.rtl {
      width: 80% !important;
    }

    .actions .action {
      width: calc(50% - 10px);
      margin: 5px;
    }

    /* .actions * {
            margin-top: 10px !important;
        }

        .actions *:nth-child(1) {
            margin-left: 10px;
        } */

    /* 日志 */
    .storyText-box {
      height: 600px;
    }

    .el-popup-parent--hidden {
      padding-right: 0 !important;
    }
  }
</style>
