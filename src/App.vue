<template>
    <div class="game-container-wrapper" draggable="true">
        <div class="github-corner">
            <a href="https://github.com/setube/vue-XiuXianGame" target="_blank" aria-label="View source on GitHub">
                <svg width="80" height="80" viewBox="0 0 250 250" style="fill:#151513; color:#fff; position: absolute; top: 0; border: 0; right: 0; z-index: 2;" aria-hidden="true">
                    <path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z" />
                    <path d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2" fill="currentColor" style="transform-origin: 130px 106px;" />
                    <path d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z" fill="currentColor" />
                </svg>
            </a>
        </div>
        <div class="game-container">
            <router-view />
            <div class="bbh">
                当前游戏版本{{ version }}
            </div>
        </div>
        <div class="wm_bg_1" />
        <div class="wm_bg_2" />
    </div>
</template>

<script>

    export default {
        data () {
            return {
                version: 0.740
            };
        },
        mounted () {
        },
        methods: {
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

    .bbh {
        color: #ccc;
        font-size: 15px;
        text-align: center;
        position: absolute;
        bottom: -40px;
        left: 0;
        right: 0;
    }

    .game-container-wrapper {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 90vh;
        -webkit-user-drag: none
    }

    .github-corner {
        position: fixed;
        top: 0;
        right: 0;
        z-index: 10;
    }

    .game-container {
        min-width: 770px;
        max-width: 770px;
        min-height: 740px;
        margin: 0 auto;
        padding: 20px;
        background-color: rgba(255, 255, 255, 0.5);
        border-radius: 10px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        text-align: center;
        position: relative;
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

    @media only screen and (max-width: 750px) {
        .game-container {
            min-height: 574px;
            min-width: 356px;
        }
    }
</style>

<style>
    body {
        background: #fff;
    }

    a {
        text-decoration: none;
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
        background-color: #f1e3f5 !important;
        border-color: #d4adf7 !important;
        color: #8560f5 !important;
    }

    .el-tag.el-tag--purple .el-tag__close {
        color: #8560f5 !important;
    }

    .el-tag.el-tag--purple .el-tag__close:hover {
        color: #FFF !important;
        background-color: #8560f5 !important;
    }

    /* 增加粉色装备配色 */
    .el-tag--pink {
        background-color: #fce4ec !important;
        border-color: #f8bbd0 !important;
        color: #f48fb1 !important;
    }

    .el-tag.el-tag--pink .el-tag__close {
        color: #f48fb1 !important;
    }

    .el-tag.el-tag--pink .el-tag__close:hover {
        color: #FFF !important;
        background-color: #f48fb1 !important;
    }

    .el-button--pink {
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
    }

    .attribute .pet {
        border-color: transparent !important;
        background-color: transparent !important;
    }

    /* 按钮 */
    .actions {
        margin: 1rem 0;
    }

    /* 日志 */
    .storyText {
        display: flex;
        justify-content: center;
    }

    .storyText-box {
        height: 650px;
        overflow: auto;
    }

    @media only screen and (max-width: 750px) {

        .el-message-box,
        .el-notification {
            width: 300px !important;
        }

        .el-upload {
            display: inline !important;
        }

        .levels .el-drawer.ltr {
            width: 50% !important;
        }

        .strengthen .el-drawer.rtl {
            width: 70% !important;
        }

        .el-dialog {
            width: 70% !important;
        }

        /* 按钮 */
        .actions {
            display: flex;
            flex-direction: column;
            justify-content: center;
        }

        .actions * {
            margin-top: 10px !important;
        }

        .actions *:nth-child(1) {
            margin-left: 10px;
        }

        /* 日志 */
        .storyText-box {
            height: 600px;
        }

        .el-popup-parent--hidden {
            padding-right: 0 !important;
        }
    }
</style>