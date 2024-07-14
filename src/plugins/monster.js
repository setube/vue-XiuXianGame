const monsters = {
    monster_Names (lv) {
        const names_a = [  
            '影魅狸奴',  
            '幽谷灵蛇',  
            '雾隐狐仙',  
            '松间灵猴',  
            '月影蝠妖',  
            '山涧蛟童',  
            '林涧鹿灵',  
            '岩隙石精',  
            '风鸣鹤怪',  
            '翠竹蛙仙'  
        ];
        const names_b = [  
            '青龙啸天',  
            '白虎破晓',  
            '朱雀焚翼',  
            '玄武镇海',  
            '麒麟踏瑞',  
            '凤凰涅槃',  
            '毕方炽焰',  
            '貔貅吞金',  
            '白泽知世',  
            '狻猊御火'  
        ];
        const names_c = [  
            '伏羲天帝',  
            '女娲圣母',  
            '昊天玉皇',  
            '太上老君',  
            '东华帝君',  
            '西王母后',  
            '神农炎帝',  
            '轩辕黄帝',  
            '瑶姬仙子',  
            '真武大帝'  
        ];
        if (lv >= 1 || lv <= 5) {
            return names_a[Math.floor(Math.random() * names_a.length)];
        } else if (lv >= 6 || lv <= 10) {
            return names_b[Math.floor(Math.random() * names_b.length)];
        } else {
            return names_c[Math.floor(Math.random() * names_c.length)];
        }
    },
    monster_Attack (lv) {
        if (lv >= 1 || lv <= 5) {
            return this.getRandomInt(50, 150) * lv;
        } else if (lv >= 6 || lv <= 10) {
            return this.getRandomInt(300, 500) * lv;
        } else {
            return this.getRandomInt(1000, 5000) * lv;
        }
    },
    monster_Health (lv) {
        if (lv >= 1 || lv <= 5) {
            return this.getRandomInt(100, 500) * lv;
        } else if (lv >= 6 || lv <= 10) {
            return this.getRandomInt(1000, 1500) * lv;
        } else {
            return this.getRandomInt(5000, 10000) * lv;
        }
    },
    monster_Defense (lv) {
        if (lv >= 1 || lv <= 5) {
            return this.getRandomInt(1, 15) * lv;
        } else if (lv >= 6 || lv <= 10) {
            return this.getRandomInt(15, 30) * lv;
        } else {
            return this.getRandomInt(30, 50) * lv;
        }
    },
    getRandomInt(min, max) {  
        min = Math.ceil(min); // 确保最小值是整数  
        max = Math.floor(max); // 确保最大值是整数  
        return Math.floor(Math.random() * (max - min + 1)) + min; // 生成一个介于min和max之间的随机整数  
    }
}; 
export default monsters;