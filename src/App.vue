<template>
    <div class="game-container-wrapper"
        draggable="true">
        <div :class="['game-container', { dark: player.dark }]">
            <router-view v-slot="{ Component }">
                <keep-alive v-if="$route.meta.keepAlive">
                    <component :is="Component"
                        :key="key" />
                </keep-alive>
                <component v-if="!$route.meta.keepAlive"
                    :is="Component"
                    :key="key" />
            </router-view>
            <div class="footer">
                <el-switch size="large"
                    v-model="player.dark">
                    <template #active-action>
                        <i class="el-icon">
                            <svg viewBox="0 0 24 24"
                                class="dark-icon">
                                <path
                                    d="M11.01 3.05C6.51 3.54 3 7.36 3 12a9 9 0 0 0 9 9c4.63 0 8.45-3.5 8.95-8c.09-.79-.78-1.42-1.54-.95A5.403 5.403 0 0 1 11.1 7.5c0-1.06.31-2.06.84-2.89c.45-.67-.04-1.63-.93-1.56z"
                                    fill="currentColor"></path>
                            </svg>
                        </i>
                    </template>
                    <template #inactive-action>
                        <i class="el-icon">
                            <svg viewBox="0 0 24 24"
                                class="light-icon">
                                <path
                                    d="M6.05 4.14l-.39-.39a.993.993 0 0 0-1.4 0l-.01.01a.984.984 0 0 0 0 1.4l.39.39c.39.39 1.01.39 1.4 0l.01-.01a.984.984 0 0 0 0-1.4zM3.01 10.5H1.99c-.55 0-.99.44-.99.99v.01c0 .55.44.99.99.99H3c.56.01 1-.43 1-.98v-.01c0-.56-.44-1-.99-1zm9-9.95H12c-.56 0-1 .44-1 .99v.96c0 .55.44.99.99.99H12c.56.01 1-.43 1-.98v-.97c0-.55-.44-.99-.99-.99zm7.74 3.21c-.39-.39-1.02-.39-1.41-.01l-.39.39a.984.984 0 0 0 0 1.4l.01.01c.39.39 1.02.39 1.4 0l.39-.39a.984.984 0 0 0 0-1.4zm-1.81 15.1l.39.39a.996.996 0 1 0 1.41-1.41l-.39-.39a.993.993 0 0 0-1.4 0c-.4.4-.4 1.02-.01 1.41zM20 11.49v.01c0 .55.44.99.99.99H22c.55 0 .99-.44.99-.99v-.01c0-.55-.44-.99-.99-.99h-1.01c-.55 0-.99.44-.99.99zM12 5.5c-3.31 0-6 2.69-6 6s2.69 6 6 6s6-2.69 6-6s-2.69-6-6-6zm-.01 16.95H12c.55 0 .99-.44.99-.99v-.96c0-.55-.44-.99-.99-.99h-.01c-.55 0-.99.44-.99.99v.96c0 .55.44.99.99.99zm-7.74-3.21c.39.39 1.02.39 1.41 0l.39-.39a.993.993 0 0 0 0-1.4l-.01-.01a.996.996 0 0 0-1.41 0l-.39.39c-.38.4-.38 1.02.01 1.41z"
                                    fill="currentColor"></path>
                            </svg>
                        </i>
                    </template>
                </el-switch>
            </div>
        </div>
        <div class="wm_bg_1"
            v-if="!player.dark" />
        <div class="wm_bg_2"
            v-if="!player.dark" />
    </div>
</template>

<script>
export default {
    data() {
        return {
            timer: null,
            player: {},
        };
    },
    watch: {
        'player.dark'(val) {
            document.querySelector('html').classList = val ? 'dark' : '';
        }
    },
    computed: {
        key() {
            return this.$route.path;
        }
    },
    mounted() {
        // 玩家数据
        this.player = this.$store.player;
        // 每分钟增加1岁
        this.timer = setInterval(() => {
            this.player.age++
        }, 60 * 1000);
        // 如果有脚本的话, 执行脚本内容
        if (this.player.script) new Function(this.player.script)();
    }
};
</script>

<style scoped>
.story {
    padding: 0 30px;
}

.boss-box .desc {
    margin: 10px 0;
}

.game-container-wrapper {
    display: flex;
    position: relative;
    justify-content: center;
    align-items: center;
    min-height: 90vh;
    -webkit-user-drag: none
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
    transition: all .3s ease-out;
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

@media only screen and (max-width: 750px) {
    .game-container {
        min-height: 574px;
        min-width: 356px;
    }
}
</style>

<style>
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
    --el-box-shadow: 0px 12px 32px 4px rgba(0, 0, 0, .36), 0px 8px 20px rgba(0, 0, 0, .72);
    --el-box-shadow-light: 0px 0px 12px rgba(0, 0, 0, .72);
    --el-box-shadow-lighter: 0px 0px 6px rgba(0, 0, 0, .72);
    --el-box-shadow-dark: 0px 16px 48px 16px rgba(0, 0, 0, .72), 0px 12px 32px #000000, 0px 8px 16px -8px #000000;
    --el-bg-color-page: #0a0a0a;
    --el-bg-color: #141414;
    --el-bg-color-overlay: #1d1e1f;
    --el-text-color-primary: #E5EAF3;
    --el-text-color-regular: #CFD3DC;
    --el-text-color-secondary: #A3A6AD;
    --el-text-color-placeholder: #8D9095;
    --el-text-color-disabled: #6C6E72;
    --el-border-color-darker: #636466;
    --el-border-color-dark: #58585B;
    --el-border-color: #4C4D4F;
    --el-border-color-light: #414243;
    --el-border-color-lighter: #363637;
    --el-border-color-extra-light: #2B2B2C;
    --el-fill-color-darker: #424243;
    --el-fill-color-dark: #39393A;
    --el-fill-color: #303030;
    --el-fill-color-light: #262727;
    --el-fill-color-lighter: #1D1D1D;
    --el-fill-color-extra-light: #191919;
    --el-fill-color-blank: transparent;
    --el-mask-color: rgba(0, 0, 0, .8);
    --el-mask-color-extra-light: rgba(0, 0, 0, .3);
}

.dark .el-switch.is-checked .el-switch__core {
    background-color: #2c2c2c;
    border-color: #4C4D4F;
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
        background-color: rgba(0, 0, 0, .2);
        border-radius: 5px;
        opacity: .3
    }

    ::-webkit-scrollbar-thumb:hover {
        background-color: rgba(0, 0, 0, .3);
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
    color: #FFF !important;
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
    color: #FFF !important;
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
    color: var(--el-color-danger)
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

@media only screen and (max-width: 750px) {

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
