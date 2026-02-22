// Game update and collision detection
import { CONFIG, distance, getPlayableBounds } from './GameConfig.js';
import { updateFarmer } from './GameLogic.js';
import { updateParticles, createParticles } from './ParticleSystem.js';
import { createFloatingAnimation } from './GameLogic.js';

// Coin spawn configuration
const COIN_SPAWN_INTERVAL = 5000; // Spawn a coin every 5 seconds
const COIN_LIFETIME = 10000; // Coins disappear after 10 seconds
let lastCoinSpawn = Date.now();

export const updateGame = (
  particles,
  setParticles,
  powerUps,
  setPowerUps,
  items,
  setItems,
  coins,
  setCoins,
  farmer,
  setFarmer,
  farmPos,
  setFarmItems,
  setScore,
  setAnimations,
  combo,
  setCombo,
  setComboTimer
) => {
  // Update particles
  const updatedParticles = updateParticles(particles);
  setParticles(updatedParticles);

  // Spawn coins randomly
  const now = Date.now();
  if (now - lastCoinSpawn > COIN_SPAWN_INTERVAL && coins.length < 3) { // Max 3 coins at a time
    lastCoinSpawn = now;
    const bounds = getPlayableBounds();
    const newCoin = {
      id: now + Math.random(),
      x: Math.random() * (bounds.maxX - bounds.minX - 60) + bounds.minX + 30,
      y: Math.random() * (bounds.maxY - bounds.minY - 60) + bounds.minY + 30,
      value: 10, // Each coin gives 10 points
      spawnTime: now
    };
    setCoins(prev => [...prev, newCoin]);
  }

  // Remove expired coins
  setCoins(prev => prev.filter(coin => now - coin.spawnTime < COIN_LIFETIME));

  // Update farmer movement
  const currentPowerUps = [...powerUps];
  const currentItems = [...items];
  const currentFarmPos = { ...farmPos };

  setFarmer(prev => updateFarmer(
    prev,
    currentItems,
    currentPowerUps,
    currentFarmPos,
    setFarmItems,
    setScore,
    setItems,
    setPowerUps,
    (x, y, text) => {
      const anim = createFloatingAnimation(x, y, text);
      setAnimations(prev => [...prev, anim]);
      setTimeout(() => {
        setAnimations(prev => prev.filter(a => a.id !== anim.id));
      }, 1000);
    },
    getPlayableBounds,
    combo,
    setCombo,
    setComboTimer
  ));

  // Check for power-up collisions with farmer - only if enabled in config
  if (CONFIG.enablePowerUps) {
    const updatedPowerUps = [...powerUps];
    setFarmer((prevFarmer) => {
      for (let powerUp of updatedPowerUps) {
        const dist = distance(prevFarmer, powerUp);
        if (dist < 30) { // Collision radius
          // Collect power-up
          setPowerUps(prev => prev.filter(p => p.id !== powerUp.id));
          // Add power-up effect
          const powerUpType = 
            powerUp.type === '🚜' ? 'tractor' : 
            powerUp.type === '🚀' ? 'rocket' : 
            powerUp.type === '🏎️' ? 'lotty' : 'backpack';
          const newParticles = createParticles(powerUp.x, powerUp.y, 'sparkles', 15, getPlayableBounds);
          setParticles(prev => [...prev, ...newParticles]);
          
          const anim = createFloatingAnimation(powerUp.x, powerUp.y, 
            powerUp.type === '🚜' ? 'TRACTOR POWER!' : 
            powerUp.type === '🚀' ? 'ROCKET BOOST!' : 
            powerUp.type === '🏎️' ? 'LOTTY SPEED!' : 'POWER UP!');
          setAnimations(prev => [...prev, anim]);
          setTimeout(() => {
            setAnimations(prev => prev.filter(a => a.id !== anim.id));
          }, 1000);

          return {
            ...prevFarmer,
            powerUps: [...prevFarmer.powerUps, powerUpType]
          };
        }
      }
      return prevFarmer;
    });
  }

  // Check for coin collisions with farmer
  setFarmer((prevFarmer) => {
    for (let coin of coins) {
      const dist = distance(prevFarmer, coin);
      if (dist < 30) { // Collision radius
        // Collect coin
        setCoins(prev => prev.filter(c => c.id !== coin.id));
        setScore(prev => prev + coin.value);
        // Add particle effects (reduced for performance)
        const newParticles = createParticles(coin.x, coin.y, 'coins', 8, getPlayableBounds);
        const sparkles = createParticles(coin.x, coin.y, 'sparkles', 5, getPlayableBounds);
        setParticles(prev => [...prev, ...newParticles, ...sparkles]);
        // Create floating animation
        const anim = createFloatingAnimation(coin.x, coin.y, `+${coin.value}`);
        setAnimations(prev => [...prev, anim]);
        setTimeout(() => {
          setAnimations(prev => prev.filter(a => a.id !== anim.id));
        }, 1000);
        break; // Collect one coin at a time
      }
    }
    return prevFarmer;
  });

  // Update wandering animals
  const bounds = getPlayableBounds();
  setItems(prevItems => {
    return prevItems.map(item => {
      // All animals wander (sheep, pigs, chickens, cows, bunnies, goats)
      if (item.type.match(/[🐑🐖🐓🐄🐇🐐]/) && item.vx !== undefined && item.vy !== undefined) {
        let newX = item.x + item.vx;
        let newY = item.y + item.vy;
        let newVx = item.vx;
        let newVy = item.vy;

        // Bounce off walls
        if (newX < bounds.minX || newX > bounds.maxX) {
          newVx = -item.vx;
          newX = Math.max(bounds.minX, Math.min(bounds.maxX, newX));
        }
        if (newY < bounds.minY || newY > bounds.maxY) {
          newVy = -item.vy;
          newY = Math.max(bounds.minY, Math.min(bounds.maxY, newY));
        }

        return { ...item, x: newX, y: newY, vx: newVx, vy: newVy };
      }
      return item;
    });
  });
};
