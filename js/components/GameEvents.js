// Event handlers for the game
import { CONFIG } from './GameConfig.js';

export const handleItemClick = (id, setFarmer, items, farmer) => {
  console.log("handleItemClick called with id:", id);
  console.log("Current farmer state:", farmer);
  console.log("Current items:", items);
  
  // Use functional update to get the latest state
  setFarmer((prevFarmer) => {
    // Check if farmer can carry more items
    let maxCarry = 1;
    if (CONFIG.enablePowerUps) {
      if (prevFarmer.powerUps.includes('tractor')) {
        maxCarry = 2;
      } else if (prevFarmer.powerUps.includes('rocket')) {
        maxCarry = 4;
      } else if (prevFarmer.powerUps.includes('lotty')) {
        maxCarry = 3;
      }
    }
    
    console.log("Previous farmer state:", prevFarmer);
    console.log("Current carry count:", prevFarmer.carrying.length);
    console.log("Max carry capacity:", maxCarry);
    
    if (prevFarmer.carrying.length < maxCarry) {
      // Can carry more - set target to pick up
      console.log("Setting target to id:", id);
      return { ...prevFarmer, targetId: id, isPowerUpTarget: false, isFarmTarget: false };
    } else {
      // Already carrying max capacity - swap items
      console.log("Already carrying max capacity, will swap items");
      return { ...prevFarmer, targetId: id, isPowerUpTarget: false, isFarmTarget: false };
    }
  });
};

export const handlePowerUpClick = (id, setFarmer) => {
  setFarmer((prevFarmer) => {
    // Set power-up as target
    return { ...prevFarmer, targetId: id, isPowerUpTarget: true, isFarmTarget: false };
  });
};

export const handleFarmClick = (setFarmer) => {
  setFarmer((prevFarmer) => {
    if (prevFarmer.carrying.length > 0) {
      // If carrying items, set target to farm to deposit
      return { ...prevFarmer, isFarmTarget: true, targetId: null, isPowerUpTarget: false };
    }
    return prevFarmer;
  });
};
