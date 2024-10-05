import achievement from '@/plugins/achievement';

export function checkAchievements (player, type, data) {
    const newAchievements = [];
    switch (type) {
        case 'pet':
            checkPetAchievements(player, data, newAchievements);
            break;
        case 'monster':
            checkMonsterAchievements(player, data, newAchievements);
            break;
        case 'equipment':
            checkEquipmentAchievements(player, data, newAchievements);
            break;
    }
    return newAchievements;
}

function checkPetAchievements (player, pet, newAchievements) {
    const petAchievements = achievement.pet();
    petAchievements.forEach(item => {
        if (!player.achievement.pet.find(i => i.id === item.id) && checkCondition(item.condition, pet)) {
            newAchievements.push(item);
            player.achievement.pet.push({ id: item.id });
            player.props.cultivateDan += item.award;
        }
    });
}

function checkMonsterAchievements (player) {
    const monsterAchievements = achievement.monster();
    monsterAchievements.forEach(item => {
        if (!player.achievement.monster.find(i => i.id === item.id) && checkCondition(item.condition, player)) {
            player.achievement.monster.push({ id: item.id });
            player.props.cultivateDan += item.award;
        }
    });
}

function checkEquipmentAchievements (player, equipmentData, newAchievements) {
    const equipmentAchievements = achievement.equipment();
    equipmentAchievements.forEach(item => {
        if (!player.achievement.equipment.find(i => i.id === item.id) && checkCondition(item.condition, equipmentData)) {
            newAchievements.push(item);
            player.achievement.equipment.push({ id: item.id });
            player.props.cultivateDan += item.award;
        }
    });
}

function checkCondition (condition, data) {
    for (const [key, value] of Object.entries(condition)) {
        if (data[key] === undefined || data[key] < value) {
            return false;
        }
    }
    return true;
}