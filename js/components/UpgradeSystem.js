export const UPGRADES = {
  speed: {
    name: "Speed Boost",
    description: "Increase farmer movement speed",
    icon: "⚡",
    baseCost: 100,
    maxLevel: 10,
    effect: (level) => 1 + (level * 0.1) // +10% per level
  },
  capacity: {
    name: "Carry Capacity",
    description: "Increase item carrying capacity",
    icon: "🎒",
    baseCost: 300,
    maxLevel: 5,
    effect: (level) => 1 + level // +1 per level
  }
};

export function getUpgradeLevel(upgradeType) {
  return parseInt(localStorage.getItem(`upgrade_${upgradeType}`) || "0");
}

export function setUpgradeLevel(upgradeType, level) {
  localStorage.setItem(`upgrade_${upgradeType}`, level.toString());
}

export function getUpgradeCost(upgradeType, currentLevel) {
  const upgrade = UPGRADES[upgradeType];
  return Math.floor(upgrade.baseCost * Math.pow(1.5, currentLevel));
}

export function canAffordUpgrade(upgradeType, currentLevel, score) {
  return score >= getUpgradeCost(upgradeType, currentLevel);
}

export function purchaseUpgrade(upgradeType, currentLevel, score, setScore) {
  const cost = getUpgradeCost(upgradeType, currentLevel);
  if (score >= cost) {
    const newLevel = currentLevel + 1;
    setUpgradeLevel(upgradeType, newLevel);
    setScore(score - cost);
    return newLevel;
  }
  return currentLevel;
}
