const shop = {
  drawPrize(lv) {
    const types = [
      { type: 'weapon', data: this.equipWeapons() },
      { type: 'armor', data: this.equipArmors() },
      { type: 'accessory', data: this.equipAccessories() },
      { type: 'sutra', data: this.equipSutras() },
      { type: 'pet', data: this.equipPet() },
    ]
    const genre = { sutra: '法器', armor: '护甲', weapon: '兵器', accessory: '灵宝', pet: '灵宠' }
    const getAttribute = (type, lv, attribute) => {
      // 根据装备品质调整装备属性值
      const multiplier = 15
      const dodge = this.getRandomFloatInRange(0.02, 0.25)
      const Attack = this.getRandomInt(200, 1000) * lv
      const Health = this.getRandomInt(2000, 10000) * lv
      const defense = this.getRandomInt(200, 1000) * lv
      const CriticalHitrate = this.getRandomFloatInRange(0.02, 0.25)
      const attrs = {
        score: this.calculateEquipmentScore(dodge, Attack, Health, CriticalHitrate, defense), // 装备评分
        dodge: ['accessory', 'sutra'].includes(type) ? dodge : 0,
        attack: ['weapon', 'accessory', 'sutra'].includes(type) ? Attack * multiplier : 0,
        health: ['armor', 'accessory', 'sutra'].includes(type) ? Health * multiplier : 0,
        defense: ['armor', 'accessory', 'sutra'].includes(type) ? defense * multiplier : 0,
        critical: ['weapon', 'accessory', 'sutra'].includes(type) ? CriticalHitrate : 0,
      }
      return attrs[attribute]
    }
    return types.map(({ type, data }) => ({
      type,
      name: genre[type],
      data: data.flatMap((name) => ({
        id: Date.now(),
        name,
        type,
        lock: true,
        level: lv,
        score: getAttribute(type, lv, 'score'),
        dodge: getAttribute(type, lv, 'dodge'),
        attack: getAttribute(type, lv, 'attack'),
        health: getAttribute(type, lv, 'health'),
        defense: getAttribute(type, lv, 'defense'),
        critical: getAttribute(type, lv, 'critical'),
        // 初始数据
        initial: {
          dodge: getAttribute(type, lv, 'dodge'), // 闪避率
          attack: getAttribute(type, lv, 'attack'), // 攻击力
          health: getAttribute(type, lv, 'health'), // 血量
          defense: getAttribute(type, lv, 'defense'), // 装备防御
          critical: getAttribute(type, lv, 'critical'), // 暴击率
        },
        quality: 'pink',
      })),
    }))
  },
  equipWeapons() {
    return [
      '粉晶月刃剑',
      '樱花吹雪弓',
      '蔷薇缠绕鞭',
      '蜜桃梦境杖',
      '粉蝶幻光刃',
      '粉晶流光扇',
      '甜梦水晶枪',
      '粉樱魔法杖',
      '粉钻心语弩',
      '柔粉蔷薇盾',
    ]
  },
  equipArmors() {
    return [
      '粉樱绮梦裳',
      '甜梦粉蝶衣',
      '蜜桃恋曲裙',
      '粉晶流光铠',
      '樱花恋歌袍',
      '柔粉蔷薇甲',
      '粉蝶翩翩袖',
      '甜梦羽织衣',
      '粉晶幻彩裙',
      '蜜桃梦境袍',
    ]
  },
  equipAccessories() {
    return [
      '粉晶梦蝶链',
      '樱花恋曲簪',
      '甜梦蔷薇戒',
      '蜜桃绮梦环',
      '粉蝶轻舞坠',
      '粉晶甜蜜链',
      '柔粉心语珥',
      '樱花绮梦镯',
      '蜜桃梦境簪',
      '粉蝶幻彩带',
    ]
  },
  equipSutras() {
    return [
      '粉樱梦幻笛',
      '甜心粉蝶壶',
      '蜜桃恋语镜',
      '粉晶流光珠',
      '柔粉绮梦石',
      '樱花纷飞扇',
      '甜梦绮罗盘',
      '蜜桃幻影灯',
      '粉蝶织梦琴',
      '粉樱守护符',
    ]
  },
  equipPet() {
    return ['白虎战神']
  },
  getRandomInt(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1)) + min
  },
  getRandomFloatInRange(min, max) {
    return Math.random() * (max - min) + min
  },
  // 计算装备评分
  calculateEquipmentScore(dodge = 0, attack = 0, health = 0, critical = 0, defense = 0) {
    // 评分权重
    const weights = {
      attack: 1.5, // 攻击
      health: 1.0, // 气血
      defense: 1.2, // 防御
      critRate: 1.8, // 暴击
      dodgeRate: 1.6, //闪避
    }
    // 计算评分
    const score =
      dodge * weights.dodgeRate +
      attack * weights.attack +
      (health / 100) * weights.health +
      defense * weights.defense +
      critical * weights.critRate
    return Math.floor(score)
  },
}
export default shop
