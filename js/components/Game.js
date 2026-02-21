import { CONFIG, getPlayableBounds, getRandomFarmPosition, FARM_SIZE, distance } from './GameConfig.js';
import { initializeGameState, startLevel as startLevelState } from './GameState.js';
import { createFloatingAnimation, setNextItemTarget, updateFarmer, checkLevelComplete } from './GameLogic.js';
import { createParticles, updateParticles } from './ParticleSystem.js';
import { initAudioContext } from './AudioManager.js';
import { Farmer } from './Farmer.js';
import { Item } from './Item.js';
import { PowerUp } from './PowerUp.js';
import { FarmZone } from './FarmZone.js';
import { ScoreBoard } from './ScoreBoard.js';
import { LEVELS } from '../levels.js';

export function Game() {
  const { useState, useEffect, useRef } = React;

  // Initialize game state
  const [gameInitialized, setGameInitialized] = useState(false);
  const [farmPos, setFarmPos] = useState(() => {
    const bounds = getPlayableBounds();
    return { x: bounds.minX, y: bounds.minY };
  });
  const [levelIndex, setLevelIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [bonus, setBonus] = useState(0);
  const [items, setItems] = useState([]);
  const [farmItems, setFarmItems] = useState([]);
  const [powerUps, setPowerUps] = useState([]);
  const [farmer, setFarmer] = useState(() => {
    const bounds = getPlayableBounds();
    return {
      x: (bounds.minX + bounds.maxX) / 2,
      y: (bounds.minY + bounds.maxY) / 2,
      targetId: null,
      carrying: [],
      powerUps: [],
      isPowerUpTarget: false,
      isFarmTarget: false
    };
  });
  const [animations, setAnimations] = useState([]);
  const [particles, setParticles] = useState([]);

  const startTimeRef = useRef(Date.now());
  const animationRef = useRef();
  const [transitioning, setTransitioning] = useState(false);
  const [levelStarted, setLevelStarted] = useState(false);

  // Initialize game on mount
  useEffect(() => {
    if (!gameInitialized) {
      setGameInitialized(true);
      startLevel();
    }
  }, []);

  // Call startLevel when levelIndex changes
  useEffect(() => {
    if (gameInitialized && levelIndex > 0) {
      console.log("Level index changed to:", levelIndex);
      startLevel();
    }
  }, [levelIndex, gameInitialized]);

  // Animation loop
  useEffect(() => {
    animationRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationRef.current);
  });

  // Level transition logic
  useEffect(() => {
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
  }, [items, gameInitialized, transitioning]);

  // Start a new level
  function startLevel() {
    console.log("Starting level:", levelIndex + 1);
    
    const levelState = startLevelState(levelIndex, LEVELS);
    setFarmPos(levelState.farmPos);
    setItems(levelState.items);
    setPowerUps(levelState.powerUps);
    setFarmItems(levelState.farmItems);
    setFarmer(prev => ({ ...prev, ...levelState.farmer }));
    setBonus(levelState.bonus);
    startTimeRef.current = Date.now();
  }

  // Update game state
  function update(timestamp) {
    // Update particles
    const updatedParticles = updateParticles(particles);
    setParticles(updatedParticles);

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
      getPlayableBounds
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

    animationRef.current = requestAnimationFrame(update);
  }

  // Handle item click
  function handleItemClick(id) {
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
  }

  // Handle power-up click
  function handlePowerUpClick(id) {
    setFarmer((prevFarmer) => {
      // Set power-up as target
      return { ...prevFarmer, targetId: id, isPowerUpTarget: true, isFarmTarget: false };
    });
  }

  // Handle farm zone click
  function handleFarmClick() {
    setFarmer((prevFarmer) => {
      if (prevFarmer.carrying.length > 0) {
        // If carrying items, set target to farm to deposit
        return { ...prevFarmer, isFarmTarget: true, targetId: null, isPowerUpTarget: false };
      }
      return prevFarmer;
    });
  }

  return React.createElement(
    "div",
    { 
      className: "game-container",
      onClick: initAudioContext
    },

    React.createElement("div", { className: "field" }),
    
    // Fence around the arena
    React.createElement("div", { className: "fence" }),

    React.createElement(FarmZone, { 
      x: farmPos.x, 
      y: farmPos.y,
      items: farmItems,
      onClick: handleFarmClick
    }),

     // Render power-ups - only if enabled in config
     CONFIG.enablePowerUps ? powerUps.map((powerUp) =>
       React.createElement(PowerUp, {
         key: powerUp.id,
         powerUp,
         onClick: handlePowerUpClick
       })
     ) : null,

    items.filter((item) => !farmer.carrying.includes(item.id)).map((item) =>
      React.createElement(Item, {
        key: item.id,
        item,
        onClick: handleItemClick
      })
    ),

    React.createElement(Farmer, {
      x: farmer.x,
      y: farmer.y,
      carrying: farmer.carrying.map(itemId => items.find(i => i.id === itemId)?.type).filter(Boolean),
      powerUps: farmer.powerUps
    }),
     animations.map(anim =>
       React.createElement(
         "div",
         {
           key: anim.id,
           className: "floating-animation",
           style: { left: `${anim.x}px`, top: `${anim.y}px` }
         },
         anim.text
       )
     ),
     particles.map(particle =>
       React.createElement(
         "div",
         {
           key: particle.id,
           className: "particle",
           style: {
             left: `${particle.x}px`,
             top: `${particle.y}px`,
             fontSize: `${30 - particle.life / 50}px`,
             opacity: 1 - (particle.life / particle.maxLife),
             transform: `rotate(${particle.life * 2}deg)`
           }
         },
         particle.emoji
       )
     ),

    React.createElement(ScoreBoard, {
      level: levelIndex + 1,
      score,
      bonus
    })
  );
}
