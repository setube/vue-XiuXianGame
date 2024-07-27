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
            <div class="game-box">
                <i class="setting el-icon-setting" @click="show = !show" />
                <div class="Illustrations" v-if="isIllustrations">
                    <div class="story">
                        <p>装备图鉴</p>
                    </div>
                    <div class="tag inventory-box">
                        <el-tabs v-model="illustrationsActive" :stretch="true">
                            <el-tab-pane :label="i.name" :name="i.type" v-for="(i, k) in illustrationsItems" :key="k">
                                <div class="inventory-content">
                                    <template v-for="(item, index) in i.data">
                                        <div class="Illustration-item" v-if="item.type == i.type" :key="index" @click="illustrationsInfo(k, index)">
                                            <el-tag :type="item.quality">
                                                {{ item.name }}
                                            </el-tag>
                                        </div>
                                    </template>
                                </div>
                            </el-tab-pane>
                        </el-tabs>
                    </div>
                    <div class="actions">
                        <el-button :type="action.type ? action.type : ''" v-for="(action, index) in actions" :key="index" @click="action.handler">
                            {{ action.text }}
                        </el-button>
                    </div>
                </div>
                <div v-else>
                    <div class="boss" v-if="isBoss">
                        <div class="boss-box">
                            <span class="el-tag el-tag--warning" @click="openBossInfo">{{ boss.name }}</span>
                            <el-alert class="desc" :title="boss.desc" :closable="false" type="error" />
                        </div>
                    </div>
                    <div class="story">
                        <p v-html="storyText" v-if="ismonster" @click="openMonsterInfo" />
                        <p v-else-if="isequipment" @click="openEquipmentInfo" v-html="storyText" />
                        <p v-else v-html="storyText" />
                    </div>
                    <div class="attributes">
                        <div class="attribute-box">
                            <div class="tag attribute" @click="isLevel = true">
                                境界: {{ levelNames[player.level] }} ({{ player.reincarnation || 0 }}转)
                            </div>
                            <div class="tag attribute" v-if="player.level >= this.maxLv">
                                修为: 登峰造极
                            </div>
                            <div class="tag attribute" v-else @click="notify({title: '修为提示', message: `您距离${levelNames[player.level + 1]}境界还需${formatNumberToChineseUnit(player.maxCultivation - player.cultivation)}点修为`})">
                                修为: {{ calculatePercentageDifference(player.maxCultivation, player.cultivation).toFixed(2) }}%
                            </div>
                            <div class="tag attribute">
                                气血: {{ formatNumberToChineseUnit(player.health) }} / {{ formatNumberToChineseUnit(player.maxHealth) }}
                                <i class="el-icon-circle-plus-outline" v-if="player.points > 0" @click="attributePoints('health')" />
                            </div>
                            <div class="tag attribute">
                                攻击: {{ formatNumberToChineseUnit(player.attack) }}
                                <i class="el-icon-circle-plus-outline" v-if="player.points > 0" @click="attributePoints('attack')" />
                            </div>
                            <div class="tag attribute">
                                防御: {{ formatNumberToChineseUnit(player.defense) }}
                                <i class="el-icon-circle-plus-outline" v-if="player.points > 0" @click="attributePoints('defense')" />
                            </div>
                            <div class="tag attribute">
                                闪避率: {{ player.dodge > 0 ? (player.dodge * 100).toFixed(2) : 0 }}%
                            </div>
                            <div class="tag attribute">
                                暴击率: {{ player.critical > 0 ? (player.critical * 100).toFixed(2) : 0 }}%
                            </div>
                            <div class="tag attribute" @click="notify({title: '获得方式', message: '可以通过击败世界Boss后获得'})">
                                鸿蒙石: {{ formatNumberToChineseUnit(player.currency) }}
                            </div>
                            <div class="tag attribute" @click="notify({title: '获得方式', message: '可以通过出售装备可获得'})">
                                炼器石: {{ formatNumberToChineseUnit(player.strengtheningStone) }}
                            </div>
                            <div class="tag attribute" @click="notify({title: '获得方式', message: '可以通过探索秘境可获得'})">
                                培养丹: {{ formatNumberToChineseUnit(player.cultivateDan) }}
                            </div>
                        </div>
                    </div>
                    <div class="equip-box">
                        <div class="tag equip-item">
                            <span class="equip">
                                <span>神兵: </span>
                                <el-tag v-if="player.equipment.weapon?.name" :type="player.equipment.weapon?.quality" :closable="player.equipment.weapon?.name ? true : false" @close="equipmentClose('weapon')" @click="equipmentInfo('weapon')">
                                    {{ player.equipment.weapon?.name }}{{ player.equipment.weapon?.strengthen ? '+' + player.equipment.weapon?.strengthen : '' }}
                                </el-tag>
                                <span v-else>无</span>
                            </span>
                            <span class="equip">
                                <span>护甲: </span>
                                <el-tag v-if="player.equipment.armor?.name" :type="player.equipment.armor?.quality" :closable="player.equipment.armor?.name ? true : false" @close="equipmentClose('armor')" @click="equipmentInfo('armor')">
                                    {{ player.equipment.armor?.name }}{{ player.equipment.armor?.strengthen ? '+' + player.equipment.armor?.strengthen : '' }}
                                </el-tag>
                                <span v-else>无</span>
                            </span>
                        </div>
                        <div class="tag equip-item">
                            <span class="equip">
                                <span>灵宝: </span>
                                <el-tag v-if="player.equipment.accessory?.name" :type="player.equipment.accessory?.quality" :closable="player.equipment.accessory?.name ? true : false" @close="equipmentClose('accessory')" @click="equipmentInfo('accessory')">
                                    {{ player.equipment.accessory?.name }}{{ player.equipment.accessory?.strengthen ? '+' + player.equipment.accessory?.strengthen : '' }}
                                </el-tag>
                                <span v-else>无</span>
                            </span>
                            <span class="equip">
                                <span>法器: </span>
                                <el-tag v-if="player.equipment.sutra?.name" :type="player.equipment.sutra?.quality" :closable="player.equipment.sutra?.name ? true : false" @close="equipmentClose('sutra')" @click="equipmentInfo('sutra')">
                                    {{ player.equipment.sutra?.name }}{{ player.equipment.sutra?.strengthen ? '+' + player.equipment.sutra?.strengthen : '' }}
                                </el-tag>
                                <span v-else>无</span>
                            </span>
                        </div>
                        <div class="tag equip-item">
                            <span class="equip">
                                <span>灵宠: </span>
                                <el-tag class="pet" v-if="player.pet?.name" :type="computePetsLevel(player.pet?.level)" closable @close="petRetract" @click="petItemShow = true">{{ player.pet?.name }}({{levelNames[player.pet.level]}})</el-tag>
                                <span v-else>无</span>
                            </span>
                        </div>
                        <div class="tag inventory-box">
                            <el-tabs v-model="inventoryActive" :stretch="true" @tab-click="tabClick">
                                <el-tab-pane :label="i.name" :name="i.type" v-for="(i, k) in backPackItem" :key="k">
                                    <div class="inventory-content">
                                        <div v-if="player.inventory.length">
                                            <template v-for="item in player.inventory">
                                                <el-tag class="inventory-item" v-if="item.type == i.type" :key="item.id" :type="item?.quality" :closable="!item.lock" @close="inventoryClose(item)" @click="inventory(item.id, item.type)">
                                                    <i :class="item.lock ? 'el-icon-lock' : 'el-icon-unlock'" />
                                                    {{ item?.name }}{{item?.strengthen ? '+' + item?.strengthen : ''}}
                                                </el-tag>
                                            </template>
                                        </div>
                                        <div v-else>
                                            <el-tag type="success" class="dialog-footer-button" v-if="!player.isNewbie && player.level < 10" @click="newbiePack(4)">
                                                领取新手礼包
                                            </el-tag>
                                        </div>
                                    </div>
                                </el-tab-pane>
                                <el-tab-pane label="灵宠" name="pet">
                                    <div class="inventory-content">
                                        <template v-for="(item, index) in player.pets">
                                            <el-tag class="inventory-item" :type="computePetsLevel(item.level)" :key="index" @click="petItemInfo(item)">
                                                {{ item.name }}({{levelNames[item.level]}})
                                            </el-tag>
                                        </template>
                                    </div>
                                </el-tab-pane>
                                <el-tab-pane label="鸿蒙商店" name="shop">
                                    <el-tabs v-model="shopActive" :stretch="true">
                                        <el-tab-pane :label="i.name" :name="i.type" v-for="(i, k) in shopItems" :key="k">
                                            <div class="inventory-content">
                                                <template v-for="(item, index) in i.data">
                                                    <el-tag class="inventory-item" :type="item.quality" v-if="item.type == i.type" :key="index" @click="shopItemInfo(item)">
                                                        {{ item.name }}
                                                    </el-tag>
                                                </template>
                                            </div>
                                        </el-tab-pane>
                                    </el-tabs>
                                </el-tab-pane>
                            </el-tabs>
                        </div>
                    </div>
                    <div class="actions">
                        <el-button :type="action.type ? action.type : ''" v-for="(action, index) in actions" :key="index" @click="action.handler">
                            {{ action.text }}
                        </el-button>
                    </div>
                </div>
            </div>
            <div class="bbh">
                当前游戏版本0.6.7
            </div>
        </div>
        <el-drawer title="修仙境界表" :visible.sync="isLevel" direction="ltr" class="levels">
            <el-tag class="inventory-item" :type="player.level == index ? 'primary' : (index > player.level ? 'danger' : 'success')" :key="index" v-for="(item, index) in levelNames">
                {{ item }}
            </el-tag>
        </el-drawer>
        <el-drawer title="灵宠培养" :visible.sync="petItemShow" direction="rtl" class="strengthen">
            <div class="strengthen-box" v-if="petItemShow">
                <div class="attributes">
                    <div class="attribute-box">
                        <div class="tag attribute">
                            境界: {{ levelNames[player.pet.level] }} ({{player.pet.reincarnation || 0}}转)
                        </div>
                        <div class="tag attribute">
                            气血: {{ formatNumberToChineseUnit(player.pet.health) }}
                        </div>
                        <div class="tag attribute">
                            攻击: {{ formatNumberToChineseUnit(player.pet.attack) }}
                        </div>
                        <div class="tag attribute">
                            防御: {{ formatNumberToChineseUnit(player.pet.defense) }}
                        </div>
                        <div class="tag attribute">
                            闪避率: {{ player.pet.dodge > 0 ? (player.pet.dodge * 100).toFixed(2) : 0 }}%
                        </div>
                        <div class="tag attribute">
                            暴击率: {{ player.pet.critical > 0 ? (player.pet.critical * 100).toFixed(2) : 0 }}%
                        </div>
                        <div class="tag attribute" @click="notify({title: '获得方式', message: '可以通过探索秘境获得', position: 'top-left'})">
                            拥有培养丹: {{ formatNumberToChineseUnit(player.cultivateDan) }}
                        </div>
                        <div class="tag attribute">
                            培养消耗: {{ petConsumption(player.pet.level) }}
                        </div>
                    </div>
                </div>
                <div class="click-box">
                    <el-checkbox v-model="petReincarnation">
                        灵宠转生
                    </el-checkbox>
                    <el-button type="primary" @click="petUpgrade(player.pet)">
                        点击培养
                    </el-button>
                </div>
            </div>
        </el-drawer>
        <el-drawer title="装备炼器" :visible.sync="strengthenShow" direction="rtl" class="strengthen">
            <div class="strengthen-box" v-if="strengthenShow">
                <div class="attributes">
                    <div class="attribute-box">
                        <div class="tag attribute">
                            境界: {{ levelNames[strengthenInfo.level] }}
                        </div>
                        <div class="tag attribute">
                            气血: {{ formatNumberToChineseUnit(strengthenInfo.health) }}
                        </div>
                        <div class="tag attribute">
                            攻击: {{ formatNumberToChineseUnit(strengthenInfo.attack) }}
                        </div>
                        <div class="tag attribute">
                            防御: {{ formatNumberToChineseUnit(strengthenInfo.defense) }}
                        </div>
                        <div class="tag attribute">
                            闪避率: {{ strengthenInfo.dodge > 0 ? (strengthenInfo.dodge * 100).toFixed(2) : 0 }}%
                        </div>
                        <div class="tag attribute">
                            暴击率: {{ strengthenInfo.critical > 0 ? (strengthenInfo.critical * 100).toFixed(2) : 0 }}%
                        </div>
                        <div class="tag attribute">
                            炼器等级: {{ strengthenInfo.strengthen ?? 0 }}
                        </div>
                        <div class="tag attribute">
                            成功率: {{ (calculateEnhanceSuccessRate(strengthenInfo) * 100).toFixed(2) }}%
                        </div>
                        <div class="tag attribute" @click="notify({title: '获得方式', message: '出售装备可获取', position: 'top-left'})">
                            拥有炼器石: {{ formatNumberToChineseUnit(player.strengtheningStone) }}
                        </div>
                        <div class="tag attribute">
                            炼器消耗: {{ calculateCost(strengthenInfo) }}
                        </div>
                    </div>
                </div>
                <div class="click-box">
                    <el-checkbox v-model="protect">
                        炼器保护
                    </el-checkbox>
                    <el-checkbox v-model="increase">
                        炼器增幅
                    </el-checkbox>
                    <el-button type="primary" @click="enhance(strengthenInfo)">
                        点击炼器
                    </el-button>
                </div>
            </div>
        </el-drawer>
        <el-dialog :title="petInfo.name" :visible.sync="petShow" center width="420px">
            <div class="monsterinfo">
                <div class="monsterinfo-box">
                    <p>
                        <span class="description">境界: {{ levelNames[petInfo.level] }}</span>
                        <span class="icon">
                            <i :class="calculateDifference(petInfo.level, player.pet?.level).icon" />
                        </span>
                        <span class="value">
                            {{ petInfo.level > parseInt(player.pet?.level || 0) ? levelNames[petInfo.level] : levelNames[player.pet?.level] }}
                        </span>
                    </p>
                    <p>
                        <span class="description">转生: {{ petInfo.reincarnation || 0 }}</span>
                        <span class="icon">
                            <i :class="calculateDifference(petInfo.reincarnation, player.pet?.reincarnation).icon" />
                        </span>
                        <span class="value">{{ calculateDifference(petInfo.reincarnation, player.pet?.reincarnation).num }}</span>
                    </p>
                    <p>
                        <span class="description">气血: {{ petInfo.health }}</span>
                        <span class="icon">
                            <i :class="calculateDifference(petInfo.health, player.pet?.health).icon" />
                        </span>
                        <span class="value">{{ calculateDifference(petInfo.health, player.pet?.health).num }}</span>
                    </p>
                    <p>
                        <span class="description">攻击: {{ petInfo.attack }}</span>
                        <span class="icon">
                            <i :class="calculateDifference(petInfo.attack, player.pet?.attack).icon" />
                        </span>
                        <span class="value">{{ calculateDifference(petInfo.attack, player.pet?.attack).num }}</span>
                    </p>
                    <p>
                        <span class="description">防御: {{ petInfo.defense }}</span>
                        <span class="icon">
                            <i :class="calculateDifference(petInfo.defense, player.pet?.defense).icon" />
                        </span>
                        <span class="value">{{ calculateDifference(petInfo.defense, player.pet?.defense).num }}</span>
                    </p>
                    <p>
                        <span class="description">闪避率: {{ (petInfo.dodge * 100).toFixed(2) ?? 0 }}%</span>
                        <span class="icon">
                            <i :class="calculateDifference(petInfo.dodge, player.pet?.dodge).icon" />
                        </span>
                        <span class="value">{{ calculateDifference(petInfo.dodge, player.pet?.dodge).num }}</span>
                    </p>
                    <p>
                        <span class="description">暴击率: {{ (petInfo.critical * 100).toFixed(2) ?? 0 }}%</span>
                        <span class="icon">
                            <i :class="calculateDifference(petInfo.critical, player.pet?.critical).icon" />
                        </span>
                        <span class="value">{{ calculateDifference(petInfo.critical, player.pet?.critical).num }}</span>
                    </p>
                </div>
            </div>
            <div class="dialog-footer" style="margin-top: 30px;">
                <el-button type="plain" class="dialog-footer-button" @click="petClose(petInfo)">
                    灵宠放生
                </el-button>
                <el-button type="primary" class="dialog-footer-button" @click="petCarry(petInfo)">
                    灵宠出战
                </el-button>
            </div>
        </el-dialog>
        <el-dialog :title="inventoryInfo.name" :visible.sync="inventoryShow" center width="420px">
            <div class="monsterinfo">
                <div class="monsterinfo-box">
                    <p>
                        <span class="description">类型: {{ genre[inventoryInfo.type] }}</span>
                        <span class="icon" />
                        <span class="value" />
                    </p>
                    <p>
                        <span class="description">炼器: {{ inventoryInfo.strengthen || 0 }}</span>
                        <span class="icon">
                            <i :class="calculateDifference(inventoryInfo.strengthen, player.equipment[inventoryInfo.type]?.strengthen).icon" />
                        </span>
                        <span class="value">{{ calculateDifference(inventoryInfo.strengthen, player.equipment[inventoryInfo.type]?.strengthen).num }}</span>
                    </p>
                    <p>
                        <span class="description">境界: {{ levelNames[inventoryInfo.level] }}</span>
                        <span class="icon">
                            <i :class="calculateDifference(inventoryInfo.level, player.equipment[inventoryInfo.type]?.level).icon" />
                        </span>
                        <span class="value">
                            {{ inventoryInfo.level > parseInt(player.equipment[inventoryInfo.type]?.level || 1) ? levelNames[inventoryInfo.level] : levelNames[player.equipment[inventoryInfo.type]?.level] }}
                        </span>
                    </p>
                    <p>
                        <span class="description">品质: {{ levels[inventoryInfo.quality] }}</span>
                        <span class="icon">
                            <i :class="calculateDifference(levelsNum[inventoryInfo.quality], levelsNum[player.equipment[inventoryInfo.type]?.quality]).icon" />
                        </span>
                        <span class="value">
                            {{ calculateDifference(levelsNum[inventoryInfo.quality], levelsNum[player.equipment[inventoryInfo.type]?.quality]).num < 0 ? levels[player.equipment[inventoryInfo.type]?.quality] : levels[inventoryInfo.quality] }} </span>
                    </p>
                    <p>
                        <span class="description">气血: {{ inventoryInfo.health }}</span>
                        <span class="icon">
                            <i :class="calculateDifference(inventoryInfo.health, player.equipment[inventoryInfo.type]?.health).icon" />
                        </span>
                        <span class="value">{{ calculateDifference(inventoryInfo.health, player.equipment[inventoryInfo.type]?.health).num }}</span>
                    </p>
                    <p>
                        <span class="description">攻击: {{ inventoryInfo.attack }}</span>
                        <span class="icon">
                            <i :class="calculateDifference(inventoryInfo.attack, player.equipment[inventoryInfo.type]?.attack).icon" />
                        </span>
                        <span class="value">{{ calculateDifference(inventoryInfo.attack, player.equipment[inventoryInfo.type]?.attack).num }}</span>
                    </p>
                    <p>
                        <span class="description">防御: {{ inventoryInfo.defense }}</span>
                        <span class="icon">
                            <i :class="calculateDifference(inventoryInfo.defense, player.equipment[inventoryInfo.type]?.defense).icon" />
                        </span>
                        <span class="value">{{ calculateDifference(inventoryInfo.defense, player.equipment[inventoryInfo.type]?.defense).num }}</span>
                    </p>
                    <p>
                        <span class="description">闪避率: {{ (inventoryInfo.dodge * 100).toFixed(2) ?? 0 }}%</span>
                        <span class="icon">
                            <i :class="calculateDifference(inventoryInfo.dodge, player.equipment[inventoryInfo.type]?.dodge).icon" />
                        </span>
                        <span class="value">{{ calculateDifference(inventoryInfo.dodge, player.equipment[inventoryInfo.type]?.dodge).num }}</span>
                    </p>
                    <p>
                        <span class="description">暴击率: {{ (inventoryInfo.critical * 100).toFixed(2) ?? 0 }}%</span>
                        <span class="icon">
                            <i :class="calculateDifference(inventoryInfo.critical, player.equipment[inventoryInfo.type]?.critical).icon" />
                        </span>
                        <span class="value">{{ calculateDifference(inventoryInfo.critical, player.equipment[inventoryInfo.type]?.critical).num }}</span>
                    </p>
                </div>
            </div>
            <div class="dialog-footer" style="margin-top: 30px;">
                <el-button type="plain" class="dialog-footer-button" @click="inventoryLock(inventoryInfo.id)">
                    {{ inventoryInfo.lock ? '装备解锁' : '装备锁定' }}
                </el-button>
                <el-button type="primary" class="dialog-footer-button" @click="equipItem(inventoryInfo.id, inventoryInfo.type)">
                    立即装备
                </el-button>
            </div>
        </el-dialog>
        <el-dialog title="数据管理" :visible.sync="show" width="600px">
            <div class="dialog-footer">
                <el-button class="dialog-footer-button" @click="deleteData(1)">
                    出售装备
                </el-button>
                <el-button type="info" class="dialog-footer-button" @click="exportData">
                    导出存档
                </el-button>
                <el-upload action="#" class="dialog-upload" :http-request="importData" :show-file-list="false" accept="application/json">
                    <el-button type="warning" class="dialog-footer-button">
                        导入存档
                    </el-button>
                </el-upload>
                <el-button type="danger" class="dialog-footer-button" @click="deleteData(0)">
                    删除存档
                </el-button>
                <a class="el-button dialog-footer-button el-button--primary" href="https://qm.qq.com/q/D23KDtpCQC" target="_blank">
                    官方群聊
                </a>
            </div>
        </el-dialog>
        <div class="wm_bg_1" />
        <div class="wm_bg_2" />
    </div>
