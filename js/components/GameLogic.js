import { CONFIG, BASE_SPEED, CARRY_SPEED_FACTOR, FARM_SIZE, distance } from './GameConfig.js';
import { createParticles } from './ParticleSystem.js';

// Create floating animation
export const createFloatingAnimation = (x, y, text) => {
  const id = Date.now() + Math.random();
  return { id, x, y, text };
};

// Set next item target for farmer
export const setNextItemTarget = (farmer, items) => {
  if (farmer.carrying.length === 0) {
    // Find nearest item to pick up
    let nearestItem = null;
    let nearestDistance = Infinity;
    
    items.forEach(item => {
      if (!farmer.carrying.includes(item.id)) {
        const dist = distance(farmer, item);
        if (dist < nearestDistance) {
          nearestDistance = dist;
          nearestItem = item;
        }
      }
    });
    
    if (nearestItem) {
      return { ...farmer, targetId: nearestItem.id, isPowerUpTarget: false, isFarmTarget: false };
    }
  }
  
  return farmer;
};

// Update farmer movement and interactions
export const updateFarmer = (prevFarmer, items, powerUps, farmPos, setFarmItems, setScore, setItems, setPowerUps, createFloatingAnimation, getPlayableBounds) => {
  if (!prevFarmer.targetId && prevFarmer.carrying.length === 0) return prevFarmer;

  let target;
  let currentSpeed = BASE_SPEED;
  let maxCarry = 1;

  // Apply vehicle power-ups - only if enabled in config
  if (CONFIG.enablePowerUps) {
    if (prevFarmer.powerUps.includes('tractor')) {
      currentSpeed = BASE_SPEED * 2; // Tractor: Double speed
      maxCarry = 2; // Tractor: Carry 2 items
    } else if (prevFarmer.powerUps.includes('rocket')) {
      currentSpeed = BASE_SPEED * 4; // Rocket: Quadruple speed
      maxCarry = 4; // Rocket: Carry 4 items
    } else if (prevFarmer.powerUps.includes('lotty')) {
      currentSpeed = BASE_SPEED * 3; // Lotty: Triple speed
      maxCarry = 3; // Lotty: Carry 3 items
    }
  }

  if (prevFarmer.isFarmTarget) {
    // Move to farm - apply carry speed penalty if carrying items
    if (prevFarmer.carrying.length > 0) {
      currentSpeed *= CARRY_SPEED_FACTOR;
    }
    target = { x: farmPos.x + FARM_SIZE / 2, y: farmPos.y + FARM_SIZE / 2 };
  } else {
    // Check if target is a power-up
    if (prevFarmer.isPowerUpTarget) {
      const powerUp = powerUps.find((p) => p.id === prevFarmer.targetId);
      if (powerUp) {
        target = powerUp;
      } else {
        // Power-up might have been collected already
        return { ...prevFarmer, targetId: null, isPowerUpTarget: false };
      }
    } else {
      // Target is an item
      const item = items.find((i) => i.id === prevFarmer.targetId);
      if (item) {
        target = item;
      } else {
        return { ...prevFarmer, targetId: null };
      }
    }
  }

  const dist = distance(prevFarmer, target);
  if (dist < 25) {
    if (prevFarmer.isPowerUpTarget) {
      // Collect power-up
      const powerUp = powerUps.find((p) => p.id === prevFarmer.targetId);
      if (powerUp) {
        setPowerUps(prev => prev.filter(p => p.id !== powerUp.id));
        let powerUpType;
        let floatingText;
        
        switch(powerUp.type) {
          case '🚜':
            powerUpType = 'tractor';
            floatingText = 'TRACTOR POWER!';
            break;
          case '🚀':
            powerUpType = 'rocket';
            floatingText = 'ROCKET BOOST!';
            break;
          case '🏎️':
            powerUpType = 'lotty';
            floatingText = 'LOTTY SPEED!';
            break;
        }
        
        createParticles(powerUp.x, powerUp.y, 'sparkles', 15, getPlayableBounds);
        createFloatingAnimation(powerUp.x, powerUp.y, floatingText);
        return {
          ...prevFarmer,
          powerUps: [...prevFarmer.powerUps, powerUpType],
          targetId: null,
          isPowerUpTarget: false
        };
      }
    } else if (prevFarmer.isFarmTarget) {
      // Deposit items at farm
      prevFarmer.carrying.forEach(itemId => {
        const carriedItem = items.find((i) => i.id === itemId);
        if (carriedItem) {
          setFarmItems((old) => [...old, carriedItem.type]);
          createFloatingAnimation(prevFarmer.x, prevFarmer.y, "+1");
          // Add particle effects
          const randomType = ['happy', 'confetti', 'sparkles', 'hearts'][Math.floor(Math.random() * 4)];
          createParticles(prevFarmer.x, prevFarmer.y, randomType, 12, getPlayableBounds);
        }
      });
      setItems((old) =>
        old.filter((i) => !prevFarmer.carrying.includes(i.id))
      );
      setScore((s) => s + prevFarmer.carrying.length);
      return { ...prevFarmer, carrying: [], targetId: null, isFarmTarget: false };
      } else {
          if (prevFarmer.carrying.length < maxCarry) {
            // Pick up item if not carrying max capacity
             const updatedFarmer = { ...prevFarmer, carrying: [...prevFarmer.carrying, prevFarmer.targetId], targetId: null };
             // Automatically find next item to pick up if still under max capacity
             return setNextItemTarget(updatedFarmer, items);
          } else {
            // Already carrying max capacity - swap items
            console.log("Swapping items - current carrying:", prevFarmer.carrying);
            // Remove the first item from carrying to make space for the new one
            const itemToDrop = prevFarmer.carrying[0];
            const updatedCarrying = [...prevFarmer.carrying.slice(1), prevFarmer.targetId];
            const updatedFarmer = { ...prevFarmer, carrying: updatedCarrying, targetId: null };
            console.log("Updated carrying after swap:", updatedCarrying);
            // Find the dropped item and spawn it back at the current position
            const droppedItemData = items.find(i => i.id === itemToDrop);
            if (droppedItemData) {
              setItems(prevItems => {
                const updatedItems = [...prevItems];
                const itemIndex = updatedItems.findIndex(i => i.id === itemToDrop);
                if (itemIndex !== -1) {
                  updatedItems[itemIndex] = {
                    ...droppedItemData,
                    x: target.x,
                    y: target.y
                  };
                }
                return updatedItems;
              });
            }
            return updatedFarmer;
          }
    }
  }

  // Continue moving towards target
  const dx = target.x - prevFarmer.x;
  const dy = target.y - prevFarmer.y;
  const normalizedDx = dx / dist;
  const normalizedDy = dy / dist;
  
  // Calculate movement
  const movement = currentSpeed * (16 / 1000); // 16ms per frame approximation
  const newX = prevFarmer.x + normalizedDx * movement;
  const newY = prevFarmer.y + normalizedDy * movement;
  
  return { ...prevFarmer, x: newX, y: newY };
};

// Check if level is complete
export const checkLevelComplete = (items, farmItems, levelType) => {
  // Level is complete when all items are collected OR 5 items of target type collected
  if (items.length === 0) return true;
  
  const targetCount = farmItems.filter(item => item === levelType).length;
  return targetCount >= 5;
};
