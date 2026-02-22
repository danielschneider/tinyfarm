import { CONFIG, getPlayableBounds, getRandomFarmPosition, FARM_SIZE } from './GameConfig.js';
import { LEVELS } from '../levels.js';

// Initialize game state to ensure proper startup
export const initializeGameState = () => {
  const bounds = getPlayableBounds();
  
  return {
    gameInitialized: false,
    farmPos: { x: bounds.minX, y: bounds.minY }, // Will be overwritten by startLevel
    levelIndex: 0,
    score: 0,
    bonus: 0,
    items: [],
    farmItems: [], // Items collected in farm
    coins: [], // Collectible coins
    powerUps: [], // Active power-ups on the field
    farmer: {
      x: (bounds.minX + bounds.maxX) / 2,
      y: (bounds.minY + bounds.maxY) / 2,
      targetId: null,
      carrying: [], // Now an array to support multiple items
      powerUps: [], // Active power-ups the farmer has (tractor, backpack)
      isPowerUpTarget: false, // Indicates if target is a power-up
      isFarmTarget: false // Indicates if target is the farm zone
    },
    animations: [],
    particles: []
  };
};

// Start a new level
export const startLevel = (levelIndex, LEVELS) => {
  console.log("Starting level:", levelIndex + 1);
  
  // Generate new random farm position
  const farmPos = getRandomFarmPosition();
  
  const bounds = getPlayableBounds();
  const range = getSpawnRange(levelIndex);
  const spawnCount =
    Math.floor(Math.random() * (range.max - range.min + 1)) +
    range.min;

  const newItems = [];
  // Generate unique IDs to avoid duplicates
  // Use combination of timestamp, level index, and random for maximum uniqueness
  const uniqueId = Date.now() * 1000 + levelIndex * 100 + Math.floor(Math.random() * 100);
  const levelType = LEVELS[levelIndex % LEVELS.length]; // Cycle through levels
  const isAnimal = levelType.emoji.match(/[🐑🐖🐓🐄🐇🐐]/); // Check if it's an animal
  for (let i = 0; i < spawnCount; i++) {
    newItems.push({
      id: uniqueId + i,
      type: levelType.emoji,
      x: Math.random() * (bounds.maxX - bounds.minX - 60) + bounds.minX + 30,
      y: Math.random() * (bounds.maxY - bounds.minY - 60) + bounds.minY + 30,
      vx: isAnimal ? (Math.random() - 0.5) * levelType.wanderSpeed : 0, // Use level-specific speed
      vy: isAnimal ? (Math.random() - 0.5) * levelType.wanderSpeed : 0  // Use level-specific speed
    });
  }

  // Spawn power-ups - only if enabled in config
  const newPowerUps = [];
  if (CONFIG.enablePowerUps) {
    const powerUpTypes = ['🚜', '🚀', '🏎️']; // Tractor, Rocket, Lotty
    const powerUpCount = Math.random() < 0.6 ? 1 : 0; // 60% chance for 1 power-up per level
    
    const selectedTypes = [];
    for (let i = 0; i < powerUpCount; i++) {
      let powerUpType;
      // Ensure only one of each type
      if (selectedTypes.length === 0) {
        powerUpType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
      } else {
        powerUpType = powerUpTypes.find(type => !selectedTypes.includes(type));
        if (!powerUpType) break; // No more unique types available
      }
      
      newPowerUps.push({
        id: uniqueId + spawnCount + i,
        type: powerUpType,
        x: Math.random() * (bounds.maxX - bounds.minX - 60) + bounds.minX + 30,
        y: Math.random() * (bounds.maxY - bounds.minY - 60) + bounds.minY + 30
      });
      selectedTypes.push(powerUpType);
    }
  }

  return {
    farmPos,
    items: newItems,
    coins: [], // Clear coins on new level
    powerUps: newPowerUps,
    farmItems: [],
    farmer: {
      targetId: null,
      carrying: [],
      powerUps: [], // Clear power-ups on new level
      isPowerUpTarget: false,
      isFarmTarget: false
    },
    bonus: 0
  };
};

// Get spawn range based on level index
const getSpawnRange = (levelIndex) => {
  // Increase difficulty with levels - spawn more items
  const baseMin = 3;
  const baseMax = 5;
  const levelMultiplier = Math.floor(levelIndex / 3); // Increase every 3 levels
  return {
    min: baseMin + levelMultiplier,
    max: baseMax + levelMultiplier * 2
  };
};