</template>

<script>
    // 商店
    import shop from '@/plugins/shop';
    // 怪物
    import boss from '@/plugins/boss';
    // 装备
    import equip from '@/plugins/equip';
    // 怪物
    import monster from '@/plugins/monster';
    // 图鉴
    import equipAll from '@/plugins/equipAll';

    export default {
        data () {
            return {
                // 弹窗
                show: false,
                // boss属性
                boss: {
                    name: '',
                    text: '',
                    desc: '',
                    level: 40,
                    dodge: 0,
                    attack: 0,
                    health: 0,
                    defense: 0,
                    conquer: false,
                    critical: 0,
                    maxhealth: 0,
                },
                // 最高境界
                maxLv: 40,
                genre: {
                    sutra: '法器',
                    armor: '护甲',
                    weapon: '神兵',
                    accessory: '灵宝'
                },
                isBoss: false,
                levels: {
                    info: '黄阶',
                    pink: '仙阶',
                    danger: '神阶',
                    purple: '天阶',
                    primary: '地阶',
                    success: '玄阶',
                    warning: '帝阶',
                },
                // 玩家属性
                player: {
                    // 当前携带的灵宠
                    pet: {},
                    // 已收服的灵宠
                    pets: [],
                    // 境界
                    level: 0,
                    // 闪避率
                    dodge: 0,
                    // 点数
                    points: 0,
                    // 攻击
                    attack: 10,
                    // 当前气血
                    health: 100,
                    // 防御
                    defense: 10,
                    // 已击杀数量
                    taskNum: 0,
                    // 暴击率
                    critical: 0,
                    // 是否已领取新手礼包
                    isNewbie: false,
                    // 鸿蒙石数量
                    currency: 0,
                    // 总气血
                    maxHealth: 100,
                    // 背包道具
                    inventory: [],
                    // 装备
                    equipment: {
                        // 法器
                        sutra: null,
                        // 护甲
                        armor: null,
                        // 神兵
                        weapon: null,
                        // 灵宝
                        accessory: null
                    },
                    // 当前修为
                    cultivation: 0,
                    // 培养丹数量
                    cultivateDan: 0,
                    // 转生次数
                    reincarnation: 0,
                    // 下个境界所需修为
                    maxCultivation: 100,
                    // 炼器石数量
                    strengtheningStone: 0,
                },
                // 野怪属性
                monster: {
                    // 名称
                    name: '',
                    // 气血
                    health: 0,
                    // 攻击
                    attack: 0,
                    // 防御
                    defense: 0,
                    // 闪避率
                    dodge: 0,
                    // 暴击
                    critical: 0
                },
                isLevel: false,
                actions: [],
                // 灵宠信息弹窗
                petShow: false,
                // 灵宠数据
                petInfo: {},
                // 炼器保护
                protect: false,
                // 炼器增幅
                increase: false,
                // 商店数据
                shopItems: [],
                // 商店商品价格
                shopPrice: 100,
                levelsNum: {
                    info: 1,
                    pink: 7,
                    danger: 6,
                    purple: 4,
                    primary: 3,
                    success: 2,
                    warning: 5,
                },
                shopActive: 'weapon',
                levelNames: [
                    '凡人', '筑基', '开光', '胎息', '辟谷',
                    '金丹', '元婴', '出窍', '分神',
                    '合体', '大乘', '渡劫', '地仙',
                    '天仙', '金仙', '大罗金仙', '九天玄仙',
                    '仙君', '仙帝', '仙尊', '仙祖',
                    '圣仙', '至仙', '无上仙', '道仙',
                    '鸿蒙仙', '混沌仙', '天尊', '始祖天尊',
                    '无上天尊', '大道天尊', '永恒仙尊', '宇宙仙祖',
                    '虚空道祖', '超脱者', '至高神', '创世神',
                    '纪元之主', '无上主宰', '鸿蒙主宰', '混沌主宰'
                ],
                storyText: '',
                ismonster: false,
                isequipment: false,
                // 灵宠信息弹窗
                petItemShow: false,
                // 回合数
                guashaRounds: 10,
                backPackItem: [
                    { type: 'weapon', name: '神兵' },
                    { type: 'armor', name: '护甲' },
                    { type: 'accessory', name: '灵宝' },
                    { type: 'sutra', name: '法器' }
                ],
                inventoryInfo: {},
                inventoryShow: false,
                // 炼器弹窗
                strengthenShow: false,
                // 炼器的信息
                strengthenInfo: {},
                isIllustrations: false,
                inventoryActive: 'weapon',
                // 灵宠转生勾选状态
                petReincarnation: false,
                openEquipItemInfo: null,
                illustrationsItems: [],
                illustrationsActive: 'weapon',
                illustrationsInfoData: [],
            };
        },
        watch: {
            'player.attack': function (val) {
                if (isNaN(val)) {
                    this.reset();
                } else {
                    this.player.attack = val;
                }
            },
            'player.health': function (val) {
                if (isNaN(val)) {
                    this.reset();
                } else {
                    this.player.health = val;
                }
            },
            'player.defense': function (val) {
                if (isNaN(val)) {
                    this.reset();
                } else {
                    this.player.defense = val;
                }
            },
            'player.maxHealth': function (val) {
                if (isNaN(val)) {
                    this.reset();
                } else {
                    this.player.maxHealth = val;
                }
            },
            'player.critical': function (val) {
                if (isNaN(val) || val < 0) {
                    this.player.critical = 0;
                    this.storyText = '暴击属性出错, 请手动卸下身上穿的所有装备后刷新游戏';
                } else {
                    this.player.critical = val;
                }
            },
            'player.dodge': function (val) {
                if (isNaN(val) || val < 0) {
                    this.player.dodge = 0;
                    this.storyText = '闪避属性出错, 请手动卸下身上穿的所有装备后刷新游戏';
                } else {
                    this.player.dodge = val;
                }
            },
        },
        mounted () {
            // 判断本地有没有玩家存档数据
            const local = this.$store.state;
            if (local) {
                this.boss = local.boss;
                this.player = local.player;
                window.player = this.player;
                // 已出战灵宠数据
                this.player.pet = this.player.pet ? this.player.pet : {};
                // 灵宠背包数据
                this.player.pets = this.player.pets ? this.player.pets : [];
                // 鸿蒙石数量
                this.player.currency = this.player.currency ? this.player.currency : 0;
                // 培养丹数量
                this.player.cultivateDan = this.player.cultivateDan ? this.player.cultivateDan : 0;
                // 转生次数
                this.player.reincarnation = this.player.reincarnation ? this.player.reincarnation : 0;
                // 强化石数量
                this.player.strengtheningStone = this.player.strengtheningStone ? this.player.strengtheningStone : 0;
                // 转换灵宠背包里的转生次数
                if (this.player.pets.length) {
                    this.player.pets.forEach(item => {
                        item.reincarnation = item.reincarnation ? item.reincarnation : 0;
                    });
                }
                // 转换背包装备属性为纯数字
                if (this.player.inventory.length) {
                    this.player.inventory.forEach(item => {
                        item.attack = Math.floor(item.attack);
                        item.critical = parseFloat(item.critical);
                        item.health = Math.floor(item.health);
                        item.defense = Math.floor(item.defense);
                        item.dodge = parseFloat(item.dodge);
                    });
                }
            }
            // 初始化游戏
            this.startGame();
        },
        methods: {
            // 放生灵宠
            petClose (item) {
                this.$confirm(`你确定要放生<span class="el-tag el-tag--${this.computePetsLevel(item.level)}">${item.name}(${this.levelNames[item.level]})</span>吗?`, '灵宠放生通知', {
                    center: true,
                    cancelButtonText: '取消放生',
                    confirmButtonText: '确定放生',
                    dangerouslyUseHTMLString: true
                }).then(() => {
                    // 灵宠转生次数
                    const reincarnation = item.reincarnation ? item.reincarnation : 1;
                    // 获得的培养丹数量
                    const num = item.level * reincarnation;
                    // 关闭灵宠信息弹窗
                    this.petShow = false;
                    // 增加培养丹数量
                    this.player.cultivateDan += num;
                    // 删除道具
                    this.player.pets = this.player.pets.filter(obj => obj.id !== item.id);
                    // 更新玩家存档
                    this.$store.commit('setPlayer', this.player);
                    // 装备出售通知
                    this.notify({
                        title: `${item.name}已成功放生`,
                        message: `对方临走时赠与了你${num}个培养丹`
                    });
                }).catch(() => { });
            },
            // 灵宠信息
            petItemInfo (item) {
                this.petShow = true;
                this.petInfo = item;
            },
            // 灵宠收回
            petRetract () {
                const item = this.player.pet;
                if (JSON.stringify(item) == '{}') return;
                // 更新玩家属性，移除当前出战灵宠的属性加成
                this.playerAttribute(-item.dodge, -item.attack, -item.health, -item.critical, -item.defense);
                // 跳转背包相关页
                this.inventoryActive = 'pet';
                // 添加灵宠到灵宠背包里
                this.player.pets.push(item);
                // 收回当前出战的灵宠
                this.player.pet = {};
                // 更新玩家存档
                this.$store.commit('setPlayer', this.player);
            },
            // 灵宠出战
            petCarry (item) {
                // 根据灵宠id查找灵宠信息
                const petItem = this.getObjectById(item.id, this.player.pets);
                // 如果已经有灵宠出战就收回
                if (JSON.stringify(this.player.pet) != '{}') {
                    const itemInfo = this.player.pet;
                    // 更新玩家属性，移除出战灵宠的属性加成
                    this.playerAttribute(-itemInfo.dodge, -itemInfo.attack, -itemInfo.health, -itemInfo.critical, -itemInfo.defense);
                    // 收回当前出战的灵宠
                    this.player.pets.push(this.player.pet);
                }
                // 关闭灵宠信息弹窗
                this.petShow = false;
                // 出战当前选择的灵宠
                this.player.pet = petItem;
                // 更新玩家属性，添加当前出战灵宠的属性加成
                this.playerAttribute(petItem.dodge, petItem.attack, petItem.health, petItem.critical, petItem.defense);
                // 从灵宠背包中移除这个灵宠
                this.player.pets = this.player.pets.filter(i => i.id !== item.id);
                // 更新玩家存档
                this.$store.commit('setPlayer', this.player);
            },
            // 计算灵宠等级
            computePetsLevel (lv) {
                if (lv >= 1 && lv <= 9) return 'success';
                if (lv >= 10 && lv <= 19) return 'primary';
                if (lv >= 20 && lv <= 29) return 'warning';
                if (lv >= 30) return 'danger';
            },
            // 计算灵宠升级所需消耗
            petConsumption (lv) {
                // 是否勾选转生选项
                const cost = this.petReincarnation ? 10 : 1;
                // 转生次数
                const reincarnation = this.player.pet.reincarnation ? lv * 200 : 1;
                return (lv * 200 + reincarnation) * cost;
            },
            // 灵宠升级
            petUpgrade (item) {
                // 计算灵宠升级所需材料数量
                const consume = this.petConsumption(item.level);
                // 如果勾选了灵宠转生但是灵宠等级没满
                if (this.petReincarnation && this.maxLv > item.level) {
                    // 发送通知
                    this.notify({ title: '灵宠培养提示', message: '灵宠境界未满无法转生', position: 'top-left' });
                    return;
                }
                // 如果没有勾选灵宠转生并且境界满了
                if (!this.petReincarnation && item.level >= this.maxLv) {
                    // 发送通知
                    this.notify({ title: '灵宠培养提示', message: '灵宠境界已满请转生', position: 'top-left' });
                    return;
                }
                // 如果培养丹不足
                if (consume > this.player.cultivateDan) {
                    // 发送通知
                    this.notify({ title: '灵宠培养提示', message: '培养丹不足, 进行无法培养', position: 'top-left' });
                    return;
                }
                // 灵宠培养确认弹窗
                this.$confirm('你确定要培养该灵宠吗?', '灵宠培养提示', {
                    cancelButtonText: '我点错了',
                    confirmButtonText: '确定以及肯定'
                }).then(() => {
                    // 闪避
                    const dodge = parseFloat(item.dodge * 0.2);
                    // 攻击
                    const attack = Math.floor(item.attack * 0.2);
                    // 血量
                    const health = Math.floor(item.health * 0.2);
                    // 防御
                    const defense = Math.floor(item.defense * 0.2);
                    // 暴击
                    const critical = parseFloat(item.critical * 0.2);
                    // 如果勾选了转生并且当前等级已满
                    if (item.level == this.maxLv) {
                        // 重置灵宠等级
                        this.player.pet.level = 1;
                        // 取消转生勾选
                        this.petReincarnation = false;
                        // 增加灵宠转生次数
                        this.player.pet.reincarnation++;
                        // 发送通知
                        this.notify({ title: '灵宠培养提示', message: '灵宠转生成功, 已重置灵宠境界', position: 'top-left' });
                    } else {
                        // 增加灵宠等级
                        this.player.pet.level++;
                        // 发送通知
                        this.notify({ title: '灵宠培养提示', message: '灵宠培养成功', position: 'top-left' });
                    }
                    // 增加灵宠属性
                    this.player.pet.dodge += dodge;
                    this.player.pet.attack += attack;
                    this.player.pet.health += health;
                    this.player.pet.defense += defense;
                    this.player.pet.critical += critical;
                    // 更新玩家属性，添加灵宠培养后的属性加成
                    this.playerAttribute(dodge, attack, health, critical, defense);
                    // 扣除培养丹
                    this.player.cultivateDan -= consume;
                    // 更新玩家存档
                    this.$store.commit('setPlayer', this.player);
                }).catch(() => { });
            },
            // 收服灵宠
            harvestPet (item) {
                // 成功几率
                const successRate = this.calculateCaptureRate();
                // 是否成功收服
                const isSuccess = successRate == monster.getRandomInt(1, successRate);
                // 如果成功收服
                if (isSuccess) {
                    // 收服后的属性根据收服前的成功率算
                    const newProperties = (100 - successRate) * 0.5;
                    // 攻击
                    const attack = Math.floor(monster.getRandomInt(50, 150) * newProperties);
                    // 防御
                    const defense = Math.floor(monster.getRandomInt(1, 15) * newProperties);
                    // 血量
                    const health = Math.floor(monster.getRandomInt(100, 500) * newProperties);
                    // 闪避
                    const dodge = parseFloat(monster.getRandomFloatInRange(0.001, 0.01) * newProperties);
                    // 暴击
                    const critical = parseFloat(monster.getRandomFloatInRange(0.001, 0.01) * newProperties);
                    // 添加到灵宠背包里
                    this.player.pets.push({
                        id: Date.now(),
                        name: item.name,
                        level: 1,
                        dodge,
                        health,
                        attack,
                        defense,
                        critical,
                        // 转生
                        reincarnation: 0
                    });
                    // 恢复回合数
                    this.guashaRounds = 10;
                    // 跳转背包相关页
                    this.inventoryActive = 'pet';
                    // 发送提示
                    this.notify({ title: '收服灵宠提示', message: `收服${item.name}成功` });
                    // 更新玩家存档
                    this.$store.commit('setPlayer', this.player);
                    // 如果没有收服
                } else {
                    // 发送提示
                    this.notify({ title: '收服灵宠提示', message: `收服${item.name}失败` });
                    // 触发战斗
                    this.fightMonster();
                }
            },
            // 计算收服灵宠成功概率
            calculateCaptureRate () {
                // 基础100%几率
                const baseRate = 100;
                // 每升一级减少5%的基础几率
                const decayFactor = 0.95;
                // 根据等级计算实际几率
                let captureRate = baseRate * Math.pow(decayFactor, this.player.level);
                // 确保几率在 0% 到 100% 之间
                captureRate = Math.floor(Math.max(0, Math.min(100, captureRate)));
                return captureRate;
            },
            // 计算炼器成功概率  
            calculateEnhanceSuccessRate (item) {
                // 基础成功率
                let baseSuccessRate = 1;
                // 每级降低成功率
                let decrementPerLevel = 0.05;
                // 炼器增幅
                let increase = this.increase ? 0.1 : 0;
                // 最终成功率
                return baseSuccessRate - (item.strengthen * decrementPerLevel - increase);
            },
            // 计算炼器所需消耗的道具数量
            calculateCost (item) {
                // 炼器基础消耗
                let baseCost = item.level * 5;
                // 每级炼器需要增加的消耗
                let incrementPerLevel = item.strengthen * 50;
                // 是否开启炼器保护
                let protect = this.protect ? 10 : 1;
                // 是否开启炼器增幅
                let increase = this.increase ? 5 : 1;
                // 最终所需消耗道具数量
                return (baseCost + incrementPerLevel) * protect * increase;
            },
            // 炼器
            enhance (item) {
                // 炼器成功率
                const successRate = this.calculateEnhanceSuccessRate(item);
                // 炼器消耗道具数量
                const calculateCost = this.calculateCost(item);
                // 玩家信息
                let player = this.player;
                // 如果炼器石不足
                if (calculateCost > player.strengtheningStone) {
                    // 发送通知
                    this.notify({ title: '炼器提示', message: '炼器石不足, 进行无法炼器操作', position: 'top-left' });
                    return;
                }
                // 炼器确认弹窗
                this.$confirm(item.strengthen >= 15 && !this.protect ? `当前装备炼器等级已达到+${item.strengthen}, 如果炼器失败该装备会销毁, 请问还需要炼器吗?` : '你确定要炼器吗?', '炼器提示', {
                    cancelButtonText: '我点错了',
                    confirmButtonText: '确定以及肯定'
                }).then(() => {
                    // 如果炼器成功
                    if (Math.random() <= successRate) {
                        // 闪避
                        const dodge = parseFloat(item.dodge * 0.1);
                        // 攻击
                        const attack = Math.floor(item.attack * 0.1);
                        // 血量
                        const health = Math.floor(item.health * 0.1);
                        // 防御
                        const defense = Math.floor(item.defense * 0.1);
                        // 暴击
                        const critical = parseFloat(item.critical * 0.1);
                        switch (item.type) {
                            // 如果是神兵
                            case 'weapon':
                                item.attack += attack;
                                item.critical += critical;
                                this.playerAttribute(0, attack, 0, critical, 0);
                                break;
                            // 如果是防具
                            case 'armor':
                                item.health += health;
                                item.defense += defense;
                                this.playerAttribute(0, 0, health, 0, defense);
                                break;
                            // 如果是灵宝或法器
                            case 'accessory':
                            case 'sutra':
                                item.dodge += dodge;
                                item.attack += attack;
                                item.health += health;
                                item.defense += defense;
                                item.critical += critical;
                                this.playerAttribute(dodge, attack, health, critical, defense);
                                break;
                            default:
                                break;
                        }
                        // 增加炼器等级
                        item.strengthen++;
                        // 发送炼器成功通知
                        this.notify({ title: '炼器提示', message: '炼器成功', position: 'top-left' });
                    } else {
                        // 如果炼器等级等于或大于15级并且未开启炼器保护
                        if (item.strengthen >= 15 && !this.protect) {
                            // 移除销毁当前装备
                            player.equipment[item.type] = {};
                            // 扣除已销毁装备增加的属性
                            this.playerAttribute(-item.dodge, -item.attack, -item.health, -item.critical, -item.defense);
                            // 炼器等级清零
                            item.strengthen = 0;
                            // 关闭炼器弹窗
                            this.strengthenShow = false;
                        }
                        // 发送炼器失败通知
                        this.notify({ title: '炼器提示', message: item.strengthen >= 15 && !this.protect ? '炼器失败, 装备已自动销毁' : '炼器失败', position: 'top-left' });
                    }
                    // 扣除炼器石
                    this.player.strengtheningStone -= calculateCost;
                    // 更新玩家存档
                    this.$store.commit('setPlayer', this.player);
                }).catch(() => { });
            },
            // 计算所需修为相差百分比
            calculatePercentageDifference (num1, num2) {
                let difference = Math.abs(num1 - num2);
                let percentage = (difference / num1) * 100;
                return 100 - percentage;
            },
            // 计算身上装备和背包装备差值
            calculateDifference (item1, item2) {
                item1 = item1 || 0;
                item2 = item2 || 0;
                const ojb = {
                    num: this.isFloat(item1) || this.isFloat(item2) ? ((item1 - parseFloat(item2)) * 100).toFixed(2) + '%' : item1 - parseInt(item2),
                    icon: item1 > item2 ? 'success el-icon-caret-top' : (item1 == item2 ? '' : 'danger el-icon-caret-bottom'),
                };
                ojb.num = ojb.num == 0 ? '' : ojb.num
                return ojb;
            },
            // 判断是否为浮点数
            isFloat (num) {
                return Number(num) === num && num % 1 !== 0;
            },
            // 获取商店装备
            tabClick () {
                if (this.inventoryActive == 'shop') this.shopItems = shop.drawPrize(this.maxLv);
            },
            // 商店装备信息
            shopItemInfo (item) {
                this.$confirm('', item.name, {
                    center: true,
                    message: `<div class="monsterinfo">
                        <div class="monsterinfo-box">
                            <p>价格: ${this.shopPrice}鸿蒙石</p>
                            <p>类型: ${this.genre[item.type]}</p>
                            <p>境界: ${this.levelNames[item.level]}</p>
                            <p>品质: ${this.levels[item.quality]}</p>
                            <p>气血: ${this.formatNumberToChineseUnit(item.health)}</p>
                            <p>攻击: ${this.formatNumberToChineseUnit(item.attack)}</p>
                            <p>防御: ${this.formatNumberToChineseUnit(item.defense)}</p>
                            <p>闪避率: ${(item.dodge * 100).toFixed(2) ?? 0}%</p>
                            <p>暴击率: ${(item.critical * 100).toFixed(2) ?? 0}%</p>
                        </div>
                    </div>`,
                    cancelButtonText: '取消购买',
                    confirmButtonText: '购买装备',
                    dangerouslyUseHTMLString: true
                }).then(() => {
                    this.shopBuy(item);
                }).catch(() => { });
            },
            // 单位转换
            formatNumberToChineseUnit (number) {
                if (number >= 100000000) {
                    return (number / 100000000).toFixed(2) + '亿';
                } else if (number >= 10000) {
                    return (number / 10000).toFixed(2) + '万';
                } else {
                    return number.toString();
                }
            },
            // 购买装备
            shopBuy (item) {
                if (this.player.currency >= this.shopPrice) {
                    // 扣除鸿蒙石
                    this.player.currency -= this.shopPrice;
                    // 添加到背包
                    this.player.inventory.push(item);
                    // 更新玩家存档
                    this.$store.commit('setPlayer', this.player);
                    // 跳转背包相关页
                    this.inventoryActive = item.type;
                    this.notify({ title: '购买提示', message: `您成功花费${this.shopPrice}鸿蒙石购买${item.name}` });
                } else {
                    this.notify({ title: '购买提示', message: '购买失败, 鸿蒙石不足' });
                }
            },
            // 重置
            reset () {
                this.storyText = '属性出错, 请添加QQ群:920930589, 上传"存档"并联系作者解决';
                this.$confirm('你是否要导出存档?', '存档导出提示', {
                    center: true,
                    confirmButtonText: '确定'
                }).then(() => {
                    this.exportData();
                }).catch(() => { });
            },
            // 导入存档
            importData (data) {
                const file = data.file;
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        localStorage.setItem('vuex', e.target.result);
                        location.reload(1);
                    } catch (err) {
                        this.notify.error({
                            title: '数据导入失败',
                            message: `错误信息:${err}`
                        });
                    }
                };
                reader.readAsText(file);
            },
            // 导出存档
            exportData () {
                const today = new Date();
                const year = today.getFullYear();
                const month = String(today.getMonth() + 1).padStart(2, '0');
                const day = String(today.getDate()).padStart(2, '0');
                const hours = String(today.getHours()).padStart(2, '0');
                const minutes = String(today.getMinutes()).padStart(2, '0');
                const seconds = String(today.getSeconds()).padStart(2, '0');
                // 判断是否苹果设备
                const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
                const blob = new Blob([localStorage.getItem('vuex')], { type: 'application/json;charset=utf-8' });
                const name = `文字修仙小游戏存档${year}-${month}-${day} ${hours}:${minutes}:${seconds}.json`;
                if (isIOS) {
                    const reader = new FileReader();
                    reader.readAsDataURL(blob);
                    reader.onload = function () {
                        const url = reader.result;
                        const a = document.createElement('a');
                        a.style.display = 'none';
                        document.body.appendChild(a);
                        a.href = url;
                        a.download = name;
                        a.click();
                        window.URL.revokeObjectURL(url);
                    };
                } else {
                    const url = URL.createObjectURL(blob);
                    const downloadLink = document.createElement('a');
                    downloadLink.href = url;
                    downloadLink.download = name;
                    document.body.appendChild(downloadLink);
                    downloadLink.click();
                    document.body.removeChild(downloadLink);
                }
            },
            // 删档
            deleteData (type) {
                this.$confirm(type ? '你确定要出售背包里的所有装备吗?' : '你确定要删除存档吗?建议数据出问题的时候再删除', type ? '装备出售提示' : '数据删除提示', {
                    center: true,
                    cancelButtonText: '我点错了',
                    confirmButtonText: '确定以及肯定'
                }).then(() => {
                    if (type) {
                        const inventory = this.player.inventory;
                        const length = inventory.filter(equipment => !equipment.lock).length;
                        if (!length) {
                            this.notify({
                                title: '背包装备出售提示',
                                message: '背包内并没有可以售卖的非锁定装备'
                            });
                            return;
                        }
                        // 关闭弹窗
                        this.show = false;
                        // 计算未锁定装备的等级总和
                        const strengtheningStoneTotal = inventory.filter(equipment => !equipment.lock).reduce((acc, equipment) => {
                            // 确保 level 是一个数字
                            const level = Number(equipment.level) || 0;
                            return acc + level;
                        }, 0);
                        // 增加炼器石数量
                        this.player.strengtheningStone += strengtheningStoneTotal
                        // 清空背包内所有未锁定装备
                        this.player.inventory = inventory.filter(obj => obj.lock === true);
                        this.$store.commit('setPlayer', this.player);
                        this.notify({
                            title: '背包装备出售提示',
                            message: `背包内所有非锁定装备已成功出售, 你获得了${strengtheningStoneTotal}个炼器石`
                        });
                    } else {
                        // 清空存档
                        localStorage.removeItem('vuex');
                        // 刷新页面
                        location.reload(1);
                    }
                }).catch(() => { });
            },
            // 计算当前时间和指定时间相差多少分钟
            getMinuteDifference (specifiedTimestamp) {
                // 获取当前时间戳（秒数）
                const currentTimestamp = Math.floor(Date.now() / 1000);
                specifiedTimestamp = specifiedTimestamp == 0 ? currentTimestamp : specifiedTimestamp;
                // 计算时间差（分钟数）
                const timeDifferenceInSeconds = Math.abs(currentTimestamp - specifiedTimestamp);
                const timeDifferenceInMinutes = Math.floor(timeDifferenceInSeconds / 60);
                return timeDifferenceInMinutes;
            },
            // 初始化游戏
            startGame () {
                if (!this.player.cultivation) this.storyText = '你的修仙之旅开始了。';
                else this.storyText = '你准备好出门遭受毒打了吗?';
                this.actions = [
                    { text: '开始修炼', handler: this.cultivate },
                    { text: '探索秘境', handler: this.explore },
                    { text: '装备图鉴', type: 'warning', handler: this.openIllustration },
                    { text: '世界BOSS', type: 'danger', handler: this.assaultBoss }
                ];
                // 初始化玩家当前气血
                this.player.health = this.player.maxHealth;
                // 更新玩家存档
                this.$store.commit('setPlayer', this.player);
            },
            // boss信息
            openBossInfo () {
                const info = this.boss;
                this.$confirm('', info.name, {
                    center: true,
                    message: `<div class="monsterinfo">
                        <div class="monsterinfo-box">
                            <p>境界: ${this.levelNames[info.level]}</p>
                            <p>气血: ${this.formatNumberToChineseUnit(info.health)}</p>
                            <p>攻击: ${this.formatNumberToChineseUnit(info.attack)}</p>
                            <p>防御: ${this.formatNumberToChineseUnit(info.defense)}</p>
                            <p>闪避率: ${(info.dodge * 100).toFixed(2)}%</p>
                            <p>暴击率: ${(info.critical * 100).toFixed(2)}%</p>
                            <p>鸿蒙石掉落: 10颗</p>
                            <p>神装掉落率: 100%</p>
                        </div>
                    </div>`,
                    dangerouslyUseHTMLString: true
                }).catch(() => { });
            },
            // 攻击世界boss
            fightBoss () {
                if (this.player.level < this.maxLv) {
                    this.notify({
                        title: `你的境界尚未达到${this.levelNames[this.maxLv]}`,
                        message: `${this.boss.name}对于你的挑战不屑一顾`
                    });
                    return;
                }
                // boss伤害计算
                const monsterAttack = this.boss.attack; // boss攻击
                const playerDefense = this.player.defense; // 玩家防御
                let monsterHarm = Math.max(0, Math.floor(monsterAttack - playerDefense)); // boss伤害
                monsterHarm = monsterHarm <= 1 ? 1 : monsterHarm; // 伤害小于1时强制破防
                // 玩家伤害计算  
                const playerAttack = this.player.attack; // 玩家攻击  
                const monsterDefense = this.boss.defense; // boss防御
                let playerHarm = Math.max(0, Math.floor(playerAttack - monsterDefense)); // 玩家伤害基础值
                playerHarm = playerHarm <= 1 ? 1 : playerHarm; // 伤害小于1时强制破防
                // 是否暴击
                let isMCritical = false, isCritical = false;
                // 是否闪避
                const isPlayerHit = Math.random() > this.boss.dodge;

                // 检查boss是否暴击  
                if (Math.random() < this.boss.critical) {
                    // boss暴击，伤害加倍  
                    monsterHarm *= 2;
                    // boss成功暴击
                    isMCritical = true;
                }

                // 检查玩家是否暴击  
                if (Math.random() < this.player.critical) {
                    // 玩家暴击，伤害加倍  
                    playerHarm *= 1.5;
                    // 玩家成功暴击
                    isCritical = true;
                }

                // 强制扣除玩家气血, 因为boss攻击必中
                this.player.health -= monsterHarm;

                // 如果boss没有闪避，扣除boss气血
                if (isPlayerHit) this.boss.health -= playerHarm;

                this.player.health = Math.max(0, this.player.health);
                this.boss.health = Math.max(0, this.boss.health);

                if (this.guashaRounds > 1) {
                    // 扣除回合数
                    this.guashaRounds--;
                    // boss气血小于等于0
                    if (this.boss.health <= 0) {
                        const equipItem = boss.boss_Equip(this.maxLv);
                        this.isequipment = true;
                        this.storyText = `你击败${this.boss.name}后，获得了<span class="el-tag el-tag--${equipItem.quality}">${this.levels[equipItem.quality]}${equipItem.name}(${this.genre[equipItem.type]})</span>`;
                        // 增加鸿蒙石
                        this.player.currency += 10;
                        // 获得鸿蒙石通知
                        this.notify({ title: '道具获得提示', message: '你获得了10颗鸿蒙石' });
                        this.openEquipItemInfo = equipItem;
                        // 跳转背包相关页
                        this.inventoryActive = equipItem.type;
                        // 玩家获得道具
                        if (equipItem?.name) this.player.inventory.push(equipItem);
                        // 修改boss状态
                        this.boss.time = Math.floor(Date.now() / 1000);
                        this.boss.health = 0;
                        this.boss.conquer = true;
                        this.$store.commit('setBoss', this.boss);
                        this.actions = [
                            {
                                text: '回到家里', type: 'success', handler: () => {
                                    this.isBoss = false;
                                    this.startGame();
                                }
                            }
                        ];
                    } else if (this.player.health <= 0) {
                        this.notify({ title: this.boss.name, message: this.boss.text });
                        this.storyText = '你因为太弱被击败了。'
                        this.actions = [
                            {
                                text: '回到家里', type: 'success', handler: () => {
                                    this.isBoss = false;
                                    this.startGame();
                                }
                            }
                        ];
                    } else {
                        const dodgeText = isPlayerHit ? `你攻击了${this.boss.name}，${isCritical ? '触发暴击' : ''}造成了${playerHarm}点伤害，剩余${this.boss.health}气血。` : `你攻击了${this.boss.name}，对方闪避了你的攻击，你未造成伤害，剩余${this.boss.health}气血。 `;
                        this.storyText = `${this.guashaRounds}回合 / 100回合<br>${dodgeText}<br>${this.boss.name}攻击了你，${isMCritical ? '触发暴击' : ''}造成了${monsterHarm}点伤害`;
                        this.actions = [
                            { text: '发起战斗', handler: this.fightBoss },
                            {
                                text: '立马撤退', handler: () => {
                                    this.ismonster = false;
                                    this.isequipment = false;
                                    this.storyText = '你选择了撤退，安全返回了修炼地点。';
                                    this.guashaRounds = 10;
                                    this.startGame();
                                }
                            }
                        ];
                    }
                } else {
                    this.guashaRounds = 10;
                    this.notify({ title: this.boss.name, message: this.boss.text });
                    this.storyText = `回合结束, 你未战胜${this.monster.name}你输了。`;
                    this.actions = [
                        { text: '回到家里', type: 'success', handler: this.startGame }
                    ];
                }
                // 更新玩家存档
                this.$store.commit('setPlayer', this.player);
            },
            // 世界BOSS
            assaultBoss () {
                // boss生成的时间
                const time = this.getMinuteDifference(this.boss.time);
                // boss难度根据玩家最高等级 + 转生次数
                const bossLv = this.maxLv * this.player.reincarnation + this.maxLv;
                // 如果boss血量为空
                if (!this.boss.health) {
                    if (this.boss.conquer && time < 10) {
                        this.notify({ title: '提示', message: 'BOSS还未刷新' });
                        return;
                    } else {
                        this.boss = boss.drawPrize(bossLv);
                        // 存档boss信息
                        this.$store.commit('setBoss', this.boss);
                    }
                }
                this.isBoss = true;
                this.storyText = '';
                this.guashaRounds = 100;
                this.actions = [
                    {
                        text: '返回家里', type: 'success', handler: () => {
                            this.isBoss = false;
                            this.startGame();
                        }
                    },
                    {
                        text: '攻击BOSS', type: 'danger', handler: () => {
                            this.isBoss = false;
                            this.fightBoss();
                        }
                    }
                ];
                // 更新boss信息
            },
            // 打开图鉴
            openIllustration () {
                this.actions = [
                    {
                        text: '返回家里', type: 'success', handler: () => {
                            this.isIllustrations = false;
                            this.startGame();
                        }
                    }
                ];
                this.isIllustrations = true;
                this.illustrationsItems = equipAll.drawPrize(this.maxLv);
            },
            // 图鉴装备信息
            illustrationsInfo (i, ii) {
                const info = this.illustrationsItems[i].data[ii];
                this.$confirm('', info.name, {
                    center: true,
                    message: `<div class="monsterinfo">
                        <div class="monsterinfo-box">
                            <p>类型: ${this.genre[info.type]}</p>
                            <p>炼器: +${info.strengthen}</p>
                            <p>境界: ${this.levelNames[info.level]}</p>
                            <p>品质: ${this.levels[info.quality]}</p>
                            <p>气血: ${this.formatNumberToChineseUnit(info.health)}</p>
                            <p>攻击: ${this.formatNumberToChineseUnit(info.attack)}</p>
                            <p>防御: ${this.formatNumberToChineseUnit(info.defense)}</p>
                            <p>闪避率: ${(info.dodge * 100).toFixed(2)}%</p>
                            <p>暴击率: ${(info.critical * 100).toFixed(2)}%</p>
                            <p>获得率: ${info.prize}%</p>
                        </div>
                    </div>`,
                    dangerouslyUseHTMLString: true
                }).catch(() => { });
            },
            // 赠送新手礼包
            newbiePack (timesLeft) {
                // 如果没有领取新手礼包
                if (!this.player.isNewbie) {
                    // 初始化物品
                    let equipItem = {};
                    // 神兵
                    if (timesLeft == 4) equipItem = equip.equip_Weapons(10, false);
                    // 护甲
                    else if (timesLeft == 3) equipItem = equip.equip_Armors(10, false);
                    // 灵宝
                    else if (timesLeft == 2) equipItem = equip.equip_Accessorys(10, false);
                    // 法器
                    else if (timesLeft == 1) equipItem = equip.equip_Sutras(10, false);
                    // 发送通知
                    else if (timesLeft == 0) {
                        // 修改礼包领取状态
                        this.player.isNewbie = true;
                        this.notify({ title: '新手礼包领取提示', message: '新手礼包领取成功!' });
                    }
                    // 终止
                    else return;

                    // 将装备添加到库存  
                    this.player.inventory.push(equipItem);
                    // 更新剩余次数  
                    timesLeft--;
                    // 设置延时以便下一次调用
                    setTimeout(() => {
                        this.newbiePack(timesLeft);
                    }, 100);
                    // 更新玩家存档
                    this.$store.commit('setPlayer', this.player);
                }
            },
            // 属性加点
            attributePoints (type) {
                const typeNames = {
                    attack: '攻击',
                    health: '气血',
                    defense: '防御',
                }
                if (this.player.points > 0) {
                    const num = this.player.reincarnation ? this.player.reincarnation * 10 : 1;
                    const numText = type == 'attack' || type == 'defense' ? 50 * num : 100 * num;
                    // 如果是攻击
                    if (type == 'attack') this.playerAttribute(0, numText, 0, 0, 0);
                    // 如果是防御
                    else if (type == 'defense') this.playerAttribute(0, 0, 0, 0, numText);
                    // 如果是血量
                    else if (type == 'health') this.playerAttribute(0, 0, numText, 0, 0);
                    // 扣除点数
                    this.player.points--;
                    // 更新玩家存档
                    this.$store.commit('setPlayer', this.player);
                    this.notify({ title: '加点提示', message: `加点成功${typeNames[type]}增加了${numText}点` });
                }
            },
            // 转生突破
            reincarnationBreakthrough () {
                // 转生次数
                let reincarnation = this.player.reincarnation;
                reincarnation = reincarnation == 0 ? 1 * 100 : reincarnation * 100;
                // 如果击杀数大于等于转生次数 * 100
                if (this.player.level == this.maxLv) {
                    if (this.player.taskNum >= reincarnation) {
                        this.$confirm('转生前请务必准备好大乘境的装备,避免转生后无法完成突破条件', '转生提醒', {
                            center: true,
                            cancelButtonText: '再攒攒装备',
                            confirmButtonText: '知道了, 我会对我的操作负责',
                            dangerouslyUseHTMLString: true
                        }).then(() => {
                            // 境界重置
                            this.player.level = 0;
                            // 修为重置
                            this.player.cultivation = 0;
                            // 总修为重置
                            this.player.maxCultivation = 100;
                            // 重置击杀次数
                            this.player.taskNum = 0;
                            // 增加转生次数
                            this.player.reincarnation++;
                            // 更新玩家存档
                            this.$store.commit('setPlayer', this.player);
                        }).catch(() => { });
                    } else {
                        this.notify({
                            title: '未满足转生条件',
                            message: `需要通过击败<span style="color: #f56c6c;">(${this.player.taskNum} / ${reincarnation})</span>个敌人证道转生`,
                            dangerouslyUseHTMLString: true
                        });
                    }
                } else {
                    this.notify({
                        title: '未满足转生条件',
                        message: `境界需要达到<span style="color: #f56c6c;">${this.levelNames[this.maxLv]}</span>才能满足转生条件`,
                        dangerouslyUseHTMLString: true
                    });
                }
            },
            // 修为突破
            breakThrough (exp) {
                // 如果当前境界小于最高境界当前修为大于等于总修为
                if (this.player.level < this.maxLv) {
                    if (this.player.cultivation >= this.player.maxCultivation) {
                        // 如果玩家等级大于10并且击杀数低于当前等级
                        if (this.player.level > 10 && this.player.level > this.player.taskNum) {
                            this.notify({
                                title: '当前境界修为已满',
                                message: `需要通过击败<span style="color: #f56c6c;">(${this.player.taskNum} / ${this.player.level})</span>个敌人证道突破`,
                                dangerouslyUseHTMLString: true
                            });
                            return;
                        }
                        // 清空已击杀敌人
                        this.player.taskNum = 0;
                        // 增加境界
                        this.player.level++;
                        // 增加点数
                        this.player.points += 3;
                        // 更新气血
                        this.player.health = this.player.maxHealth;
                        // 增加玩家总修为
                        this.player.maxCultivation = Math.floor(100 * Math.pow(2, this.player.level));
                        this.storyText = `恭喜你突破了！当前境界：${this.levelNames[this.player.level]}`;
                        this.actions = [
                            { text: '返回家里', type: 'success', handler: this.startGame },
                            { text: '转生突破', handler: this.reincarnationBreakthrough },
                            { text: '继续修炼', handler: this.cultivate },
                            { text: '探索秘境', handler: this.explore }
                        ];
                    } else {
                        // 当前修为
                        this.player.cultivation += exp;
                    }
                } else {
                    this.player.level = this.maxLv;
                    this.player.maxCultivation = Math.floor(100 * Math.pow(2, this.maxLv));
                    this.storyText = `你当前的境界已达到当前版本的顶峰, 无法再提升`;
                }
                this.$store.commit('setPlayer', this.player);
            },
            // 修炼逻辑
            cultivate () {
                this.ismonster = false;
                // 如果当前修为小于总修为
                if (this.player.cultivation <= this.player.maxCultivation) {
                    // 增加当前修为
                    const exp = this.player.level <= 10 ? Math.floor(this.player.maxCultivation / equip.getRandomInt(10, 30)) : Math.floor(this.player.maxCultivation / 100);
                    this.breakThrough(exp);
                    this.storyText = `你开始冥想，吸收周围的灵气。修为提升了！`;
                    this.actions = [
                        { text: '返回家里', type: 'success', handler: this.startGame },
                        { text: '转生突破', handler: this.reincarnationBreakthrough },
                        { text: '继续修炼', handler: this.cultivate },
                        { text: '探索秘境', handler: this.explore }
                    ];
                } else {
                    this.storyText = '你已经达到了当前境界的修为上限，需要突破到下一个境界。';
                    this.actions = [
                        { text: '返回家里', type: 'success', handler: this.startGame },
                        { text: '转生突破', handler: this.reincarnationBreakthrough },
                        { text: '突破境界', handler: () => this.breakThrough(1) },
                        { text: '杀敌证道', handler: this.explore }
                    ];
                }
            },
            // 探索逻辑
            explore () {
                if (this.player.level < 10) {
                    this.notify({ title: '实力不足提示', message: `外面太危险了, 请突破到${this.levelNames[10]}再出去吧!` });
                    return;
                }
                this.guashaRounds = 10;
                this.encounterMonster();
            },
            // 遇怪逻辑
            encounterMonster () {
                // 玩家境界
                let level = this.player.level == 0 ? 1 : this.player.level;
                // 怪物难度根据玩家最高境界 + 转生次数
                const monsterLv = level * this.player.reincarnation + level;
                // 野怪属性
                this.monster = {
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
                };
                this.ismonster = true;
                this.storyText = `你遇到了<span class="el-tag el-tag--danger">${this.monster.name}</span>`;
                this.actions = [
                    { text: '发起战斗', handler: this.fightMonster },
                    { text: '收服对方', type: 'pink', handler: () => this.harvestPet(this.monster) },
                    { text: '立马撤退', handler: this.runAway }
                ];
            },
            // 怪物信息
            openMonsterInfo () {
                this.$alert('', this.monster.name, {
                    center: true,
                    message: `<div class="monsterinfo">
                        <div class="monsterinfo-box">
                            <p>境界: ${this.player.level == 0 ? this.levelNames[this.player.level + 1] : this.levelNames[this.player.level]}</p>
                            <p>气血: ${this.formatNumberToChineseUnit(this.monster.health)}</p>
                            <p>攻击: ${this.formatNumberToChineseUnit(this.monster.attack)}</p>
                            <p>防御: ${this.formatNumberToChineseUnit(this.monster.defense)}</p>
                            <p>闪避率: ${(this.monster.dodge * 100).toFixed(2) ?? 0}%</p>
                            <p>暴击率: ${(this.monster.critical * 100).toFixed(2) ?? 0}%</p>
                            <p>收服率: ${this.calculateCaptureRate()}%</p>
                        </div>
                    </div>`,
                    confirmButtonText: '知道了',
                    dangerouslyUseHTMLString: true
                }).catch(() => { });
            },
            // 打坐休息
            rest () {
                // 打坐扣除回合数
                if (this.guashaRounds > 1) {
                    this.guashaRounds--;
                    if (this.player.health >= this.player.maxHealth) {
                        this.storyText = `${this.guashaRounds}回合 / 10回合<br>你的气血恢复完毕`;
                        this.actions = [
                            { text: '继续干他', handler: this.fightMonster },
                            { text: '立马撤退', handler: this.runAway }
                        ];
                    } else {
                        // 打坐回血
                        const maxHealth = Math.floor(this.player.maxHealth * 0.1)
                        if (this.player.health < this.player.maxHealth || this.player.health > this.player.maxHealth) {
                            this.player.health += maxHealth;
                            if (this.player.health >= this.player.maxHealth) this.player.health = this.player.maxHealth;
                        }
                        this.storyText = `${this.guashaRounds}回合 / 10回合<br>你恢复了${maxHealth}点气血`;
                        this.actions = [
                            { text: '继续干他', handler: this.fightMonster },
                            { text: '继续打坐', handler: this.rest },
                            { text: '立马撤退', handler: this.runAway }
                        ];
                    }
                } else {
                    this.guashaRounds = 10;
                    this.storyText = `回合结束, 你未战胜${this.monster.name}你输了。`;
                    this.actions = [
                        { text: '回到家里', type: 'success', handler: this.startGame }
                    ];
                }
            },
            // 攻击怪物
            fightMonster () {
                this.ismonster = false;
                this.isequipment = false;
                // 野怪伤害计算
                const monsterAttack = this.monster.attack; // 野怪攻击
                const playerDefense = this.player.defense; // 玩家防御
                let monsterHarm = Math.max(0, Math.floor(monsterAttack - playerDefense)); // 野怪伤害
                monsterHarm = monsterHarm <= 1 ? 1 : monsterHarm; // 伤害小于1时强制破防
                // 玩家伤害计算  
                const playerAttack = this.player.attack; // 玩家攻击  
                const monsterDefense = this.monster.defense; // 野怪防御
                let playerHarm = Math.max(0, Math.floor(playerAttack - monsterDefense)); // 玩家伤害基础值
                playerHarm = playerHarm <= 1 ? 1 : playerHarm; // 伤害小于1时强制破防
                // 是否暴击
                let isMCritical = false, isCritical = false;
                // 怪物是否闪避
                const isMHit = Math.random() > this.player.dodge;
                // 玩家是否闪避
                const isPHit = Math.random() > this.monster.dodge;

                // 检查野怪是否暴击  
                if (Math.random() < this.monster.critical) {
                    // 野怪暴击，伤害加倍  
                    monsterHarm *= 2;
                    // 野怪成功暴击
                    isMCritical = true;
                }

                // 检查玩家是否暴击  
                if (Math.random() < this.player.critical) {
                    // 玩家暴击，伤害加倍  
                    playerHarm *= 1.5;
                    // 玩家成功暴击
                    isCritical = true;
                }

                // 怪物没有闪避
                if (isMHit) this.player.health -= monsterHarm;

                // 玩家没有闪避
                if (isPHit) this.monster.health -= playerHarm;

                this.player.health = Math.max(0, this.player.health);
                this.monster.health = Math.max(0, this.monster.health);

                if (this.guashaRounds > 1) {
                    // 扣除回合数
                    this.guashaRounds--;
                    // 野怪气血小于等于0
                    if (this.monster.health <= 0) {
                        // 增加击杀数量
                        this.player.taskNum++;
                        // 增加培养丹
                        const reincarnation = this.player.reincarnation ? 1 + 1 * this.player.reincarnation : 1
                        this.player.cultivateDan += reincarnation;
                        // 发送提示
                        this.notify({ title: '击败提示', message: `击败${this.monster.name}后你获得了${reincarnation}颗培养丹` });
                        this.findTreasure(this.monster.name);
                        this.actions = [
                            { text: '回到家里', type: 'success', handler: this.startGame },
                            { text: '继续修炼', handler: this.cultivate },
                            { text: '继续探索', handler: this.explore },
                        ];
                    } else if (this.player.health <= 0) {
                        this.storyText = '你因为太弱被击败了。';
                        this.actions = [
                            { text: '回到家里', type: 'success', handler: this.startGame }
                        ];
                    } else {
                        // 玩家
                        const dodgeText1 = !isPHit ? `你攻击了${this.monster.name}，对方闪避了你的攻击，你未造成伤害，剩余${this.monster.health}气血。` : `你攻击了${this.monster.name}，${isCritical ? '触发暴击' : ''}造成了${playerHarm}点伤害，剩余${this.monster.health}气血。`;
                        // 野怪
                        const dodgeText2 = !isMHit ? `${this.monster.name}攻击了你，你闪避了对方的攻击，对方未造成伤害。` : `${this.monster.name}攻击了你，${isMCritical ? '触发暴击' : ''}造成了${monsterHarm}点伤害`;
                        this.storyText = `${this.guashaRounds}回合 / 10回合<br>${dodgeText1}<br>${dodgeText2}`;
                        this.actions = [
                            { text: '发起战斗', handler: this.fightMonster },
                            { text: '打坐休息', handler: this.rest },
                            { text: '立马撤退', handler: this.runAway }
                        ];
                    }
                } else {
                    this.guashaRounds = 10;
                    this.storyText = `回合结束, 你未战胜${this.monster.name}你输了。`;
                    this.actions = [
                        { text: '回到家里', type: 'success', handler: this.startGame }
                    ];
                }
                // 更新玩家存档
                this.$store.commit('setPlayer', this.player);
            },
            // 逃跑
            runAway () {
                this.guashaRounds--;
                this.ismonster = false;
                this.isequipment = false;
                if (equip.getRandomInt(0, 1)) {
                    this.storyText = `${this.guashaRounds}回合 / 10回合<br>撤退失败，请继续战斗。`
                    this.actions = [
                        { text: '发起攻击', handler: this.fightMonster },
                        { text: '打坐休息', handler: this.rest },
                    ];
                } else {
                    this.storyText = '你选择了撤退，安全返回了修炼地点。';
                    this.guashaRounds = 10;
                    this.actions = [
                        { text: '回到家里', type: 'success', handler: this.startGame },
                        { text: '继续修炼', handler: this.cultivate },
                        { text: '继续探索', handler: this.explore }
                    ];
                }
            },
            // 发现道具
            findTreasure (name) {
                this.ismonster = false;
                this.isequipment = true;
                const randomInt = equip.getRandomInt(1, 5);
                let equipItem = null;
                let exp = Math.floor(this.player.maxCultivation / 100);
                exp = exp ? exp : 1;
                // 如果没有满级
                if (this.player.level < this.maxLv) {
                    // 增加修为
                    this.breakThrough(exp);
                }
                // 神兵
                if (randomInt == 1) equipItem = equip.equip_Weapons(this.player.level);
                // 护甲
                else if (randomInt == 2) equipItem = equip.equip_Armors(this.player.level);
                // 灵宝
                else if (randomInt == 3) equipItem = equip.equip_Accessorys(this.player.level);
                // 法器
                else if (randomInt == 4) equipItem = equip.equip_Sutras(this.player.level);
                if (randomInt == 5) {
                    this.isequipment = false;
                    this.storyText = `你击败${name}后，获得了${exp}点修为。`;
                } else {
                    this.isequipment = true;
                    this.storyText = `你击败${name}后，发现了一个宝箱，打开后获得了<span class="el-tag el-tag--${equipItem.quality}">${this.levels[equipItem.quality]}${equipItem.name}(${this.genre[equipItem.type]})</span>`;
                    this.openEquipItemInfo = equipItem;
                    // 跳转背包相关页
                    this.inventoryActive = equipItem.type;
                    // 玩家获得道具
                    if (equipItem?.name) this.player.inventory.push(equipItem);
                }
                this.actions = [
                    { text: '回到家里', type: 'success', handler: this.startGame },
                    { text: '继续修炼', handler: this.cultivate },
                    { text: '继续探索', handler: this.explore }
                ];
                // 更新玩家存档
                this.$store.commit('setPlayer', this.player);
            },
            // 出售装备
            inventoryClose (item) {
                this.$confirm(`你确定要出售<span class="el-tag el-tag--${item.quality}">${this.levels[item.quality]}${item.name}(${this.genre[item.type]})</span>吗?`, '装备出售通知', {
                    center: true,
                    cancelButtonText: '取消出售',
                    confirmButtonText: '确定出售',
                    dangerouslyUseHTMLString: true
                }).then(() => {
                    const num = item.level + item.level * this.player.reincarnation / 10;
                    // 增加炼器石数量
                    this.player.strengtheningStone += num;
                    // 删除道具
                    this.player.inventory = this.player.inventory.filter(obj => obj.id !== item.id);
                    // 更新玩家存档
                    this.$store.commit('setPlayer', this.player);
                    // 装备出售通知
                    this.notify({
                        title: '背包装备售卖提示',
                        message: `${item.name}已成功卖出, 你获得了${num}个炼器石`
                    });
                }).catch(() => { });
            },
            // 道具锁定or道具解锁
            inventoryLock (id) {
                let inventoryItem = this.getObjectById(id, this.player.inventory);
                inventoryItem.lock = !inventoryItem.lock;
                // 更新玩家存档
                this.$store.commit('setPlayer', this.player);
                this.notify({
                    title: !inventoryItem.lock ? '装备解锁提示' : '装备锁定提示',
                    message: !inventoryItem.lock ? '装备解锁成功' : '装备锁定成功'
                });
            },
            // 道具信息
            inventory (id) {
                this.inventoryInfo = this.getObjectById(id, this.player.inventory);
                this.inventoryShow = true;
            },
            // 装备信息
            equipmentInfo (type) {
                const equipment = this.player.equipment[type];
                // 打开炼器弹窗
                this.strengthenShow = true;
                // 需要炼器的装备信息
                this.strengthenInfo = equipment;
                // 炼器等级
                this.player.equipment[type].strengthen = equipment.strengthen ? equipment.strengthen : 0;
            },
            // 发现的装备信息
            openEquipmentInfo () {
                const equipment = this.openEquipItemInfo;
                if (!equipment) return;
                this.$confirm('', equipment.name, {
                    center: true,
                    message: `<div class="monsterinfo">
                        <div class="monsterinfo-box">
                            <p>类型: ${this.genre[equipment.type] ?? '未知'}</p>
                            <p>境界: ${this.levelNames[equipment.level]}</p>
                            <p>品质: ${this.levels[equipment.quality] ?? '未知'}</p>
                            <p>气血: ${this.formatNumberToChineseUnit(equipment.health)}</p>
                            <p>攻击: ${this.formatNumberToChineseUnit(equipment.attack)}</p>
                            <p>防御: ${this.formatNumberToChineseUnit(equipment.defense)}</p>
                            <p>闪避率: ${(equipment.dodge * 100).toFixed(2) ?? 0}%</p>
                            <p>暴击率: ${(equipment.critical * 100).toFixed(2) ?? 0}%</p>
                        </div>
                    </div>`,
                    dangerouslyUseHTMLString: true
                }).catch(() => { });
            },
            // 穿装备
            equipItem (id, type) {
                const inventoryItem = this.getObjectById(id, this.player.inventory);
                // 如果当前装备境界大于人物的境界
                if (inventoryItem.level > this.player.level) {
                    this.notify.error({ title: '当前境界不足', message: '无法穿戴该装备' });
                    return;
                }
                // 如果当前类型的装备已经穿戴，则将其放回背包
                if (this.player.equipment[type]) {
                    const equipment = this.player.equipment[type];
                    // 更新玩家属性，移除当前穿戴装备的属性加成
                    this.playerAttribute(-equipment.dodge, -equipment.attack, -equipment.health, -equipment.critical, -equipment.defense);
                    // 将当前装备放回背包
                    this.player.inventory.push(equipment);
                }
                // 装备新装备
                this.player.equipment[type] = inventoryItem;
                // 更新玩家属性，添加当前装备的属性加成
                this.playerAttribute(inventoryItem.dodge, inventoryItem.attack, inventoryItem.health, inventoryItem.critical, inventoryItem.defense);
                // 从背包中移除新装备
                this.player.inventory = this.player.inventory.filter(item => item.id !== id);
                // 重置类型
                type = '';
                // 关闭道具信息弹窗
                this.inventoryShow = false;
                // 更新玩家存档
                this.$store.commit('setPlayer', this.player);
            },
            // 卸装备
            equipmentClose (type) {
                const { inventory, equipment } = this.player;
                if (!equipment[type]) return;
                // 更新玩家属性，移除当前穿戴装备的属性加成
                this.playerAttribute(-equipment[type].dodge, -equipment[type].attack, -equipment[type].health, -equipment[type].critical, -equipment[type].defense);
                // 跳转背包相关页
                this.inventoryActive = type;
                // 给装备增加id
                equipment[type].id = Date.now();
                // 添加装备到背包里
                inventory.push(equipment[type]);
                // 清空身上当前类型的装备
                equipment[type] = null;
                // 更新玩家存档
                this.$store.commit('setPlayer', this.player);
            },
            // 根据装备ID给出信息
            getObjectById (id, arr) {
                return arr.find(obj => obj.id === id);
            },
            // 玩家属性操作
            playerAttribute (dodge = 0, attack = 0, health = 0, critical = 0, defense = 0) {
                // 闪避
                this.player.dodge = this.player.dodge + dodge;
                // 攻击
                this.player.attack = this.player.attack + attack;
                // 血量
                this.player.health = this.player.health + health;
                this.player.maxHealth = this.player.maxHealth + health;
                // 暴击
                this.player.critical = this.player.critical + critical;
                // 防御
                this.player.defense = this.player.defense + defense;
            },
            // 定义Notification
            notify (data) {
                this.$notify.closeAll();
                this.$notify(data);
            }
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

    .game-box {
        position: relative;
    }

    .setting {
        position: absolute;
        left: 0;
        top: -20px;
        font-size: 20px;
        margin-top: 10px;
    }

    .bbh {
        color: #ccc;
        font-size: 15px;
        text-align: center;
        position: absolute;
        bottom: 10px;
        left: 0;
        right: 0;
    }

    .dialog-footer {
        display: flex;
        justify-content: center;
    }

    .dialog-footer-button:nth-child(2) {
        margin-right: 10px;
    }

    .dialog-upload {
        margin-right: 10px;
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

    .attributes {
        display: flex;
        justify-content: center;
    }


    .attribute {
        width: calc(50% - 8px);
        margin: 4px;
    }

    .attribute-box {
        display: flex;
        flex-wrap: wrap;
    }

    .equip-box {
        padding: 0 3px;
        margin-top: 4px;
        display: flex;
        flex-direction: column;
    }

    .equip-item {
        margin-bottom: 8px;
        height: 40px;
        line-height: 38px;
    }

    .equip {
        margin-left: 10px;
    }

    .inventory-box {
        white-space: pre-wrap;
        min-height: 40px;
        line-height: 38px;
        height: auto;
    }

    .inventory-content {
        margin-bottom: 15px;
        height: 120px;
        overflow: auto;
    }

    .Illustrations .inventory-content {
        height: 500px;
        display: flex;
        flex-wrap: wrap;
    }

    .Illustrations .Illustration-item {
        width: 20%;
    }

    .inventory-item {
        margin: 4px;
    }

    .actions {
        margin: 1rem 0;
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
        .title {
            font-size: 20px;
        }

        .game-container {
            min-height: 574px;
            min-width: 356px;
        }

        .actions {
            display: flex;
            flex-direction: column;
            justify-content: center;
        }

        .actions * {
            margin-top: 10px;
        }

        .actions *:nth-child(1) {
            margin-left: 10px;
        }

        .dialog-footer {
            flex-direction: column;
        }

        .dialog-footer-button {
            margin-top: 10px;
            width: 100%;
        }

        .dialog-footer-button:nth-child(2),
        .dialog-footer-button:nth-child(5) {
            position: relative;
            right: 10px;
        }

        .dialog-footer-button:nth-child(2+n) {
            margin-top: 10px;
            width: 100%;
        }

        .dialog-upload {
            margin-right: 0;
        }

        .equip-box {
            padding: 0 5px;
        }

        .Illustrations .Illustration-item {
            width: 33%;
        }
    }

    .danger.el-icon-caret-bottom {
        color: #f56c6c;
        margin-left: 5px;
    }

    .success.el-icon-caret-top {
        color: #67c23a;
        margin-left: 5px;
    }

    /* 装备信息 */
    .monsterinfo {
        display: flex;
        justify-content: center;
    }

    .monsterinfo-box {
        display: grid;
        grid-template-columns: 1fr 20px 1fr;
        gap: 10px;
    }

    .monsterinfo-box p {
        display: contents;
    }

    .description {
        text-align: left;
    }

    .icon {
        text-align: center;
    }

    .value {
        text-align: left;
    }

    /* 炼器弹窗 */
    .strengthen-box {
        padding: 0 5px;
    }

    .click-box {
        padding: 0 5px;
        margin-top: 10px;
    }

    .click-box button {
        margin-top: 10px;
        width: 100%;
    }
</style>

<style>
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

    .attribute .pet {
        border-color: transparent !important;
        background-color: transparent !important;
    }

    @media only screen and (max-width: 750px) {
        .el-message-box {
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
    }
</style>