<template>
  <div class="index">
    <div class="index-box">
      <div class="story">
        <p v-html="storyText" />
      </div>
      <div class="attributes">
        <div class="attribute-box">
          <div
            class="tag attribute"
            @click="isLevel = true"
          >
            境界: {{ $levelNames(player.level) }} ({{ player.reincarnation || 0 }}转) <i class="el-icon-warning-outline" />
          </div>
          <div
            class="tag attribute"
            v-if="player.level >= this.$maxLv"
          >
            修为: 登峰造极
          </div>
          <div
            class="tag attribute"
            v-else
            @click="$notify({title: '提示', message: `您距离${$levelNames(player.level + 1)}境界还需${$formatNumberToChineseUnit(player.maxCultivation - player.cultivation)}点修为`})"
          >
            修为: {{ calculatePercentageDifference(player.maxCultivation, player.cultivation) }} <i class="el-icon-warning-outline" />
          </div>
          <div class="tag attribute">
            气血: {{ $formatNumberToChineseUnit(player.health) }} / {{ $formatNumberToChineseUnit(player.maxHealth) }}
            <i
              class="el-icon-circle-plus-outline"
              v-if="player.points > 0"
              @click="attributePoints('health')"
            />
          </div>
          <div class="tag attribute">
            攻击: {{ $formatNumberToChineseUnit(player.attack) }}
            <i
              class="el-icon-circle-plus-outline"
              v-if="player.points > 0"
              @click="attributePoints('attack')"
            />
          </div>
          <div class="tag attribute">
            防御: {{ $formatNumberToChineseUnit(player.defense) }}
            <i
              class="el-icon-circle-plus-outline"
              v-if="player.points > 0"
              @click="attributePoints('defense')"
            />
          </div>
          <div class="tag attribute">
            闪避率: {{ player.dodge > 0 ? (player.dodge * 100 > 100 ? 100 : (player.dodge * 100).toFixed(2)) : 0 }}%
          </div>
          <div class="tag attribute">
            暴击率: {{ player.critical > 0 ? (player.critical * 100 > 100 ? 100 : (player.critical * 100).toFixed(2)) : 0 }}%
          </div>
          <div class="tag attribute">
            个人战力: {{ $formatNumberToChineseUnit(player.score) }}
          </div>
          <div
            class="tag attribute"
            @click="$notify({title: '获得方式', message: '每提成一次境界可以获得3点境界点'})"
          >
            境界点: {{ $formatNumberToChineseUnit(player.points) }} <i class="el-icon-warning-outline" />
          </div>
          <div
            class="tag attribute"
            @click="$notify({title: '获得方式', message: '每转生一次可以增加50容量'})"
          >
            背包总容量: {{ player.backpackCapacity }} <i class="el-icon-warning-outline" />
          </div>
        </div>
      </div>
      <div class="equip-box">
        <div class="tag equip-item">
          <span class="equip">
            <span>神兵: </span>
            <el-tag
              v-if="player.equipment.weapon?.name"
              :type="player.equipment.weapon?.quality"
              :closable="player.equipment.weapon?.name ? true : false"
              @close="equipmentClose('weapon')"
              @click="equipmentInfo('weapon')"
            >
              {{ player.equipment.weapon?.name }}{{ player.equipment.weapon?.strengthen ? '+' + player.equipment.weapon?.strengthen : '' }}
            </el-tag>
            <span v-else>无</span>
          </span>
          <span class="equip">
            <span>护甲: </span>
            <el-tag
              v-if="player.equipment.armor?.name"
              :type="player.equipment.armor?.quality"
              :closable="player.equipment.armor?.name ? true : false"
              @close="equipmentClose('armor')"
              @click="equipmentInfo('armor')"
            >
              {{ player.equipment.armor?.name }}{{ player.equipment.armor?.strengthen ? '+' + player.equipment.armor?.strengthen : '' }}
            </el-tag>
            <span v-else>无</span>
          </span>
        </div>
        <div class="tag equip-item">
          <span class="equip">
            <span>灵宝: </span>
            <el-tag
              v-if="player.equipment.accessory?.name"
              :type="player.equipment.accessory?.quality"
              :closable="!!player.equipment.accessory?.name"
              @close="equipmentClose('accessory')"
              @click="equipmentInfo('accessory')"
            >
              {{ player.equipment.accessory?.name }}{{ player.equipment.accessory?.strengthen ? '+' + player.equipment.accessory?.strengthen : '' }}
            </el-tag>
            <span v-else>无</span>
          </span>
          <span class="equip">
            <span>法器: </span>
            <el-tag
              v-if="player.equipment.sutra?.name"
              :type="player.equipment.sutra?.quality"
              :closable="!!player.equipment.sutra?.name"
              @close="equipmentClose('sutra')"
              @click="equipmentInfo('sutra')"
            >
              {{ player.equipment.sutra?.name }}{{ player.equipment.sutra?.strengthen ? '+' + player.equipment.sutra?.strengthen : '' }}
            </el-tag>
            <span v-else>无</span>
          </span>
        </div>
        <div class="tag equip-item">
          <span class="equip">
            <span>道侣: </span>
            <el-tag
              class="pet"
              v-if="player.wife?.name"
              closable
              @close="wifeRevoke"
              @click="wifeItemShow = true"
            >
              {{ player.wife?.name }}
            </el-tag>
            <span v-else>无</span>
          </span>
          <span class="equip">
            <span>灵宠: </span>
            <el-tag
              class="pet"
              v-if="player.pet?.name"
              :type="computePetsLevel(player.pet?.level)"
              closable
              @close="petRetract"
              @click="petItemShow = true"
            >
              {{ player.pet?.name }}({{ $levelNames(player.pet.level) }})
            </el-tag>
            <span v-else>无</span>
          </span>
        </div>
        <div class="tag inventory-box">
          <el-tabs
            v-model="inventoryActive"
            :stretch="true"
            @tab-click="tabClick"
          >
            <el-tab-pane
              label="装备"
              name="equipment"
            >
              <el-dropdown
                trigger="click"
                @command="equipmentDropdown"
                v-if="player.inventory.length"
              >
                <span class="el-dropdown-link">
                  装备排序<i class="el-icon-arrow-down el-icon--right" />
                </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item
                    :command="item.type"
                    v-for="(item, index) in $dropdownType"
                    :key="index"
                    :disabled="equipmentDropdownActive == item.type"
                  >
                    根据{{ item.name }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
              <el-tabs v-model="equipmentActive">
                <el-tab-pane
                  :label="i.name"
                  :name="i.type"
                  v-for="(i, k) in backPackItem"
                  :key="k"
                >
                  <div class="inventory-content">
                    <div v-if="player.inventory.length">
                      <template v-for="item in player.inventory">
                        <el-tag
                          class="inventory-item"
                          v-if="item.type == i.type"
                          :key="item.id"
                          :type="item?.quality"
                          :closable="!item.lock"
                          @close="inventoryClose(item)"
                          @click="inventory(item.id, item.type)"
                        >
                          <i :class="item.lock ? 'el-icon-lock' : 'el-icon-unlock'" />
                          {{ item?.name }}{{ item?.strengthen ? '+' + item?.strengthen : '' }}
                        </el-tag>
                      </template>
                    </div>
                    <el-tag
                      type="success"
                      class="dialog-footer-button"
                      :disable-transitions="true"
                      v-if="!player.isNewbie"
                      @click="newbiePack(4)"
                    >
                      领取新手礼包
                    </el-tag>
                  </div>
                </el-tab-pane>
              </el-tabs>
            </el-tab-pane>
            <el-tab-pane
              label="道具"
              name="props"
            >
              <div class="inventory-content">
                <template v-for="(item, index) in sortedProps" :key="index">
                  <el-tag
                      class="inventory-item"
                      @click="$notify({title: '获得方式', message: $propItemNames[item.name].desc})"
                  >
                    {{ $propItemNames[item.name].name }}({{ item.num }})
                  </el-tag>
                </template>
              </div>
            </el-tab-pane>
            <el-tab-pane
              label="灵宠"
              name="pet"
            >
              <el-dropdown
                trigger="click"
                @command="petDropdown"
                v-if="player.pets.length"
              >
                <span class="el-dropdown-link">
                  灵宠排序<i class="el-icon-arrow-down el-icon--right" />
                </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item
                    :command="item.type"
                    v-for="(item, index) in $dropdownType"
                    :key="index"
                    :disabled="petDropdownActive == item.type"
                  >
                    根据{{ item.name }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
              <div class="inventory-content">
                <template v-for="(item, index) in player.pets" :key="index">
                  <el-tag
                    class="inventory-item"
                    :type="computePetsLevel(item.level)"
                    closable
                    @close="petClose(item)"
                    @click="petItemInfo(item)"
                  >
                    <i :class="item.lock ? 'el-icon-lock' : 'el-icon-unlock'" />
                    {{ item.name }}({{ $levelNames(item.level) }})
                  </el-tag>
                </template>
              </div>
            </el-tab-pane>
            <el-tab-pane
              label="道侣"
              name="wife"
            >
              <div class="inventory-content">
                <template v-for="(item, index) in player.wifes" :key="index">
                  <el-tag
                    class="inventory-item"
                    @click="wifeItemInfo(item)"
                  >
                    {{ item.name }}
                  </el-tag>
                </template>
              </div>
            </el-tab-pane>
            <el-tab-pane
              label="鸿蒙商店"
              name="shop"
            >
              <div class="el-dropdown">
                <span
                  class="el-dropdown-link el-dropdown-selfdefine"
                  @click="refreshShop"
                >刷新商店<i class="el-icon-refresh el-icon--right" /></span>
              </div>
              <el-tabs
                v-model="shopActive"
                :stretch="true"
              >
                <el-tab-pane
                  :label="i.name"
                  :name="i.type"
                  v-for="(i, k) in player.shopData"
                  :key="k"
                >
                  <div class="inventory-content">
                    <template v-for="(item, index) in i.data">
                      <el-tag
                        class="inventory-item"
                        :type="item.quality"
                        v-if="item.type == i.type"
                        :key="index"
                        @click="shopItemInfo(item)"
                      >
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
        <div
          class="action"
          v-for="(action, index) in actions"
          :key="index"
        >
          <el-button
            class="item"
            :type="action.type ? action.type : ''"
            @click="action.handler"
          >
            {{ action.text }}
          </el-button>
        </div>
        <div class="action">
          <el-button
            class="item"
            @click="show = true"
          >
            数据管理
          </el-button>
        </div>
      </div>
    </div>
    <el-drawer
      title="修仙境界表"
      v-model="isLevel"
      direction="ltr"
      class="levels"
    >
      <el-tag
        class="inventory-item"
        :type="player.level == index ? 'primary' : (index > player.level ? 'danger' : 'success')"
        :key="index"
        v-for="(item, index) in 144"
      >
        {{ $levelNames(item) }}
      </el-tag>
    </el-drawer>
    <el-drawer
      :title="player.wife.name"
      v-model="wifeItemShow"
      direction="rtl"
      class="strengthen"
    >
      <div class="strengthen-box">
        <div class="attributes">
          <div class="attribute-box">
            <div class="tag attribute">
              境界: {{ $levelNames(player.wife.level) }}
            </div>
            <div class="tag attribute">
              气血: {{ $formatNumberToChineseUnit(player.wife.health) }}
            </div>
            <div class="tag attribute">
              攻击: {{ $formatNumberToChineseUnit(player.wife.attack) }}
            </div>
            <div class="tag attribute">
              防御: {{ $formatNumberToChineseUnit(player.wife.defense) }}
            </div>
            <div
              class="tag attribute"
              @click="$notify({title: '获得方式', message: '可以通过赠送礼物给NPC获得', position: 'top-left'})"
            >
              拥有情缘点: {{ $formatNumberToChineseUnit(player.props.qingyuan) }}
            </div>
            <div class="tag attribute">
              升级消耗: {{ player.wife.level * 10 }}
            </div>
          </div>
        </div>
        <div class="click-box">
          <el-button
            type="primary"
            @click="wifeUpgrade(player.wife)"
            :disabled="player.wife.level >= $maxLv"
          >
            {{ player.wife.level >= $maxLv ? '道侣等级已满' : '道侣升级' }}
          </el-button>
        </div>
      </div>
    </el-drawer>
    <el-drawer
      :title="player.pet.name"
      v-model="petItemShow"
      direction="rtl"
      class="strengthen"
    >
      <div class="strengthen-box">
        <div class="attributes">
          <div class="attribute-box">
            <div class="tag attribute">
              境界: {{ $levelNames(player.pet.level) }} ({{ player.pet.reincarnation || 0 }}转)
            </div>
            <div class="tag attribute">
              悟性: {{ player.pet.rootBone }}
            </div>
            <div class="tag attribute">
              气血: {{ $formatNumberToChineseUnit(player.pet.health) }}
            </div>
            <div class="tag attribute">
              攻击: {{ $formatNumberToChineseUnit(player.pet.attack) }}
            </div>
            <div class="tag attribute">
              防御: {{ $formatNumberToChineseUnit(player.pet.defense) }}
            </div>
            <div class="tag attribute">
              灵宠评分: {{ $formatNumberToChineseUnit(player.pet.score) }}
            </div>
            <div
              class="tag attribute"
              @click="$notify({title: '获得方式', message: '可以通过探索秘境获得', position: 'top-left'})"
            >
              拥有培养丹: {{ $formatNumberToChineseUnit(player.props.cultivateDan) }}
            </div>
            <div
              class="tag attribute"
              @click="$notify({title: '获得方式', message: '可以通过击败世界BOSS获得', position: 'top-left'})"
            >
              拥有悟性丹: {{ $formatNumberToChineseUnit(player.props.rootBone) }}
            </div>
            <div class="tag attribute">
              培养消耗: {{ petConsumption(player.pet.level) }}
            </div>
            <div class="tag attribute">
              提升悟性消耗: {{ petRootBone ? player.pet.rootBone : 0 }}
            </div>
          </div>
        </div>
        <div class="click-box">
          <el-checkbox v-model="petReincarnation">
            灵宠转生
          </el-checkbox>
          <el-checkbox v-model="petRootBone">
            提升悟性
          </el-checkbox>
          <el-button
            type="primary"
            @click="petUpgrade(player.pet)"
          >
            点击培养
          </el-button>
        </div>
      </div>
    </el-drawer>
    <el-drawer
      title="装备炼器"
      v-model="strengthenShow"
      direction="rtl"
      class="strengthen"
    >
      <div
        class="strengthen-box"
        v-if="strengthenShow"
      >
        <div class="attributes">
          <div class="attribute-box">
            <div class="tag attribute">
              气血: {{ $formatNumberToChineseUnit(strengthenInfo.health) }}
            </div>
            <div class="tag attribute">
              攻击: {{ $formatNumberToChineseUnit(strengthenInfo.attack) }}
            </div>
            <div class="tag attribute">
              防御: {{ $formatNumberToChineseUnit(strengthenInfo.defense) }}
            </div>
            <div class="tag attribute">
              炼器等级: {{ strengthenInfo.strengthen ?? 0 }}
            </div>
            <div class="tag attribute">
              装备评分: {{ $formatNumberToChineseUnit(strengthenInfo.score) }}
            </div>
            <div
              class="tag attribute"
              @click="$notify({title: '获得方式', message: '分解装备可获取', position: 'top-left'})"
            >
              拥有炼器石: {{ $formatNumberToChineseUnit(player.props.strengtheningStone) }}
            </div>
            <div class="tag attribute">
              炼器消耗: {{ calculateCost(strengthenInfo) }}
            </div>
            <div class="tag attribute">
              成功率: {{ (calculateEnhanceSuccessRate(strengthenInfo) * 100).toFixed(2) }}%
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
          <el-button
            type="primary"
            @click="enhance(strengthenInfo)"
          >
            点击炼器
          </el-button>
        </div>
      </div>
    </el-drawer>
    <el-dialog
      :title="petInfo.name"
      v-model="petShow"
      center
      width="420px"
    >
      <div class="monsterinfo">
        <div class="monsterinfo-box">
          <p>
            <span class="description">境界: {{ $levelNames(petInfo?.level) }}</span>
            <span class="icon">
              <i :class="calculateDifference(petInfo?.level, player.pet?.level).icon" />
            </span>
            <span class="value">
              {{ petInfo.level > parseInt(player.pet?.level || 0) ? $levelNames(petInfo.level) : $levelNames(player.pet?.level) }}
            </span>
          </p>
          <p>
            <span class="description">转生: {{ petInfo?.reincarnation || 0 }}</span>
            <span class="icon">
              <i :class="calculateDifference(petInfo?.reincarnation, player.pet?.reincarnation).icon" />
            </span>
            <span class="value">{{ calculateDifference(petInfo?.reincarnation, player.pet?.reincarnation).num }}</span>
          </p>
          <p>
            <span class="description">气血: {{ petInfo?.health }}</span>
            <span class="icon">
              <i :class="calculateDifference(petInfo?.health, player.pet?.health).icon" />
            </span>
            <span class="value">{{ calculateDifference(petInfo?.health, player.pet?.health).num }}</span>
          </p>
          <p>
            <span class="description">攻击: {{ petInfo?.attack }}</span>
            <span class="icon">
              <i :class="calculateDifference(petInfo?.attack, player.pet?.attack).icon" />
            </span>
            <span class="value">{{ calculateDifference(petInfo?.attack, player.pet?.attack).num }}</span>
          </p>
          <p>
            <span class="description">防御: {{ petInfo?.defense }}</span>
            <span class="icon">
              <i :class="calculateDifference(petInfo?.defense, player.pet?.defense).icon" />
            </span>
            <span class="value">{{ calculateDifference(petInfo?.defense, player.pet?.defense).num }}</span>
          </p>
          <p>
            <span class="description">闪避率: {{ petInfo?.dodge > 0 ? (petInfo?.dodge * 100 > 100 ? 100 : (petInfo?.dodge * 100).toFixed(2)) : 0 }}%</span>
            <span class="icon">
              <i :class="calculateDifference(petInfo?.dodge, player.pet?.dodge).icon" />
            </span>
            <span class="value">{{ calculateDifference(petInfo?.dodge, player?.pet?.dodge).num }}</span>
          </p>
          <p>
            <span class="description">暴击率: {{ petInfo?.critical > 0 ? (petInfo?.critical * 100 > 100 ? 100 : (petInfo?.critical * 100).toFixed(2)) : 0 }}%</span>
            <span class="icon">
              <i :class="calculateDifference(petInfo?.critical, player.pet?.critical).icon" />
            </span>
            <span class="value">{{ calculateDifference(petInfo?.critical, player.pet?.critical).num }}</span>
          </p>
          <p>
            <span class="description">灵宠评分: {{ petInfo?.score }}</span>
            <span class="icon">
              <i :class="calculateDifference(petInfo?.score, player.pet?.score).icon" />
            </span>
            <span class="value">{{ calculateDifference(petInfo?.score, player.pet?.score).num }}</span>
          </p>
        </div>
      </div>
      <el-collapse
        v-model="petCollapse"
        class="collapse"
      >
        <el-collapse-item
          title="基础属性对比"
          name="1"
        >
          <div class="monsterinfo-box">
            <p>
              <span class="description">气血: {{ petInfo?.initial?.health }}</span>
              <span class="icon">
                <i :class="calculateDifference(petInfo?.initial?.health, player.pet?.initial?.health).icon" />
              </span>
              <span class="value">{{ calculateDifference(petInfo?.initial?.health, player.pet?.initial?.health).num }}</span>
            </p>
            <p>
              <span class="description">攻击: {{ petInfo?.initial?.attack }}</span>
              <span class="icon">
                <i :class="calculateDifference(petInfo?.initial?.attack, player.pet?.initial?.attack).icon" />
              </span>
              <span class="value">{{ calculateDifference(petInfo?.initial?.attack, player.pet?.initial?.attack).num }}</span>
            </p>
            <p>
              <span class="description">防御: {{ petInfo?.initial?.defense }}</span>
              <span class="icon">
                <i :class="calculateDifference(petInfo?.initial?.defense, player.pet?.initial?.defense).icon" />
              </span>
              <span class="value">{{ calculateDifference(petInfo?.initial?.defense, player.pet?.initial?.defense).num }}</span>
            </p>
            <p>
              <span class="description">
                闪避率: {{ petInfo?.initial?.dodge > 0 ? (petInfo?.initial?.dodge * 100 > 100 ? 100 : (petInfo?.initial?.dodge * 100).toFixed(2)) : 0 }}%
              </span>
              <span class="icon">
                <i :class="calculateDifference(petInfo?.initial?.dodge, player.pet?.initial?.dodge).icon" />
              </span>
              <span class="value">{{ calculateDifference(petInfo?.initial?.dodge, player.pet?.initial?.dodge).num }}</span>
            </p>
            <p>
              <span class="description">
                暴击率: {{ petInfo?.initial?.critical > 0 ? (petInfo?.initial?.critical * 100 > 100 ? 100 : (petInfo?.initial?.critical * 100).toFixed(2)) : 0 }}%
              </span>
              <span class="icon">
                <i :class="calculateDifference(petInfo?.initial?.critical, player.pet?.initial?.critical).icon" />
              </span>
              <span class="value">{{ calculateDifference(petInfo?.initial?.critical, player.pet?.initial?.critical).num }}</span>
            </p>
          </div>
        </el-collapse-item>
      </el-collapse>
      <div class="dialog-footer">
        <el-button
          type="plain"
          class="dialog-footer-button"
          @click="petLock(petInfo)"
        >
          灵宠{{ petInfo.lock ? '解锁' : '锁定' }}
        </el-button>
        <el-button
          type="plain"
          class="dialog-footer-button"
          @click="petClose(petInfo)"
        >
          灵宠放生
        </el-button>
        <el-button
          type="primary"
          class="dialog-footer-button"
          @click="petCarry(petInfo)"
        >
          灵宠出战
        </el-button>
      </div>
    </el-dialog>
    <el-dialog
      :title="inventoryInfo.name"
      v-model="inventoryShow"
      center
      width="420px"
    >
      <div
        class="monsterinfo"
        v-if="inventoryShow"
      >
        <div class="monsterinfo-box">
          <p>
            <span class="description">类型: {{ $genre[inventoryInfo.type] }}</span>
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
            <span class="description">境界: {{ $levelNames(inventoryInfo.level) }}</span>
            <span class="icon">
              <i :class="calculateDifference(inventoryInfo.level, player.equipment[inventoryInfo.type]?.level).icon" />
            </span>
            <span class="value">
              {{ inventoryInfo.level > parseInt(player.equipment[inventoryInfo.type]?.level || 1) ? $levelNames(inventoryInfo.level) : $levelNames(player.equipment[inventoryInfo.type]?.level) }}
            </span>
          </p>
          <p>
            <span class="description">品质: {{ $levels[inventoryInfo.quality] }}</span>
            <span class="icon">
              <i :class="calculateDifference(levelsNum[inventoryInfo.quality], levelsNum[player.equipment[inventoryInfo.type]?.quality]).icon" />
            </span>
            <span class="value">
              {{ calculateDifference(levelsNum[inventoryInfo.quality], levelsNum[player.equipment[inventoryInfo.type]?.quality]).num < 0 ? $levels[player.equipment[inventoryInfo.type]?.quality] : $levels[inventoryInfo.quality] }} </span>
          </p>
          <p>
            <span class="description">气血: {{ inventoryInfo?.health }}</span>
            <span class="icon">
              <i :class="calculateDifference(inventoryInfo?.health, player.equipment[inventoryInfo.type]?.health).icon" />
            </span>
            <span class="value">{{ calculateDifference(inventoryInfo?.health, player.equipment[inventoryInfo.type]?.health).num }}</span>
          </p>
          <p>
            <span class="description">攻击: {{ inventoryInfo?.attack }}</span>
            <span class="icon">
              <i :class="calculateDifference(inventoryInfo?.attack, player.equipment[inventoryInfo.type]?.attack).icon" />
            </span>
            <span class="value">{{ calculateDifference(inventoryInfo?.attack, player.equipment[inventoryInfo.type]?.attack).num }}</span>
          </p>
          <p>
            <span class="description">防御: {{ inventoryInfo?.defense }}</span>
            <span class="icon">
              <i :class="calculateDifference(inventoryInfo?.defense, player.equipment[inventoryInfo.type]?.defense).icon" />
            </span>
            <span class="value">{{ calculateDifference(inventoryInfo?.defense, player.equipment[inventoryInfo.type]?.defense).num }}</span>
          </p>
          <p>
            <span class="description">闪避率: {{ inventoryInfo?.dodge > 0 ? (inventoryInfo?.dodge * 100 > 100 ? 100 : (inventoryInfo?.dodge * 100).toFixed(2)) : 0 }}%</span>
            <span class="icon">
              <i :class="calculateDifference(inventoryInfo?.dodge, player.equipment[inventoryInfo.type]?.dodge).icon" />
            </span>
            <span class="value">{{ calculateDifference(inventoryInfo?.dodge, player.equipment[inventoryInfo.type]?.dodge).num }}</span>
          </p>
          <p>
            <span class="description">暴击率: {{ inventoryInfo?.critical > 0 ? (inventoryInfo?.critical * 100 > 100 ? 100 : (inventoryInfo?.critical * 100).toFixed(2)) : 0 }}%</span>
            <span class="icon">
              <i :class="calculateDifference(inventoryInfo?.critical, player.equipment[inventoryInfo.type]?.critical).icon" />
            </span>
            <span class="value">{{ calculateDifference(inventoryInfo?.critical, player.equipment[inventoryInfo.type]?.critical).num }}</span>
          </p>
          <p>
            <span class="description">装备评分: {{ inventoryInfo?.score }}</span>
            <span class="icon">
              <i :class="calculateDifference(inventoryInfo?.score, player.equipment[inventoryInfo.type]?.score).icon" />
            </span>
            <span class="value">{{ calculateDifference(inventoryInfo?.score, player.equipment[inventoryInfo.type]?.score).num }}</span>
          </p>
        </div>
      </div>
      <el-collapse
        v-model="inventoryCollapse"
        class="collapse"
      >
        <el-collapse-item
          title="基础属性对比"
          name="1"
        >
          <div class="monsterinfo-box">
            <p>
              <span class="description">气血: {{ inventoryInfo?.initial?.health }}</span>
              <span class="icon">
                <i :class="calculateDifference(inventoryInfo?.initial?.health, player.equipment[inventoryInfo.type]?.initial?.health).icon" />
              </span>
              <span class="value">{{ calculateDifference(inventoryInfo?.initial?.health, player.equipment[inventoryInfo.type]?.initial?.health).num }}</span>
            </p>
            <p>
              <span class="description">攻击: {{ inventoryInfo?.initial?.attack }}</span>
              <span class="icon">
                <i :class="calculateDifference(inventoryInfo?.initial?.attack, player.equipment[inventoryInfo.type]?.initial?.attack).icon" />
              </span>
              <span class="value">{{ calculateDifference(inventoryInfo?.initial?.attack, player.equipment[inventoryInfo.type]?.initial?.attack).num }}</span>
            </p>
            <p>
              <span class="description">防御: {{ inventoryInfo?.initial?.defense }}</span>
              <span class="icon">
                <i :class="calculateDifference(inventoryInfo?.initial?.defense, player.equipment[inventoryInfo.type]?.initial?.defense).icon" />
              </span>
              <span class="value">{{ calculateDifference(inventoryInfo?.initial?.defense, player.equipment[inventoryInfo.type]?.initial?.defense).num }}</span>
            </p>
            <p>
              <span class="description">
                闪避率: {{ inventoryInfo?.initial?.dodge > 0 ? (inventoryInfo?.initial?.dodge * 100 > 100 ? 100 : (inventoryInfo?.initial?.dodge * 100).toFixed(2)) : 0 }}%
              </span>
              <span class="icon">
                <i :class="calculateDifference(inventoryInfo?.initial?.dodge, player.equipment[inventoryInfo.type]?.initial?.dodge).icon" />
              </span>
              <span class="value">{{ calculateDifference(inventoryInfo?.initial?.dodge, player.equipment[inventoryInfo.type]?.initial?.dodge).num }}</span>
            </p>
            <p>
              <span class="description">
                暴击率: {{ inventoryInfo?.initial?.critical > 0 ? (inventoryInfo?.initial?.critical * 100 > 100 ? 100 : (inventoryInfo?.initial?.critical * 100).toFixed(2)) : 0 }}%
              </span>
              <span class="icon">
                <i :class="calculateDifference(inventoryInfo?.initial?.critical, player.equipment[inventoryInfo.type]?.initial?.critical).icon" />
              </span>
              <span class="value">{{ calculateDifference(inventoryInfo?.initial?.critical, player.equipment[inventoryInfo.type]?.initial?.critical).num }}</span>
            </p>
          </div>
        </el-collapse-item>
      </el-collapse>
      <div class="dialog-footer">
        <el-button
          type="plain"
          class="inventory-button"
          @click="inventoryClose(inventoryInfo)"
        >
          装备分解
        </el-button>
        <el-button
          type="plain"
          class="inventory-button"
          @click="inventoryLock(inventoryInfo.id)"
        >
          {{ inventoryInfo.lock ? '装备解锁' : '装备锁定' }}
        </el-button>
        <el-button
          type="primary"
          class="inventory-button"
          @click="equipItem(inventoryInfo.id, inventoryInfo.type)"
        >
          立即装备
        </el-button>
      </div>
    </el-dialog>
    <el-dialog
      title="批量处理"
      v-model="sellingEquipmentShow"
      width="600px"
    >
      <el-divider>装备</el-divider>
      <el-checkbox-group
        v-model="player.sellingEquipmentData"
        @change="sellingEquipmentDataChange"
      >
        <el-checkbox
          v-for="(item, index) in AllEquipmenType"
          :label="item"
          :key="index"
        >
          {{ $levels[item] }}
        </el-checkbox>
      </el-checkbox-group>
      <div
        class="dialog-footer"
        style="margin-top: 20px;"
      >
        <el-button
          class="dialog-footer-button"
          @click="sellingEquipment"
        >
          分解装备
        </el-button>
      </div>
      <el-divider>灵宠</el-divider>
      <div
        class="dialog-footer"
        style="margin-top: 20px;"
      >
        <el-button
          class="dialog-footer-button"
          @click="sellingPet"
        >
          放生灵宠
        </el-button>
      </div>
    </el-dialog>
    <el-dialog
      title="数据管理"
      v-model="show"
      width="600px"
    >
      <div class="dialog-footer">
        <el-button
          type="info"
          class="dialog-footer-button"
          @click="exportData"
        >
          导出存档
        </el-button>
        <el-upload
          action="#"
          class="dialog-upload"
          :http-request="importData"
          :show-file-list="false"
          accept="application/json"
        >
          <el-button
            type="warning"
            class="dialog-footer-button"
          >
            导入存档
          </el-button>
        </el-upload>
        <el-button
          type="danger"
          class="dialog-footer-button"
          @click="deleteData"
        >
          删除存档
        </el-button>
        <el-button
          type="primary"
          class="dialog-footer-button"
          @click="qq"
        >
          官方群聊
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
    // 商店
    import shop from '@/plugins/shop';
    // 装备
    import equip from '@/plugins/equip';
    // 解密
    import crypto from '@/plugins/crypto';

    export default {
        data () {
            return {
                show: false,
                // 玩家属性
                player: {
                    // 当前携带的灵宠
                    pet: {},
                    // 已收服的灵宠
                    pets: [],
                    // 当前跟随的道侣
                    wife: {},
                    // 已拥有的道侣
                    wifes: [],
                    // 道具
                    props: {
                        // 灵石
                        money: 0,
                        // 传送符
                        flying: 0,
                        // 情缘
                        qingyuan: 0,
                        // 悟性丹
                        rootBone: 0,
                        // 鸿蒙石数量
                        currency: 0,
                        // 培养丹数量
                        cultivateDan: 0,
                        // 炼器石数量
                        strengtheningStone: 0,
                    },
                    // 人物评分
                    score: 0,
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
                    // 商店数据
                    shopData: [],
                    // 总气血
                    maxHealth: 100,
                    // 背包道具
                    inventory: [],
                    // 装备
                    equipment: {
                        // 法器
                        sutra: {},
                        // 护甲
                        armor: {},
                        // 神兵
                        weapon: {},
                        // 灵宝
                        accessory: {}
                    },
                    // 成就
                    achievement: {
                        pet: [
                            { id: 1, state: false },
                            { id: 2, state: false },
                            { id: 3, state: false },
                            { id: 4, state: false },
                            { id: 5, state: false },
                            { id: 6, state: false },
                        ],
                        monster: [],
                        equipment: []
                    },
                    // 当前修为
                    cultivation: 0,
                    // 转生次数
                    reincarnation: 0,
                    // 下个境界所需修为
                    maxCultivation: 100,
                    // 背包总容量
                    backpackCapacity: 50,
                    // 批量分解装备设置
                    sellingEquipmentData: []
                },
                actions: [],
                isLevel: false,
                // 灵宠信息弹窗
                petShow: false,
                // 灵宠数据
                petInfo: {},
                // 炼器保护
                protect: false,
                // 炼器增幅
                increase: false,
                levelsNum: {
                    info: 1,
                    pink: 7,
                    danger: 6,
                    purple: 4,
                    primary: 3,
                    success: 2,
                    warning: 5,
                },
                storyText: '',
                // 商店商品价格
                shopPrice: 100,
                shopActive: 'weapon',
                // 灵宠信息弹窗
                petItemShow: false,
                backPackItem: [
                    { type: 'weapon', name: '神兵' },
                    { type: 'armor', name: '护甲' },
                    { type: 'accessory', name: '灵宝' },
                    { type: 'sutra', name: '法器' }
                ],
                petRootBone: false,
                petCollapse: '',
                // 道侣弹窗
                wifeItemShow: false,
                // 装备信息
                inventoryInfo: {},
                // 装备信息弹窗
                inventoryShow: false,
                // 炼器弹窗
                strengthenShow: false,
                // 炼器的信息
                strengthenInfo: {},
                // 选择分解的装备品阶
                checkedEquipmen: [],
                inventoryActive: 'equipment',
                equipmentActive: 'weapon',
                // 所有装备品阶
                AllEquipmenType: ['info', 'success', 'primary', 'purple', 'warning', 'danger', 'pink'],
                // 灵宠转生勾选状态
                petReincarnation: false,
                inventoryCollapse: '',
                // 批量分解弹窗
                sellingEquipmentShow: false,
                petDropdownActive: '',
                equipmentDropdownActive: ''
            }
        },
        computed: {
            // 道具背包对象转数组
            sortedProps () {
                const obj = this.player.props;
                return Object.keys(obj).map(key => ({ name: key, num: obj[key] }));
            }
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
                    this.storyText = '暴击属性出错, 请手动卸下身上穿的所有装备后刷新游戏<br>如果身上没有装备却一直存在此提示可以尝试穿一次装备再刷新游戏';
                } else {
                    this.player.critical = val;
                }
            },
            'player.dodge': function (val) {
                if (isNaN(val) || val < 0) {
                    this.player.dodge = 0;
                    this.storyText = '闪避属性出错, 请手动卸下身上穿的所有装备后刷新游戏<br>如果身上没有装备却一直存在此提示可以尝试穿一次装备再刷新游戏';
                } else {
                    this.player.dodge = val;
                }
            },
        },
        mounted () {
            // 判断本地有没有玩家存档数据
            const local = this.$store.state;
            if (localStorage.vuex) {
                const vuex = JSON.parse(localStorage.vuex);
                const player = crypto.decryption(vuex.player);
                const version = player.version ? player.version : 0;
                if (!version || version < 0.8) {
                    this.clearSave();
                    return;
                }
            }
            if (local) {
                this.boss = local.boss;
                this.player = local.player;
            }
            // 初始化游戏
            this.startGame();
        },
        methods: {
            // 初始化游戏
            startGame () {
                this.storyText = '你的修仙之旅开始了。';
                this.actions = [
                    { text: '开始修炼', handler: () => this.$router.push('/cultivate') },
                    {
                        text: '探索秘境', handler: () => {
                            if (!this.player.isNewbie) {
                                this.$notify({ title: '提示', message: `新手礼包未领取` });
                                return;
                            }
                            if (this.player.level < 10) {
                                this.$notify({ title: '实力不足提示', message: `外面太危险了, 请突破到${this.$levelNames(10)}再出去吧!` });
                                return;
                            }
                            this.$router.push('/map');
                        }
                    },
                    { text: '批量处理', handler: this.sellingEquipmentBox },
                    { text: '图鉴与成就', handler: () => this.$router.push('/equipAll') },
                    { text: '世界BOSS', handler: () => this.$router.push('/boss') }
                ];
                // 初始化玩家当前气血
                this.player.health = this.player.maxHealth;
                // 更新玩家存档
                this.$store.commit('setPlayer', this.player);
            },
            // 清空存档
            clearSave () {
                this.$confirm('由于当前游戏版本不兼容存档版本,需要删档处理', '存档删除提示', {
                    center: true,
                    showClose: false,
                    showCancelButton: false,
                    confirmButtonText: '确定',
                    closeOnClickModal: false,
                    closeOnPressEscape: false
                }).then(() => {
                    // 清空存档
                    localStorage.removeItem('vuex');
                    // 刷新页面
                    location.reload(1);
                });
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
            // 批量放生灵宠
            sellingPet () {
                // 获取玩家背包装备
                const pets = this.player.pets;
                // 检查背包是否存在灵宠
                if (!pets.length) {
                    this.$notify({ title: '灵宠放生提示', message: '你没有可以放生的灵宠' });
                    return;
                }
                // 过滤出可以放生的灵宠
                const selling = pets.filter(item => !item.lock);
                // 检查是否有可以放生的灵宠
                if (!selling.length) {
                    this.$notify({ title: '灵宠放生提示', message: '你没有可以放生的未锁定灵宠' });
                    return;
                }
                // 关闭弹窗
                this.sellingEquipmentShow = false;
                // 计算未锁定灵宠放生所得培养丹
                const cultivateDanTotal = selling.reduce((total, i) => {
                    // 灵宠转生次数
                    const reincarnation = i.reincarnation ? i.reincarnation : 1;
                    let level = i.level * reincarnation;
                    level = Number(level) || 0;
                    return total + Math.floor(level);
                }, 0);
                // 增加培养丹数量
                this.player.props.cultivateDan += cultivateDanTotal;
                // 清空背包内所有未锁定灵宠
                this.player.pets = pets.filter(item => item.lock);
                this.$store.commit('setPlayer', this.player);
                this.$notify({ title: '灵宠放生提示', message: `所有非锁定灵宠已成功放生, 他们临走前一起赠与了你${cultivateDanTotal}个培养丹` });
            },
            // 批量分解装备
            sellingEquipment () {
                // 获取玩家背包装备
                const inventory = this.player.inventory;
                // 获取玩家装备分解设置
                const sellingEquipmen = this.player.sellingEquipmentData;
                // 检查是否选择了需要分解的品阶
                if (!sellingEquipmen.length) {
                    this.$notify({ title: '背包装备分解提示', message: '你没有选择勾选需要分解的品阶' });
                    return;
                }
                // 过滤出可以分解的装备
                const selling = inventory.filter(item => sellingEquipmen.includes(item.quality) && !item.lock);
                // 检查是否有可售卖的装备
                if (!selling.length) {
                    this.$notify({ title: '背包装备分解提示', message: '背包内并没有可以售卖的装备' });
                    return;
                }
                // 关闭弹窗
                this.sellingEquipmentShow = false;
                // 计算未锁定装备与选中分解品阶的等级总和
                const strengtheningStoneTotal = selling.reduce((total, i) => {
                    let level = i.level + i.level * this.player.reincarnation / 10;
                    level = Number(level) || 0;
                    return total + Math.floor(level);
                }, 0);
                // 增加灵石数量
                this.player.props.money += selling.length;
                // 增加炼器石数量
                this.player.props.strengtheningStone += strengtheningStoneTotal;
                // 清空背包内所有未锁定装备与选中分解的品阶
                this.player.inventory = inventory.filter(item => !sellingEquipmen.includes(item.quality) || item.lock);
                this.$store.commit('setPlayer', this.player);
                this.$notify({ title: '背包装备分解提示', message: `背包内所有非锁定装备已成功分解, 你获得了${strengtheningStoneTotal}个炼器石和${selling.length}个灵石` });
            },
            // 修改玩家装备分解设置
            sellingEquipmentDataChange (val) {
                this.player.sellingEquipmentData = val;
                // 更新玩家存档
                this.$store.commit('setPlayer', this.player);
            },
            // 获取商店装备   
            tabClick () {
                if (this.inventoryActive == 'shop' && !this.player.shopData.length) {
                    this.player.shopData = shop.drawPrize(this.$maxLv);
                    // 更新玩家存档
                    this.$store.commit('setPlayer', this.player);
                }
            },
            // 刷新商店
            refreshShop () {
                if (this.player.props.money < 500) {
                    this.$notify({ title: '提示', message: '灵石不足, 刷新商店需要500灵石' });
                    return;
                }
                // 扣除灵石
                this.player.props.money -= 500;
                // 更新鸿蒙商店数据
                this.player.shopData = shop.drawPrize(this.$maxLv);
                // 更新玩家存档
                this.$store.commit('setPlayer', this.player);
                this.$notify({ title: '提示', message: '刷新成功' });
            },
            // 删档
            deleteData () {
                this.$confirm('你确定要删除存档吗?建议数据出问题的时候再删除', '数据删除提示', {
                    center: true,
                    cancelButtonText: '我点错了',
                    confirmButtonText: '确定以及肯定'
                }).then(() => {
                    this.$notify({ title: '提示', message: '存档删除成功' });
                    // 清空存档
                    localStorage.removeItem('vuex');
                    // 刷新页面
                    location.reload(1);
                }).catch(() => { });
            },
            // 电脑导入存档
            importData (data) {
                const file = data.file;
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        // 导入存档
                        localStorage.setItem('vuex', e.target.result);
                        // 刷新页面
                        location.reload(1);
                    } catch (err) {
                        this.$notify({
                            title: '数据导入失败',
                            message: `错误信息:${err}`
                        });
                    }
                };
                reader.readAsText(file);
            },
            // 导出存档
            exportData () {
                let FileSaver = require('file-saver');
                const today = new Date();
                const year = today.getFullYear();
                const month = String(today.getMonth() + 1).padStart(2, '0');
                const day = String(today.getDate()).padStart(2, '0');
                const hours = String(today.getHours()).padStart(2, '0');
                const minutes = String(today.getMinutes()).padStart(2, '0');
                const seconds = String(today.getSeconds()).padStart(2, '0');
                const blob = new Blob([localStorage.getItem('vuex')], { type: 'application/json;charset=utf-8' });
                const name = `我的文字修仙全靠刷${year}-${month}-${day}_${hours}:${minutes}:${seconds}.json`;
                FileSaver.saveAs(blob, name);
            },
            // 批量分解装备弹窗
            sellingEquipmentBox () {
                this.show = false;
                this.sellingEquipmentShow = true;
            },
            // 穿装备
            equipItem (id, type) {
                const inventoryItem = this.getObjectById(id, this.player.inventory);
                // 如果当前装备境界大于人物的境界
                if (!this.player.reincarnation && inventoryItem.level > this.player.level) {
                    this.$notify({ title: '当前境界不足', message: '无法穿戴该装备' });
                    return;
                }
                // 如果当前类型的装备已经穿戴，则将其放回背包
                if (JSON.stringify(this.player.equipment[type]) != '{}') {
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
            // 道具锁定or道具解锁
            inventoryLock (id) {
                let inventoryItem = this.getObjectById(id, this.player.inventory);
                inventoryItem.lock = !inventoryItem.lock;
                // 更新玩家存档
                this.$store.commit('setPlayer', this.player);
                this.$notify({
                    title: !inventoryItem.lock ? '装备解锁提示' : '装备锁定提示',
                    message: !inventoryItem.lock ? '装备解锁成功' : '装备锁定成功'
                });
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
            // 放生灵宠
            petClose (item) {
                this.$confirm(`你确定要放生<span class="el-tag el-tag--${this.computePetsLevel(item.level)}">${item.name}(${this.$levelNames(item.level)})</span>吗?`, '灵宠放生通知', {
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
                    this.player.props.cultivateDan += num;
                    // 删除道具
                    this.player.pets = this.player.pets.filter(obj => obj.id !== item.id);
                    // 更新玩家存档
                    this.$store.commit('setPlayer', this.player);
                    // 装备分解通知
                    this.$notify({
                        title: `${item.name}已成功放生`,
                        message: `对方临走时赠与了你${num}个培养丹`
                    });
                }).catch(() => { });
            },
            // 道具锁定or道具解锁
            petLock (item) {
                item.lock = !item.lock;
                // 更新玩家存档
                this.$store.commit('setPlayer', this.player);
                this.$notify({
                    title: !item.lock ? '灵宠解锁提示' : '灵宠锁定提示',
                    message: !item.lock ? '灵宠解锁成功' : '灵宠锁定成功'
                });
            },
            // 计算身上装备和背包装备差值
            calculateDifference (item1, item2) {
                item1 = item1 || 0;
                item2 = item2 || 0;
                const isFloat = (num) => {
                    return Number(num) === num && num % 1 !== 0;
                };
                const Float = item1 - parseFloat(item2) < -1 ? -1 : (item1 - parseFloat(item2) > 1 ? 1 : item1 - parseFloat(item2));
                const ojb = {
                    num: isFloat(item1) || isFloat(item2) ? (Float * 100).toFixed(2) + '%' : item1 - parseInt(item2),
                    icon: item1 > item2 ? 'success el-icon-caret-top' : (item1 == item2 ? '' : 'danger el-icon-caret-bottom'),
                };
                ojb.num = ojb.num == 0 ? '' : ojb.num
                return ojb;
            },
            // 炼器
            enhance (item) {
                // 炼器成功率
                const successRate = this.calculateEnhanceSuccessRate(item);
                // 炼器消耗道具数量
                const calculateCost = this.calculateCost(item);
                // 如果炼器石不足
                if (calculateCost > this.player.props.strengtheningStone) {
                    // 发送通知
                    this.$notify({ title: '炼器提示', message: '炼器石不足, 进行无法炼器操作', position: 'top-left' });
                    return;
                }
                // 如果炼器等级已满
                if (item.strengthen == 30) {
                    // 发送通知
                    this.$notify({ title: '炼器提示', message: '当前装备炼器等级已满', position: 'top-left' });
                    return;
                }
                // 炼器确认弹窗
                this.$confirm(item.strengthen >= 15 && !this.protect ? `当前装备炼器等级已达到+${item.strengthen}, 如果炼器失败该装备会销毁, 请问还需要炼器吗?` : '你确定要炼器吗?', '炼器提示', {
                    cancelButtonText: '我点错了',
                    confirmButtonText: '确定以及肯定'
                }).then(() => {
                    // 如果炼器成功
                    if (Math.random() <= successRate) {
                        // 攻击
                        const attack = Math.floor(item.initial.attack * 0.2);
                        // 血量
                        const health = Math.floor(item.initial.health * 0.2);
                        // 防御
                        const defense = Math.floor(item.initial.defense * 0.2);
                        switch (item.type) {
                            // 如果是神兵
                            case 'weapon':
                                item.attack += attack;
                                this.playerAttribute(0, attack, 0, 0, 0);
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
                                item.attack += attack;
                                item.health += health;
                                item.defense += defense;
                                this.playerAttribute(0, attack, health, 0, defense);
                                break;
                            default:
                                break;
                        }
                        // 增加炼器等级
                        item.strengthen++;
                        // 重新计算装备评分
                        item.score = equip.calculateEquipmentScore(item.dodge, item.attack, item.health, item.critical, item.defense);
                        // 发送炼器成功通知
                        this.$notify({ title: '炼器提示', message: '炼器成功', position: 'top-left' });
                    } else {
                        // 如果炼器等级等于或大于15级并且未开启炼器保护
                        if (item.strengthen >= 15 && !this.protect) {
                            // 移除销毁当前装备
                            this.player.equipment[item.type] = {};
                            // 扣除已销毁装备增加的属性
                            this.playerAttribute(-item.dodge, -item.attack, -item.health, -item.critical, -item.defense);
                            // 炼器等级清零
                            item.strengthen = 0;
                            // 关闭炼器弹窗
                            this.strengthenShow = false;
                        }
                        // 发送炼器失败通知
                        this.$notify({ title: '炼器提示', message: item.strengthen >= 15 && !this.protect ? '炼器失败, 装备已自动销毁' : '炼器失败', position: 'top-left' });
                    }
                    // 扣除炼器石
                    this.player.props.strengtheningStone -= calculateCost;
                    // 更新玩家存档
                    this.$store.commit('setPlayer', this.player);
                }).catch(() => { });
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
            // 计算炼器成功概率  
            calculateEnhanceSuccessRate (item) {
                // 基础成功率
                let baseSuccessRate = 1;
                // 每级降低成功率
                let decrementPerLevel = 0.03;
                // 炼器增幅
                let increase = this.increase ? 0.1 : 0;
                // 最终成功率
                return baseSuccessRate - (item.strengthen * decrementPerLevel - increase);
            },
            // 灵宠升级
            petUpgrade (item) {
                // 计算灵宠升级所需材料数量
                const consume = this.petConsumption(item.level);

                // 如果勾选了提升悟性但是悟性丹不足
                if (this.petRootBone && this.player.props.rootBone < item.rootBone) {
                    // 发送通知
                    this.$notify({ title: '灵宠培养提示', message: '悟性丹不足, 无法提升灵宠悟性', position: 'top-left' });
                    return;
                }
                // 如果勾选了灵宠转生但是人物转生不等于灵宠转生
                if (this.petReincarnation && this.player.reincarnation < this.player.pet.reincarnation) {
                    // 发送通知
                    this.$notify({ title: '灵宠培养提示', message: '灵宠转生不能高于人物转生', position: 'top-left' });
                    return;
                }
                // 如果勾选了灵宠转生但是灵宠等级没满
                if (this.petReincarnation && this.$maxLv > item.level) {
                    // 发送通知
                    this.$notify({ title: '灵宠培养提示', message: '灵宠境界未满无法转生', position: 'top-left' });
                    return;
                }
                // 如果没有勾选灵宠转生并且境界满了
                if (!this.petReincarnation && item.level >= this.$maxLv) {
                    // 发送通知
                    this.$notify({ title: '灵宠培养提示', message: '灵宠境界已满请转生', position: 'top-left' });
                    return;
                }
                // 如果培养丹不足
                if (consume > this.player.props.cultivateDan) {
                    // 发送通知
                    this.$notify({ title: '灵宠培养提示', message: '培养丹不足, 进行无法培养', position: 'top-left' });
                    return;
                }
                // 灵宠培养确认弹窗
                this.$confirm('你确定要培养该灵宠吗?', '灵宠培养提示', {
                    cancelButtonText: '我点错了',
                    confirmButtonText: '确定以及肯定'
                }).then(() => {
                    let attack, health, defense = 0;
                    // 如果勾选了提升悟性并且悟性丹足够
                    if (this.petRootBone && this.player.props.rootBone >= item.rootBone) {
                        let rootBone = item.initial.rootBone - item.rootBone;
                        rootBone = rootBone ? rootBone : 1;
                        // 攻击
                        attack = Math.floor(item.initial.attack * rootBone);
                        // 血量
                        health = Math.floor(item.initial.health * rootBone);
                        // 防御
                        defense = Math.floor(item.initial.defense * rootBone);
                        // 提升悟性
                        item.rootBone++;
                        // 扣除悟性丹
                        this.player.props.rootBone -= item.rootBone;
                    } else {
                        // 攻击
                        attack = Math.floor(item.initial.attack * 0.05);
                        // 血量
                        health = Math.floor(item.initial.health * 0.05);
                        // 防御
                        defense = Math.floor(item.initial.defense * 0.05);
                    }
                    // 如果勾选了转生并且当前等级已满
                    if (this.petReincarnation && item.level >= this.$maxLv) {
                        // 重置灵宠等级
                        this.player.pet.level = 1;
                        // 取消转生勾选
                        this.petReincarnation = false;
                        // 增加灵宠转生次数
                        this.player.pet.reincarnation++;
                        // 发送通知
                        this.$notify({ title: '灵宠培养提示', message: '灵宠转生成功, 已重置灵宠境界', position: 'top-left' });
                    } else {
                        // 增加灵宠等级
                        this.player.pet.level++;
                        // 发送通知
                        this.$notify({ title: '灵宠培养提示', message: '灵宠培养成功', position: 'top-left' });
                    }
                    // 增加灵宠属性
                    this.player.pet.attack += attack;
                    this.player.pet.health += health;
                    this.player.pet.defense += defense;
                    // 更新玩家属性，添加灵宠培养后的属性加成
                    this.playerAttribute(0, attack, health, 0, defense);
                    // 重新计算灵宠评分
                    this.player.pet.score = equip.calculateEquipmentScore(this.player.pet.dodge, this.player.pet.attack, this.player.pet.health, this.player.pet.critical, this.player.pet.defense);
                    // 扣除培养丹
                    this.player.props.cultivateDan -= consume;
                    // 更新玩家存档
                    this.$store.commit('setPlayer', this.player);
                }).catch(() => { });
            },
            // 道侣升级
            wifeUpgrade (item) {
                // 计算道侣升级所需材料数量
                const consume = item.level * 10;
                // 如果情缘点不足
                if (consume > this.player.props.qingyuan) {
                    // 发送通知
                    this.$notify({ title: '道侣升级提示', message: '情缘点不足, 进行无法培养', position: 'top-left' });
                    return;
                }
                // 道侣升级确认弹窗
                this.$confirm('你确定要升级该道侣吗?', '道侣升级提示', {
                    cancelButtonText: '我点错了',
                    confirmButtonText: '确定以及肯定'
                }).then(() => {
                    const attack = Math.floor(item.attack * 0.1);
                    const health = Math.floor(item.health * 0.1);
                    const defense = Math.floor(item.defense * 0.1);
                    // 增加道侣等级
                    this.player.wife.level++;
                    // 发送通知
                    this.$notify({ title: '道侣升级提示', message: '道侣升级提示成功', position: 'top-left' });
                    // 增加道侣属性
                    this.player.wife.attack += attack;
                    this.player.wife.health += health;
                    this.player.wife.defense += defense;
                    // 更新玩家属性，添加道侣升级后的属性加成
                    this.playerAttribute(0, attack, health, 0, defense);
                    // 扣除情缘点
                    this.player.props.qingyuan -= consume;
                    // 更新玩家存档
                    this.$store.commit('setPlayer', this.player);
                }).catch(() => { });
            },
            // 计算灵宠升级所需消耗
            petConsumption (lv) {
                // 是否勾选转生选项
                const cost = this.petReincarnation ? 10 : 1;
                // 转生次数
                const reincarnation = this.player.pet.reincarnation ? lv * 200 : 1;
                return (lv * 200 + reincarnation) * cost;
            },
            // 购买装备
            shopBuy (item) {
                if (this.player.props.currency >= this.shopPrice) {
                    // 扣除鸿蒙石
                    this.player.props.currency -= this.shopPrice;
                    // 如果装备背包当前容量大于等于背包总容量
                    if (this.player.inventory.length >= this.player.backpackCapacity) {
                        this.storyText = `当前装备背包容量已满, 该装备自动丢弃, 转生可增加背包容量`;
                    } else {
                        // 添加到背包
                        this.player.inventory.push(item);
                    }
                    // 更新玩家存档
                    this.$store.commit('setPlayer', this.player);
                    // 跳转背包相关页
                    this.inventoryActive = item.type;
                    this.$notify({ title: '购买提示', message: `您成功花费${this.shopPrice}鸿蒙石购买${item.name}` });
                } else {
                    this.$notify({ title: '购买提示', message: '购买失败, 鸿蒙石不足' });
                }
            },
            // 道侣跟随
            wifeTack (item) {
                // 如果已经有道侣跟随就收回
                if (JSON.stringify(this.player.wife) != '{}') {
                    const itemInfo = this.player.wife;
                    // 更新玩家属性，移除跟随道侣的属性加成
                    this.playerAttribute(-itemInfo.dodge, -itemInfo.attack, -itemInfo.health, -itemInfo.critical, -itemInfo.defense);
                    // 收回当前跟随的道侣
                    this.player.wifes.push(this.player.wife);
                }
                this.player.wife = item;
                // 更新玩家属性，添加当前跟随道侣的属性加成
                this.playerAttribute(item.dodge, item.attack, item.health, item.critical, item.defense);
                // 从道侣背包中移除这个道侣
                this.player.wifes = this.player.wifes.filter(i => i.name !== item.name);
                // 更新玩家存档
                this.$store.commit('setPlayer', this.player);
            },
            // 道侣收回
            wifeRevoke () {
                const item = this.player.wife;
                // 更新玩家属性，移除当前跟随道侣的属性加成
                this.playerAttribute(-item.dodge, -item.attack, -item.health, -item.critical, -item.defense);
                // 收回当前跟随的道侣
                this.player.wife = {};
                this.player.wifes.push(item);
                // 更新玩家存档
                this.$store.commit('setPlayer', this.player);
            },
            // 道侣信息
            wifeItemInfo (item) {
                this.$confirm('', item.name, {
                    center: true,
                    message: `<div class="monsterinfo">
                        <div class="monsterinfo-box">
                            <p>境界: ${this.$levelNames(item.level)}</p>
                            <p>气血: ${this.$formatNumberToChineseUnit(item.health)}</p>
                            <p>攻击: ${this.$formatNumberToChineseUnit(item.attack)}</p>
                            <p>防御: ${this.$formatNumberToChineseUnit(item.defense)}</p>
                        </div>
                    </div>`,
                    confirmButtonText: '跟随',
                    dangerouslyUseHTMLString: true
                }).then(() => {
                    this.wifeTack(item);
                }).catch(() => { });
            },
            // 商店装备信息
            shopItemInfo (item) {
                this.$confirm('', item.name, {
                    center: true,
                    message: `<div class="monsterinfo">
                        <div class="monsterinfo-box">
                            <p>价格: ${this.shopPrice}鸿蒙石</p>
                            <p>类型: ${this.$genre[item.type]}</p>
                            <p>境界: ${this.$levelNames(item.level)}</p>
                            <p>品质: ${this.$levels[item.quality]}</p>
                            <p>气血: ${this.$formatNumberToChineseUnit(item.health)}</p>
                            <p>攻击: ${this.$formatNumberToChineseUnit(item.attack)}</p>
                            <p>防御: ${this.$formatNumberToChineseUnit(item.defense)}</p>
                            <p>闪避率: ${item.dodge > 0 ? (item.dodge * 100 > 100 ? 100 : (item.dodge * 100).toFixed(2)) : 0}%</p>
                            <p>暴击率: ${item.critical > 0 ? (item.critical * 100 > 100 ? 100 : (item.critical * 100).toFixed(2)) : 0}%</p>
                            <p>装备评分: ${this.$formatNumberToChineseUnit(item.score)}</p>
                        </div>
                    </div>`,
                    cancelButtonText: '取消购买',
                    confirmButtonText: '购买装备',
                    dangerouslyUseHTMLString: true
                }).then(() => {
                    this.shopBuy(item);
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
                        this.$notify({ title: '新手礼包领取提示', message: '新手礼包领取成功!' });
                    }
                    // 终止
                    else return;
                    // 将装备添加到库存
                    if (JSON.stringify(equipItem) != '{}') this.player.inventory.push(equipItem);
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
            // 分解装备
            inventoryClose (item) {
                this.$confirm(`你确定要分解<span class="el-tag el-tag--${item.quality}">${this.$levels[item.quality]}${item.name}(${this.$genre[item.type]})</span>吗?`, '装备分解通知', {
                    center: true,
                    cancelButtonText: '取消分解',
                    confirmButtonText: '确定分解',
                    dangerouslyUseHTMLString: true
                }).then(() => {
                    const num = item.level + Math.floor(item.level * this.player.reincarnation / 10);
                    // 增加炼器石数量
                    this.player.props.strengtheningStone += num;
                    // 删除背包装备
                    this.player.inventory = this.player.inventory.filter(obj => obj.id !== item.id);
                    // 关闭装备信息弹窗
                    this.inventoryShow = false;
                    // 更新玩家存档
                    this.$store.commit('setPlayer', this.player);
                    // 装备分解通知
                    this.$notify({ title: '背包装备售卖提示', message: `${item.name}已成功卖出, 你获得了${num}个炼器石` });
                }).catch(() => { });
            },
            // 根据装备ID给出信息
            getObjectById (id, arr) {
                return arr.find(obj => obj.id === id);
            },
            // 道具信息
            inventory (id) {
                this.inventoryInfo = this.getObjectById(id, this.player.inventory);
                this.inventoryShow = true;
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
            // 计算灵宠等级
            computePetsLevel (lv) {
                if (lv >= 1 && lv <= 9) return 'success';
                if (lv >= 10 && lv <= 19) return 'primary';
                if (lv >= 20 && lv <= 29) return 'warning';
                if (lv >= 30) return 'danger';
            },
            // 玩家属性操作
            playerAttribute (dodge = 0, attack = 0, health = 0, critical = 0, defense = 0) {
                // 初始化传进来的属性值
                dodge = isNaN(dodge) || !dodge ? 0 : parseFloat(dodge);
                attack = isNaN(attack) || !attack ? 0 : Math.floor(attack);
                health = isNaN(health) || !health ? 0 : Math.floor(health);
                defense = isNaN(defense) || !defense ? 0 : Math.floor(defense);
                critical = isNaN(critical) || !critical ? 0 : parseFloat(critical);
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
                // 评分
                this.player.score = equip.calculateEquipmentScore(this.player.dodge, this.player.attack, this.player.maxHealth, this.player.critical, this.player.defense);
            },
            // 卸装备
            equipmentClose (type) {
                const { inventory, equipment } = this.player;
                if (!equipment[type]) return;
                // 更新玩家属性，移除当前穿戴装备的属性加成
                this.playerAttribute(-equipment[type].dodge, -equipment[type].attack, -equipment[type].health, -equipment[type].critical, -equipment[type].defense);
                // 跳转背包相关页
                this.equipmentActive = type;
                // 给装备增加id
                equipment[type].id = Date.now();
                // 添加装备到背包里
                inventory.push(equipment[type]);
                // 清空身上当前类型的装备
                equipment[type] = {};
                // 更新玩家存档
                this.$store.commit('setPlayer', this.player);
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
            // 装备排序
            equipmentDropdown (command) {
                this.equipmentDropdownActive = command;
                this.player.inventory = this.player.inventory.slice().sort((a, b) => b[command] - a[command]);
            },
            // 灵宠排序
            petDropdown (command) {
                this.petDropdownActive = command;
                this.player.pets = this.player.pets.slice().sort((a, b) => b[command] - a[command]);
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
                    this.$notify({ title: '加点提示', message: `加点成功${typeNames[type]}增加了${numText}点` });
                }
            },
            // 计算所需修为相差百分比
            calculatePercentageDifference (num1, num2) {
                let difference = Math.abs(num1 - num2);
                let percentage = (difference / num1) * 100;
                const num3 = this.player.maxCultivation - this.player.cultivation > 0 ? 100 - percentage : 100;
                // return percentage < 0 ? 100 : 100 - percentage;
                return `${num3.toFixed(2)}%`
            },
            async copyTextToClipboard (text) {
                if (navigator.clipboard) {
                    try {
                        await navigator.clipboard.writeText(text);
                        this.$notify({ title: '提示', message: '群号复制成功' });
                    } catch (err) {
                        this.$notify({ title: '提示', message: '群号复制失败, 请手动复制' });
                    }
                }
            },
            qq () {
                const qq = '920930589';
                const h = this.$createElement;
                const message = h('el-input', {
                    attrs: {
                        type: 'text',
                        value: qq,
                        disabled: true
                    }
                });
                this.$msgbox({
                    title: '官方群聊',
                    message,
                    showCancelButton: false,
                    confirmButtonText: '复制群号',
                    beforeClose: async (action, instance, done) => {
                        if (action === 'confirm') {
                            if (window.navigator.clipboard) {
                                try {
                                    await window.navigator.clipboard.writeText(qq);
                                    done();
                                    // 关闭弹窗
                                    this.show = false;
                                    this.$notify({ title: '提示', message: '群号复制成功' });
                                } catch (err) {
                                    const el = message.elm;
                                    // 移除disabled样式
                                    el.className = 'el-input';
                                    [...el.children].forEach(item => {
                                        // 取消disabled
                                        item.disabled = false;
                                        // 自动聚焦
                                        item.focus();
                                        // 自动全选
                                        item.select();
                                    });
                                    this.$notify({ title: '提示', message: '群号复制失败, 请手动复制' });
                                }
                            }
                        } else {
                            done();
                        }
                    }
                }).catch(() => { });
            }
        }
    }
</script>

<style scoped>
    .index-box {
        margin-top: 15px;
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
        box-sizing: border-box;
        white-space: nowrap;
        display: inline-block;
    }

    .attribute {
        width: calc(50% - 8px);
        margin: 4px;
        overflow: auto;
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

    .inventory-item {
        margin: 4px;
    }

    .dialog-footer {
        display: flex;
        justify-content: center;
    }

    .dialog-upload {
        margin: 0 10px;
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

    .collapse p,
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

    /* 基础属性对比 */
    .collapse {
        margin: 20px 0;
    }

    @media only screen and (max-width: 750px) {
        .title {
            font-size: 20px;
        }

        .game-container {
            min-height: 574px;
            min-width: 356px;
        }

        .dialog-footer {
            flex-direction: column;
        }

        .dialog-footer-button {
            margin: 10px 0 0 0 !important;
            width: 100%;
        }

        /* .dialog-footer-button:nth-child(2),
        .dialog-footer-button:nth-child(5) {
            position: relative;
            right: 10px;
        } */

        .dialog-footer-button:nth-child(2+n) {
            margin-top: 10px;
            width: 100%;
        }

        .dialog-upload {
            margin: 0;
        }

        .equip-box {
            padding: 0 5px;
        }

        .inventory-button {
            margin-left: 0 !important;
            margin-top: 10px;
        }
    }
</style>

<style>
    .el-collapse-item__content,
    .el-collapse-item div[role='tab'] {
        display: flex;
        justify-content: center;
    }
</style>