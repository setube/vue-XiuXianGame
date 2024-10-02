<template>
  <div>
    <Teleport defer
      to=".index-box">
      <div v-if="!offline.isReceiveAwarded"
        class="offline-receiveAwardedTipBtn">
        <el-button type="primary"
          size="small"
          @click="offline.showOfflineBox = true">离线</el-button>
      </div>
    </Teleport>

    <Teleport to="body">
      <el-dialog v-model="offline.showOfflineBox"
        title="离线奖励"
        width="500"
        @close="handleOfflineBoxClose">
        <div>
          <el-text class="offline-title">在您离线的 {{ offline.diffText }} 内,您通过意念修炼获得了如下物品:</el-text>
          <el-text class="offline-title"
            type="danger"
            tag="b">请确保背包空间充足,超出的部分将自动丢弃</el-text>
        </div>
        <el-card class="box-card">
          <div slot="header">
            <el-text type="info">装备:</el-text>
          </div>
          <div class="offline-content-container">
            <div class="offline-content">
              <el-scrollbar max-height="300px"
                style="width: 100%;"
                always>
                <tag class="inventory-item"
                  v-for="item in offline.equipItems"
                  :key="item.id"
                  :type="item.quality"
                  :closable="!item.lock"
                  @close="inventoryClose(item)"
                  @click="inventory(item.id, item.type)">
                  <el-icon v-if="item.lock">
                    <Lock />
                  </el-icon>
                  <el-icon v-else>
                    <Unlock />
                  </el-icon>
                  {{ item?.name }}{{ item?.strengthen ? '+' + item?.strengthen : '' }}
                </tag>
              </el-scrollbar>
            </div>
          </div>
          <div>
          </div>
        </el-card>
        <el-card class="box-card">
          <div slot="header"
            class="clearfix">
            <el-text type="info">资源:</el-text>
          </div>
          <div class="offline-res-content-container">
            <el-text class="offline-res-text"
              type='primary'>修为: {{ offline.expGain }}</el-text>
            <el-text class="offline-res-text"
              type='danger'>灵石: {{ offline.moneyGain }}</el-text>
          </div>
        </el-card>
        <template #footer>
          <div class="offline-footer">
            <el-button type="primary"
              @click="sellingEquipmentShow = true">批量分解</el-button>
            <el-button type="primary"
              @click="handleReceiveAward">
              领取
            </el-button>
          </div>
        </template>
      </el-dialog>
    </Teleport>

    <el-dialog :title="inventoryInfo.name"
      v-model="inventoryShow"
      center
      width="420px">
      <div class="monsterinfo"
        v-if="inventoryShow">
        <div class="monsterinfo-box">
          <p>
            <span class="description">类型: {{ $genre[inventoryInfo.type] }}</span>
            <span class="icon" />
            <span class="value" />
          </p>
          <p>
            <span class="description">炼器: {{ inventoryInfo.strengthen || 0 }}</span>
            <span class="icon">
              <i
                :class="calculateDifference(inventoryInfo.strengthen, player.equipment[inventoryInfo.type]?.strengthen).icon" />
            </span>
            <span class="value">{{ calculateDifference(inventoryInfo.strengthen,
              player.equipment[inventoryInfo.type]?.strengthen).num }}</span>
          </p>
          <p>
            <span class="description">境界: {{ $levelNames(inventoryInfo.level) }}</span>
            <span class="icon">
              <i :class="calculateDifference(inventoryInfo.level, player.equipment[inventoryInfo.type]?.level).icon" />
            </span>
            <span class="value">
              {{ inventoryInfo.level > parseInt(player.equipment[inventoryInfo.type]?.level || 1) ?
                $levelNames(inventoryInfo.level) : $levelNames(player.equipment[inventoryInfo.type]?.level)
              }}
            </span>
          </p>
          <p>
            <span class="description">品质: {{ $levels[inventoryInfo.quality] }}</span>
            <span class="icon">
              <i
                :class="calculateDifference(levelsNum[inventoryInfo.quality], levelsNum[player.equipment[inventoryInfo.type]?.quality]).icon" />
            </span>
            <span class="value">
              {{ calculateDifference(levelsNum[inventoryInfo.quality],
                levelsNum[player.equipment[inventoryInfo.type]?.quality]).num < 0
                ?
                $levels[player.equipment[inventoryInfo.type]?.quality]
                :
                $levels[inventoryInfo.quality]
                }}
                </span>
          </p>
          <p>
            <span class="description">气血: {{ inventoryInfo?.health }}</span>
            <span class="icon">
              <i
                :class="calculateDifference(inventoryInfo?.health, player.equipment[inventoryInfo.type]?.health).icon" />
            </span>
            <span class="value">{{ calculateDifference(inventoryInfo?.health,
              player.equipment[inventoryInfo.type]?.health).num }}</span>
          </p>
          <p>
            <span class="description">攻击: {{ inventoryInfo?.attack }}</span>
            <span class="icon">
              <i
                :class="calculateDifference(inventoryInfo?.attack, player.equipment[inventoryInfo.type]?.attack).icon" />
            </span>
            <span class="value">{{ calculateDifference(inventoryInfo?.attack,
              player.equipment[inventoryInfo.type]?.attack).num }}</span>
          </p>
          <p>
            <span class="description">防御: {{ inventoryInfo?.defense }}</span>
            <span class="icon">
              <i
                :class="calculateDifference(inventoryInfo?.defense, player.equipment[inventoryInfo.type]?.defense).icon" />
            </span>
            <span class="value">{{ calculateDifference(inventoryInfo?.defense,
              player.equipment[inventoryInfo.type]?.defense).num }}</span>
          </p>
          <p>
            <span class="description">闪避率: {{ inventoryInfo?.dodge > 0 ? (inventoryInfo?.dodge * 100 > 100 ?
              100 :
              (inventoryInfo?.dodge * 100).toFixed(2)) : 0 }}%</span>
            <span class="icon">
              <i :class="calculateDifference(inventoryInfo?.dodge, player.equipment[inventoryInfo.type]?.dodge).icon" />
            </span>
            <span class="value">{{ calculateDifference(inventoryInfo?.dodge,
              player.equipment[inventoryInfo.type]?.dodge).num }}</span>
          </p>
          <p>
            <span class="description">暴击率: {{ inventoryInfo?.critical > 0 ? (inventoryInfo?.critical * 100 >
              100 ?
              100 : (inventoryInfo?.critical * 100).toFixed(2)) : 0 }}%</span>
            <span class="icon">
              <i
                :class="calculateDifference(inventoryInfo?.critical, player.equipment[inventoryInfo.type]?.critical).icon" />
            </span>
            <span class="value">{{ calculateDifference(inventoryInfo?.critical,
              player.equipment[inventoryInfo.type]?.critical).num }}</span>
          </p>
          <p>
            <span class="description">装备评分: {{ inventoryInfo?.score }}</span>
            <span class="icon">
              <i :class="calculateDifference(inventoryInfo?.score, player.equipment[inventoryInfo.type]?.score).icon" />
            </span>
            <span class="value">{{ calculateDifference(inventoryInfo?.score,
              player.equipment[inventoryInfo.type]?.score).num }}</span>
          </p>
        </div>
      </div>
      <el-collapse v-model="inventoryCollapse"
        class="collapse">
        <el-collapse-item name="1">
          <template #title>
            <div class="custom-title">基础属性对比</div>
          </template>
          <div class="monsterinfo-box">
            <p>
              <span class="description">气血: {{ inventoryInfo?.initial?.health }}</span>
              <span class="icon">
                <i
                  :class="calculateDifference(inventoryInfo?.initial?.health, player.equipment[inventoryInfo.type]?.initial?.health).icon" />
              </span>
              <span class="value">{{ calculateDifference(inventoryInfo?.initial?.health,
                player.equipment[inventoryInfo.type]?.initial?.health).num }}</span>
            </p>
            <p>
              <span class="description">攻击: {{ inventoryInfo?.initial?.attack }}</span>
              <span class="icon">
                <i
                  :class="calculateDifference(inventoryInfo?.initial?.attack, player.equipment[inventoryInfo.type]?.initial?.attack).icon" />
              </span>
              <span class="value">{{ calculateDifference(inventoryInfo?.initial?.attack,
                player.equipment[inventoryInfo.type]?.initial?.attack).num }}</span>
            </p>
            <p>
              <span class="description">防御: {{ inventoryInfo?.initial?.defense }}</span>
              <span class="icon">
                <i
                  :class="calculateDifference(inventoryInfo?.initial?.defense, player.equipment[inventoryInfo.type]?.initial?.defense).icon" />
              </span>
              <span class="value">{{ calculateDifference(inventoryInfo?.initial?.defense,
                player.equipment[inventoryInfo.type]?.initial?.defense).num }}</span>
            </p>
            <p>
              <span class="description">
                闪避率: {{ inventoryInfo?.initial?.dodge > 0 ? (inventoryInfo?.initial?.dodge * 100 > 100 ?
                  100 :
                  (inventoryInfo?.initial?.dodge * 100).toFixed(2)) : 0 }}%
              </span>
              <span class="icon">
                <i
                  :class="calculateDifference(inventoryInfo?.initial?.dodge, player.equipment[inventoryInfo.type]?.initial?.dodge).icon" />
              </span>
              <span class="value">{{ calculateDifference(inventoryInfo?.initial?.dodge,
                player.equipment[inventoryInfo.type]?.initial?.dodge).num }}</span>
            </p>
            <p>
              <span class="description">
                暴击率: {{ inventoryInfo?.initial?.critical > 0 ? (inventoryInfo?.initial?.critical * 100 >
                  100 ?
                  100 : (inventoryInfo?.initial?.critical * 100).toFixed(2)) : 0 }}%
              </span>
              <span class="icon">
                <i
                  :class="calculateDifference(inventoryInfo?.initial?.critical, player.equipment[inventoryInfo.type]?.initial?.critical).icon" />
              </span>
              <span class="value">{{ calculateDifference(inventoryInfo?.initial?.critical,
                player.equipment[inventoryInfo.type]?.initial?.critical).num }}</span>
            </p>
          </div>
        </el-collapse-item>
      </el-collapse>
      <div class="dialog-footer">
        <el-button plain
          class="inventory-button"
          @click="inventoryClose(inventoryInfo)">
          装备分解
        </el-button>
        <el-button plain
          class="inventory-button"
          @click="inventoryLock(inventoryInfo.id)">
          {{ inventoryInfo.lock ? '装备解锁' : '装备锁定' }}
        </el-button>
        <el-button type="primary"
          class="inventory-button"
          @click="equipItem(inventoryInfo.id, inventoryInfo.type)">
          立即装备
        </el-button>
      </div>
    </el-dialog>

    <el-dialog title="批量处理"
      v-model="sellingEquipmentShow"
      width="600px">
      <el-divider>装备</el-divider>
      <el-checkbox-group v-model="player.offlinesellingEquipmentData"
        @change="sellingEquipmentDataChange">
        <el-checkbox v-for="(item, index) in AllEquipmenType"
          :value="item"
          :key="index"
          :label="$levels[item]" />
      </el-checkbox-group>
      <div class="dialog-footer"
        style="margin-top: 20px;">
        <el-button class="dialog-footer-button"
          @click="sellingEquipment">
          分解装备
        </el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { formatTime } from "@/utils"
