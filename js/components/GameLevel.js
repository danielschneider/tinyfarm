// Level management for the game
import { LEVELS } from '../levels.js';
import { FARM_SIZE } from './GameConfig.js';
import { startLevel as startLevelState } from './GameState.js';
import { createParticles } from './ParticleSystem.js';

export const startLevel = (levelIndex, setFarmPos, setItems, setPowerUps, setFarmItems, setFarmer, setBonus, startTimeRef, getPlayableBounds) => {
  console.log("Starting level:", levelIndex + 1);
  
  const levelState = startLevelState(levelIndex, LEVELS);
  setFarmPos(levelState.farmPos);
  setItems(levelState.items);
  setPowerUps(levelState.powerUps);
  setFarmItems(levelState.farmItems);
  setFarmer(prev => ({ ...prev, ...levelState.farmer }));
  setBonus(levelState.bonus);
  startTimeRef.current = Date.now();
};

export const handleLevelTransition = (items, gameInitialized, transitioning, levelStarted, levelIndex, startTimeRef, setScore, setBonus, setTransitioning, setLevelIndex, setLevelStarted, farmPos, setParticles, getPlayableBounds) => {
  console.log("Level transition check - items:", items.length, "transitioning:", transitioning, "levelIndex:", levelIndex, "levelStarted:", levelStarted);
  // Only transition if we have no items, we're initialized, not already transitioning, and level has started
  if (items.length === 0 && gameInitialized && !transitioning && levelStarted) {
    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    const levelType = LEVELS[levelIndex % LEVELS.length]; // Cycle through levels
    const targetTime = levelType.targetTime;
    const timeBonus =
      Math.max(0, Math.floor((targetTime - elapsed) / 5)) * 10;

    setScore((s) => s + timeBonus);
    setBonus(timeBonus);
    setTransitioning(true); // Prevent multiple transitions

    // Add level completion particle effects
    const newParticles = createParticles(farmPos.x + FARM_SIZE / 2, farmPos.y + FARM_SIZE / 2, 'rainbows', 20, getPlayableBounds);
    setParticles(prev => [...prev, ...newParticles]);

    setTimeout(() => {
      setLevelIndex((i) => i + 1); // Infinite level progression
      setLevelStarted(false); // Reset for next level
      setTransitioning(false); // Allow transitions again
    }, 2000);
  } else if (items.length > 0 && !levelStarted) {
    // Mark level as started when items are spawned
    setLevelStarted(true);
  }
};
