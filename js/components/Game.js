function Game() {
  const { useState, useEffect, useRef } = React;

  const FENCE_PADDING = 30;
  const FARM_SIZE = 120;
  const BASE_SPEED = 500; // pixels per second
  const CARRY_SPEED_FACTOR = 0.7; // 50% slower when carrying
  const FENCE_OFFSET = 20; // Fence is 20px from edges

  // Get the playable area bounds (inside the fence)
  const getPlayableBounds = () => {
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
  const getRandomFarmPosition = () => {
    const bounds = getPlayableBounds();
    const side = Math.floor(Math.random() * 4); // 0=top, 1=right, 2=bottom, 3=left
    let x, y;
    
    switch(side) {
      case 0: // top
        x = Math.random() * (bounds.maxX - bounds.minX - FARM_SIZE) + bounds.minX;
        y = bounds.minY;
        break;
      case 1: // right
        x = bounds.maxX - FARM_SIZE;
        y = Math.random() * (bounds.maxY - bounds.minY - FARM_SIZE) + bounds.minY;
        break;
      case 2: // bottom
        x = Math.random() * (bounds.maxX - bounds.minX - FARM_SIZE) + bounds.minX;
        y = bounds.maxY - FARM_SIZE;
        break;
      case 3: // left
        x = bounds.minX;
        y = Math.random() * (bounds.maxY - bounds.minY - FARM_SIZE) + bounds.minY;
        break;
    }
    return { x, y };
  };

  // Initialize game state to ensure proper startup
  const [gameInitialized, setGameInitialized] = useState(false);
  const [farmPos, setFarmPos] = useState(() => {
    // Ensure we have valid bounds before setting initial position
    const bounds = getPlayableBounds();
    // Return a position that will be overwritten by startLevel anyway
    return { x: bounds.minX, y: bounds.minY };
  });
  const [levelIndex, setLevelIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [bonus, setBonus] = useState(0);
  const [items, setItems] = useState([]);
  const [farmItems, setFarmItems] = useState([]); // Items collected in farm
  const [farmer, setFarmer] = useState(() => {
    const bounds = getPlayableBounds();
    return {
      x: (bounds.minX + bounds.maxX) / 2,
      y: (bounds.minY + bounds.maxY) / 2,
      targetId: null,
      carrying: null
    };
  });
  const [animations, setAnimations] = useState([]);
  const [particles, setParticles] = useState([]);

  // Particle types with different effects
  const PARTICLE_TYPES = {
    happy: { emoji: ['✨', '⭐', '🌟', '💫'], duration: 1000, spread: 30 },
    confetti: { emoji: ['🎊', '🎉', '🎈', '🎁'], duration: 1500, spread: 40 },
    sparkles: { emoji: ['✨', '✨', '✨', '💥'], duration: 800, spread: 25 },
    hearts: { emoji: ['❤️', '💛', '💚', '💙'], duration: 1200, spread: 35 },
    stars: { emoji: ['⭐', '🌟', '⭐', '🌟'], duration: 1000, spread: 30 },
    bubbles: { emoji: ['🫧', '🫧', '🫧', '💭'], duration: 1500, spread: 40 },
    rainbows: { emoji: ['🌈', '🌈', '🌈', '🌈'], duration: 2000, spread: 300 },
    fireworks: { emoji: ['🎆', '🎇', '💥', '✨'], duration: 1200, spread: 50 }
  };

  function createParticles(x, y, type = 'happy', count = 8) {
    const particleType = PARTICLE_TYPES[type];
    if (!particleType) return;

    const newParticles = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: Date.now() + Math.random(),
        x: x + (Math.random() - 0.5) * particleType.spread,
        y: y + (Math.random() - 0.5) * particleType.spread,
        emoji: particleType.emoji[Math.floor(Math.random() * particleType.emoji.length)],
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2 - 1, // Upward bias
        life: 0,
        maxLife: particleType.duration,
        type: type
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  }

  // Update particles
  function updateParticles() {
    const now = Date.now();
    setParticles(prevParticles => {
      return prevParticles.filter(particle => {
        const age = now - particle.id; // Use id (timestamp) as birth time
        return age < particle.maxLife;
      }).map(particle => {
        const age = now - particle.id;
        const progress = age / particle.maxLife;
        
        return {
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          vx: particle.vx * 0.98, // Air resistance
          vy: particle.vy + 0.05, // Gravity
          life: age
        };
      });
    });
  }

  const startTimeRef = useRef(Date.now());
  const animationRef = useRef();

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
  }, [levelIndex]);

   function startLevel() {
     console.log("Starting level:", levelIndex + 1);
     // Add level start particle effects
     const startBounds = getPlayableBounds();
     //createParticles(startBounds.minX + (startBounds.maxX - startBounds.minX) / 2, startBounds.minY + 50, 'fireworks', 15);
     
     // Generate new random farm position
     setFarmPos(getRandomFarmPosition());
     
     const bounds = getPlayableBounds();
    const range = getSpawnRange(levelIndex);
    const spawnCount =
      Math.floor(Math.random() * (range.max - range.min + 1)) +
      range.min;

    const newItems = [];
    // Generate unique IDs to avoid duplicates
    const uniqueId = Date.now(); // Use timestamp as base for uniqueness
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

    setItems(newItems);
    setFarmItems([]); // Clear farm items on new level
    setFarmer((f) => ({
      ...f,
      targetId: null,
      carrying: null
    }));
    startTimeRef.current = Date.now();
    setBonus(0);
  }

  function distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function createFloatingAnimation(x, y, text) {
    const id = Date.now() + Math.random();
    setAnimations(prev => [...prev, { id, x, y, text }]);
    setTimeout(() => {
      setAnimations(prev => prev.filter(anim => anim.id !== id));
    }, 1000);
  }

   function update(timestamp) {
     // Update particles
     updateParticles();

     // Update farmer movement
    setFarmer((prev) => {
      if (!prev.targetId && !prev.carrying) return prev;

      let target;
      let currentSpeed = BASE_SPEED;

      if (prev.carrying) {
        // Move to farm with slower speed
        currentSpeed = BASE_SPEED * CARRY_SPEED_FACTOR;
        target = { x: farmPos.x + FARM_SIZE / 2, y: farmPos.y + FARM_SIZE / 2 };
      } else {
        const item = items.find((i) => i.id === prev.targetId);
        if (!item) return prev;
        target = item;
      }

      const dist = distance(prev, target);
       if (dist < 5) {
        if (!prev.carrying) {
          // pick up
         // createParticles(prev.x, prev.y, 'sparkles', 8);
          return { ...prev, carrying: prev.targetId, targetId: null };
        } else {
          // deposit - remove item from field and add to farm
          const carriedItem = items.find((i) => i.id === prev.carrying);
           if (carriedItem) {
             setFarmItems((old) => [...old, carriedItem.type]);
             createFloatingAnimation(prev.x, prev.y, "+1");
             // Add particle effects
             const randomType = ['happy', 'confetti', 'sparkles', 'hearts'][Math.floor(Math.random() * 4)];
             createParticles(prev.x, prev.y, randomType, 12);
           }
          setItems((old) =>
            old.filter((i) => i.id !== prev.carrying)
          );
          setScore((s) => s + 1);
          return { ...prev, carrying: null };
        }
      }

      const dx = target.x - prev.x;
      const dy = target.y - prev.y;
      const len = Math.hypot(dx, dy);
      const moveX = (dx / len) * (currentSpeed / 60);
      const moveY = (dy / len) * (currentSpeed / 60);

      return { ...prev, x: prev.x + moveX, y: prev.y + moveY };
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

    animationRef.current = requestAnimationFrame(update);
  }

  useEffect(() => {
    animationRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationRef.current);
  });

  // Track if we're in the process of transitioning levels
  const [transitioning, setTransitioning] = useState(false);
  // Track if the current level has been started (items have been spawned)
  const [levelStarted, setLevelStarted] = useState(false);

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
      createParticles(farmPos.x + FARM_SIZE / 2, farmPos.y + FARM_SIZE / 2, 'rainbows', 20);

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

  function handleItemClick(id) {
    // Use functional update to get the latest state
    setFarmer((prevFarmer) => {
      // If already carrying, drop current item and pick up new one (swap)
      if (prevFarmer.carrying) {
        // Drop the carried item back at current position
        setItems((oldItems) =>
          oldItems.map((i) =>
            i.id === prevFarmer.carrying
              ? { ...i, x: prevFarmer.x + 20, y: prevFarmer.y + 20 }
              : i
          )
        );
        return { ...prevFarmer, targetId: id, carrying: null };
      } else if (!prevFarmer.targetId) {
        // No target, set new target
        return { ...prevFarmer, targetId: id };
      } else {
        // Already have a target, swap to new item
        return { ...prevFarmer, targetId: id };
      }
    });
  }

  return React.createElement(
    "div",
    { className: "game-container" },

    React.createElement("div", { className: "field" }),
    
    // Fence around the arena
    React.createElement("div", { className: "fence" }),

    React.createElement(FarmZone, { 
      x: farmPos.x, 
      y: farmPos.y,
      items: farmItems
    }),

    items.filter((item) => item.id !== farmer.carrying).map((item) =>
      React.createElement(Item, {
        key: item.id,
        item,
        onClick: handleItemClick
      })
    ),

    React.createElement(Farmer, {
      x: farmer.x,
      y: farmer.y,
      carrying: farmer.carrying ? items.find(i => i.id === farmer.carrying)?.type : null
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