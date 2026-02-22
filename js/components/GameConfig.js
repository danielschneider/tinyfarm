// Game configuration
export const CONFIG = {
  enablePowerUps: true // Central switch to disable all power ups
};

// Game constants
export const FENCE_PADDING = 30;
export const FARM_SIZE = 120;
export const BASE_SPEED = 500; // pixels per second
export const CARRY_SPEED_FACTOR = 0.7; // 50% slower when carrying
export const FENCE_OFFSET = 20; // Fence is 20px from edges

// Get the playable area bounds (inside the fence)
export const getPlayableBounds = () => {
  const fenceInset = 20;
  const padding = 60;
  // Use a minimum size to ensure playable area exists
  const minSize = 200;
  const width = Math.max(window.innerWidth, minSize);
  const height = Math.max(window.innerHeight - 20, minSize); // Subtract 20px to ensure bottom is visible
  return {
    minX: fenceInset + padding,
    minY: fenceInset + padding,
    maxX: width - fenceInset - padding,
    maxY: height - fenceInset - padding
  };
};

// Random farm position within bounds
export const getRandomFarmPosition = (farmSize = FARM_SIZE) => {
  const bounds = getPlayableBounds();
  const side = Math.floor(Math.random() * 4); // 0=top, 1=right, 2=bottom, 3=left
  let x, y;
  
  switch(side) {
    case 0: // top
      x = Math.random() * (bounds.maxX - bounds.minX - farmSize) + bounds.minX;
      y = bounds.minY;
      break;
    case 1: // right
      x = bounds.maxX - farmSize;
      y = Math.random() * (bounds.maxY - bounds.minY - farmSize) + bounds.minY;
      break;
    case 2: // bottom
      x = Math.random() * (bounds.maxX - bounds.minX - farmSize) + bounds.minX;
      y = bounds.maxY - farmSize;
      break;
    case 3: // left
      x = bounds.minX;
      y = Math.random() * (bounds.maxY - bounds.minY - farmSize) + bounds.minY;
      break;
  }
  return { x, y };
};

// Distance calculation between two points
export const distance = (a, b) => {
  return Math.hypot(a.x - b.x, a.y - b.y);
};