import equip from '@/plugins/equip';
import tag from "@/components/tag.vue";
import dataManager from "@/utils/dataManager";
export default {
  data() {
    return {
      player: {},
      levelsNum: {
        info: 1,
        pink: 7,
        danger: 6,
        purple: 4,
        primary: 3,
        success: 2,
        warning: 5,
      },
      offline: {
        isReceiveAwarded: false,
        showOfflineBox: false,
        diff: "",
        diffText: "",
        equipItems: [],
        expGain: 0,
        moneyGain: 0,
      },
      AllEquipmenType: ['info', 'success', 'primary', 'purple', 'warning', 'danger', 'pink'],
      // 批量分解弹窗
      sellingEquipmentShow: false,
      inventoryInfo: {},
      inventoryShow: false,
    }
  },
  components: {
    tag,
  },
  created() {
    window.addEventListener("beforeunload", this.handleBeforeUnload);
    dataManager.handleBeforeunloadFn = this.handleBeforeUnload;
  },
  mounted() {
    // 玩家数据
    this.player = this.$store.player;
    this.handleOffline()
  },
  methods: {
    handleBeforeUnload() {
      this.player.offlineTime = new Date().getTime()
    },
    // 计算离线收益
    calculateOfflineRewards(offlineDuration) {
      // 固定基数
      const baseReward = 10; // 基础奖励
      const randomFactor = equip.getRandomFloatInRange.bind(this, 0.8, 1.2); // 0到1的随机数，用于引入不确定性

      // 计算不同因素权重
      const EXPWeight = 0.009; // 修为权重
      const moneyWeight = 0.000996; // 灵石权重

      // 计算基础奖励
      const base = (baseReward + (offlineDuration * 2)) * randomFactor(); // 离线时间增加奖励
      console.log("re", this.player.reincarnation / 1000)
      const expReward = Math.floor((base * EXPWeight) * (1 + this.player.reincarnation)); // 修为奖励乘以转生奖励
      const moneyReward = Math.floor((base * moneyWeight) * (this.player.highestTowerFloor / 100) * (1 + this.player.reincarnation * 2)); // 灵石奖励乘以最高层塔奖励

      // 计算装备数量
      const equipNum = Math.floor(base * 0.0000036); // 装备数量

      // 汇总所有奖励
      const totalAward = {
        exp: expReward,
        money: moneyReward,
        equipNum,
      };

      return totalAward;
    },
    /* 检查是否可以领取离线奖励 */
    handleOffline() {
      this.offline.isReceiveAwarded = true // 假设已经领取
      if (!this.player.offlineTime) return; // 没有离线时间
      this.offline.diff = +(new Date().getTime() - this.player.offlineTime).toFixed(2)
      if (typeof +this.offline.diff !== "number" || this.offline.diff > 1000 * 60 * 60 * 24 * 365 * 30 || this.offline.diff < 0) return; // 离线时间格式错误
      const hasExceed = this.offline.diff > 1000 * 60 * 60 * 24; // 超过24小时
      this.offline.diff = hasExceed ? 1000 * 60 * 60 * 24 : this.offline.diff;
      this.offline.diffText = formatTime((this.offline.diff / 1000).toFixed(2)) + (hasExceed ? '(最长离线时间为24小时)' : "")
      if (this.offline.diff >= 1000 * 60 /* 离线时间超过1分钟 */) {
        const { exp, money, equipNum } = this.calculateOfflineRewards(this.offline.diff);
        this.offline.showOfflineBox = true
        this.offline.isReceiveAwarded = false
        console.log(equipNum)
        // 计算装备
        for (let i = 0; i < equipNum; i++) {
          const randomInt = equip.getRandomInt(1, 4);
          let equipItem = {};
          // 神兵
          if (randomInt == 1) equipItem = equip.equip_Weapons(this.player.level);
          // 护甲
          else if (randomInt == 2) equipItem = equip.equip_Armors(this.player.level);
          // 灵宝
          else if (randomInt == 3) equipItem = equip.equip_Accessorys(this.player.level);
          // 法器
          else if (randomInt == 4) equipItem = equip.equip_Sutras(this.player.level);
          // this.openEquipItemInfo = equipItem;
          // 如果装备背包当前容量大于等于背包总容量
          this.offline.equipItems.push(equipItem)
        }
        // 修为
        const expGain = exp
        // 灵石
        const moneyGain = money

        // 增加离线奖励修为
        this.offline.expGain += expGain;
        // 增加离线奖励灵石
        this.offline.moneyGain += moneyGain;
      }
    },
    /* 领取离线奖励 */
    handleReceiveAward() {
      this.offline.equipItems.forEach(equipItem => {
        if (this.player.inventory.length >= this.player.backpackCapacity) {
          // 背包满了
          // this.texts.push(`当前装备背包容量已满, 该装备自动丢弃, 转生可增加背包容量`);
        } else {
          // 玩家获得道具
          this.player.inventory.push(equipItem);
        }
      })
      // 增加修为
      this.breakThrough(this.offline.expGain);
      // 增加灵石
      this.player.props.money += this.offline.moneyGain;
      this.offline.showOfflineBox = false
      this.offline.isReceiveAwarded = true
      this.$notifys({ title: '领取离线奖励', message: `你获得了${this.offline.expGain}点修为和${this.offline.moneyGain}个灵石` });
    },
    breakThrough(exp) {
      const reincarnation = this.player.reincarnation ? this.player.reincarnation + 1 : 1;
      if (this.player.level < this.$maxLv) {
        if (this.player.cultivation >= this.player.maxCultivation) {
          if (this.player.level > 10 && this.player.level > this.player.taskNum) {
            /* 修为满了 */
            return;
          }
          this.player.taskNum = 0;
          this.player.level++;
          this.player.points += 3;
          this.player.health = this.player.maxHealth;
          this.player.maxCultivation = Math.floor(100 * Math.pow(2, this.player.level * reincarnation));
        } else {
          this.player.cultivation += exp;
        }
      }
    },
    // 根据装备ID给出信息
    getObjectById(id, arr) {
      return arr.find(obj => obj.id === id);
    },
    handleClose() {
      console.log('dialog closed')
    },

    inventoryClose(item) {
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
        // 装备分解通知
        this.$notifys({ title: '背包装备售卖提示', message: `${item.name}已成功卖出, 你获得了${num}个炼器石` });
      }).catch(() => { });
    },
    // 道具信息
    inventory(id) {
      this.inventoryInfo = this.getObjectById(id, this.offline.equipItems);
      this.inventoryShow = true;
    },

    calculateDifference(item1, item2) {
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

    // 玩家属性操作
    playerAttribute(dodge = 0, attack = 0, health = 0, critical = 0, defense = 0) {
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
    // 穿装备
    equipItem(id, type) {
      const inventoryItem = this.getObjectById(id, this.offline.equipItems);
      // 如果当前装备境界大于人物的境界
      if (!this.player.reincarnation && inventoryItem.level > this.player.level) {
        this.$notifys({ title: '当前境界不足', message: '无法穿戴该装备' });
        return;
      }
      // 如果当前类型的装备已经穿戴，则将其放回离线奖励箱
      if (JSON.stringify(this.player.equipment[type]) != '{}') {
        const equipment = this.player.equipment[type];
        // 更新玩家属性，移除当前穿戴装备的属性加成
        this.playerAttribute(-equipment.dodge, -equipment.attack, -equipment.health, -equipment.critical, -equipment.defense);
        // 将当前装备放回离线奖励箱
        this.offline.equipItems.push(equipment);
      }
      // 装备新装备
      this.player.equipment[type] = inventoryItem;
      // 更新玩家属性，添加当前装备的属性加成
      this.playerAttribute(inventoryItem.dodge, inventoryItem.attack, inventoryItem.health, inventoryItem.critical, inventoryItem.defense);
      // 从离线奖励箱中移除新装备
      this.offline.equipItems = this.offline.equipItems.filter(item => item.id !== id);
      // 重置类型
      type = '';
      // 关闭道具信息弹窗
      this.inventoryShow = false;
    },
    // 道具锁定or道具解锁
    inventoryLock(id) {
      let inventoryItem = this.getObjectById(id, this.player.inventory);
      inventoryItem.lock = !inventoryItem.lock;
      this.$notifys({
        title: !inventoryItem.lock ? '装备解锁提示' : '装备锁定提示',
        message: !inventoryItem.lock ? '装备解锁成功' : '装备锁定成功'
      });
    },

    // 批量分解装备
    sellingEquipment() {
      // 获取玩家离线奖励箱
      const inventory = this.offline.equipItems;
      // 获取玩家装备分解设置
      const sellingEquipmen = this.player.offlinesellingEquipmentData;
      // 检查是否选择了需要分解的品阶
      if (!sellingEquipmen.length) {
        this.$notifys({ title: '背包装备分解提示', message: '你没有选择勾选需要分解的品阶' });
        return;
      }
      // 过滤出可以分解的装备
      const selling = inventory.filter(item => sellingEquipmen.includes(item.quality) && !item.lock);
      // 检查是否有可售卖的装备
      if (!selling.length) {
        this.$notifys({ title: '背包装备分解提示', message: '背包内并没有可以售卖的装备' });
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
      // 清空离线奖励箱内所有未锁定装备与选中分解的品阶
      this.offline.equipItems = inventory.filter(item => !sellingEquipmen.includes(item.quality) || item.lock);
      this.$notifys({ title: '背包装备分解提示', message: `背包内所有非锁定装备已成功分解, 你获得了${strengtheningStoneTotal}个炼器石和${selling.length}个灵石` });
    },
    // 修改玩家装备分解设置
    sellingEquipmentDataChange(val) {
      this.player.offlinesellingEquipmentData = val;
      console.log(val)
    },
  }
}
</script>

<style scoped>
.offline-receiveAwardedTipBtn {
  position: absolute;
  top: 2rem;
  right: 1.6em;

  button {
    width: 100%;
  }
}

.offline-content-container {
  display: flex;
  flex-direction: column;
}

.offline-res-content-container {
  display: flex;
}

.offline-res-text {
  margin-right: 10px
}

.offline-title {
  margin-bottom: 10px;
}

.offline-content {
  display: flex;
  flex-wrap: wrap;
}

.offline-footer {
  display: flex;
  justify-content: end;
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

/* 属性对比 */
.el-icon-caret-top,
.el-icon-caret-bottom {
  width: 1em;
  height: 1em;
  display: block;
  margin-left: 5px;
}

.el-icon-caret-top {
  background-image: url(@/assets/CaretTop.svg);
}

.el-icon-caret-bottom {
  background-image: url(@/assets/caretBottom.svg);
}
</style>


<style scoped>
.inventory-item {
  width: 46%;
  margin: 4px;
}

.dialog-footer {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.dialog-footer-button {
  margin: 10px 0 0 0 !important;
  width: 100%;
}

.dialog-footer-button:nth-child(2+n) {
  margin-top: 10px;
  width: 100%;
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
  .inventory-button {
    margin-left: 0 !important;
    margin-top: 10px;
  }

  .achievement-item {
    width: 50%;
  }
}
</style>
