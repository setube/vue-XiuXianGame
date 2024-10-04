export default {
    calculateDamage(attacker, defender) {
      // 基础伤害计算
      let damage = Math.max(0, Math.floor(attacker.attack - defender.defense));
      damage = damage <= 1 ? 1 : damage; // 伤害最小为1
  
      // 闪避判定
      const isHit = Math.random() > defender.dodge;
      if (!isHit) {
        return { damage: 0, isCritical: false, isHit: false };
      }
  
      // 暴击判定
      let isCritical = false;
      if (Math.random() < attacker.critical) {
        damage *= 1.5;
        isCritical = true;
      }
     // 返回计算结果，包括伤害值，暴击状态和命中状态 
      return { damage, isCritical, isHit: true };
    },
  
    executeCombatRound(attacker, defender) {
      const attackResult = this.calculateDamage(attacker, defender);
      
      if (attackResult.isHit) {
        defender.health = Math.max(0, defender.health - attackResult.damage);
      }
    // 返回本轮攻击的结果，包括伤害值，暴击状态，命中状态及防御者剩余生命值
      return {
        damage: attackResult.damage,
        isCritical: attackResult.isCritical,
        isHit: attackResult.isHit,
        remainingHealth: defender.health
      };
    }
  };