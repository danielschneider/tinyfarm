export const ACHIEVEMENTS = {
  firstGame: {
    name: "First Game",
    description: "Complete your first level",
    icon: "🎮",
    unlocked: false,
    type: "milestone"
  },
  score100: {
    name: "Century",
    description: "Reach 100 points",
    icon: "🏆",
    unlocked: false,
    type: "score",
    target: 100
  },
  score500: {
    name: "Half-Millionaire",
    description: "Reach 500 points",
    icon: "🎖️",
    unlocked: false,
    type: "score",
    target: 500
  },
  score1000: {
    name: "Thousand Points",
    description: "Reach 1000 points",
    icon: "⭐",
    unlocked: false,
    type: "score",
    target: 1000
  },
  combo5: {
    name: "Combo King",
    description: "Get a 5x combo",
    icon: "🔥",
    unlocked: false,
    type: "combo",
    target: 5
  },
  combo10: {
    name: "Combo Master",
    description: "Get a 10x combo",
    icon: "💎",
    unlocked: false,
    type: "combo",
    target: 10
  },
  level5: {
    name: "Level 5",
    description: "Reach level 5",
    icon: "🌟",
    unlocked: false,
    type: "level",
    target: 5
  },
  level10: {
    name: "Level 10",
    description: "Reach level 10",
    icon: "🎉",
    unlocked: false,
    type: "level",
    target: 10
  },
  speedDemon: {
    name: "Speed Demon",
    description: "Upgrade speed to level 5",
    icon: "⚡",
    unlocked: false,
    type: "upgrade",
    target: "speed",
    level: 5
  },
  packRat: {
    name: "Pack Rat",
    description: "Upgrade capacity to level 3",
    icon: "🎒",
    unlocked: false,
    type: "upgrade",
    target: "capacity",
    level: 3
  },

};

export function loadAchievements() {
  const saved = localStorage.getItem('tinyFarmAchievements');
  if (saved) {
    return JSON.parse(saved);
  }
  return Object.keys(ACHIEVEMENTS).reduce((obj, key) => {
    obj[key] = { ...ACHIEVEMENTS[key], unlocked: false };
    return obj;
  }, {});
}

export function saveAchievements(achievements) {
  localStorage.setItem('tinyFarmAchievements', JSON.stringify(achievements));
}

export function checkAchievements(achievements, score, combo, level, upgrades) {
  const newAchievements = { ...achievements };
  let unlocked = [];

  Object.keys(ACHIEVEMENTS).forEach(key => {
    if (!newAchievements[key].unlocked) {
      const achievement = ACHIEVEMENTS[key];
      
      switch(achievement.type) {
        case 'milestone':
          if (level > 0) {
            newAchievements[key].unlocked = true;
            unlocked.push(key);
          }
          break;
          
        case 'score':
          if (score >= achievement.target) {
            newAchievements[key].unlocked = true;
            unlocked.push(key);
          }
          break;
          
        case 'combo':
          if (combo >= achievement.target) {
            newAchievements[key].unlocked = true;
            unlocked.push(key);
          }
          break;
          
        case 'level':
          if (level >= achievement.target) {
            newAchievements[key].unlocked = true;
            unlocked.push(key);
          }
          break;
          
        case 'upgrade':
          if (upgrades[achievement.target] >= achievement.level) {
            newAchievements[key].unlocked = true;
            unlocked.push(key);
          }
          break;
      }
    }
  });

  if (unlocked.length > 0) {
    saveAchievements(newAchievements);
  }

  return { achievements: newAchievements, unlocked };
}
