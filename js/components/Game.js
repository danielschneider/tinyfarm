function Game() {
  const { useState, useEffect, useRef } = React;

  // Sound manager using Web Audio API
  const audioContextRef = useRef(null);

  // Initialize audio context on first user interaction (browser policy)
  const initAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    // Resume if suspended (browser autoplay policy)
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  };

  // Play bling bling coin sound effect (bright, fast, sparkly)
  const playCoinSound = () => {
    initAudioContext();
    
    const audioContext = audioContextRef.current;
    if (!audioContext) return;

    // Create oscillator for bling sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'square'; // Bright, metallic sound
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Bling sound pitch: starts very high, drops fast
    const basePitch = 1200 + Math.random() * 600;
    oscillator.frequency.setValueAtTime(basePitch, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(basePitch * 0.4, audioContext.currentTime + 0.1);

    // Instant attack, very quick decay
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.6, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  };

  // Play level completion jingle (2-second fast happy melody)
  const playLevelCompleteJingle = () => {
    initAudioContext();
    
    const audioContext = audioContextRef.current;
    if (!audioContext) return;

    // Fast melody notes (C major scale - higher octave)
    const notes = [523.25, 659.25, 783.99, 1046.50, 783.99, 659.25, 523.25, 783.99];
    const noteDurations = [0.2, 0.2, 0.2, 0.3, 0.2, 0.2, 0.2, 0.4];

    notes.forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime + index * 0.25);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Envelope for each note - fast attack/decay
      gainNode.gain.setValueAtTime(0, audioContext.currentTime + index * 0.25);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + index * 0.25 + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + index * 0.25 + noteDurations[index]);

      oscillator.start(audioContext.currentTime + index * 0.25);
      oscillator.stop(audioContext.currentTime + index * 0.25 + noteDurations[index]);
    });

    // Fast bass notes for rhythm
    const bassNotes = [261.63, 392.00, 261.63, 392.00];
    bassNotes.forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime + index * 0.5);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      gainNode.gain.setValueAtTime(0, audioContext.currentTime + index * 0.5);
      gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + index * 0.5 + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + index * 0.5 + 0.3);

      oscillator.start(audioContext.currentTime + index * 0.5);
      oscillator.stop(audioContext.currentTime + index * 0.5 + 0.3);
    });
  };

  // Play multiple bling sounds for bigger particle effects
  const playCoinSoundEffect = (count = 1) => {
    for (let i = 0; i < count; i++) {
      setTimeout(() => playCoinSound(), i * 40);
    }
  };

  // Game configuration
  const CONFIG = {
    enablePowerUps: false // Central switch to disable all power ups
  };

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
  const [powerUps, setPowerUps] = useState([]); // Active power-ups on the field
  const [farmer, setFarmer] = useState(() => {
    const bounds = getPlayableBounds();
    return {
      x: (bounds.minX + bounds.maxX) / 2,
      y: (bounds.minY + bounds.maxY) / 2,
      targetId: null,
      carrying: [], // Now an array to support multiple items
      powerUps: [], // Active power-ups the farmer has (tractor, backpack)
      isPowerUpTarget: false, // Indicates if target is a power-up
      isFarmTarget: false // Indicates if target is the farm zone
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

    // Check if the particle origin is within the playable bounds
    const bounds = getPlayableBounds();
    if (x < bounds.minX || x > bounds.maxX || y < bounds.minY || y > bounds.maxY) {
      return; // Omit particle effects outside the fence
    }

    // Play sound effect based on particle type
    if (type === 'rainbows') {
      // Level completion - play special jingle
      playLevelCompleteJingle();
    } else {
      // Regular particles - play coin sound
      const soundCount = type === 'fireworks' ? 3 : 1;
      playCoinSoundEffect(soundCount);
    }

    const newParticles = [];
    for (let i = 0; i < count; i++) {
      // Calculate particle position and ensure it stays within bounds
      let px = x + (Math.random() - 0.5) * particleType.spread;
      let py = y + (Math.random() - 0.5) * particleType.spread;
      
      // Clamp particle position to playable bounds
      px = Math.max(bounds.minX, Math.min(bounds.maxX, px));
      py = Math.max(bounds.minY, Math.min(bounds.maxY, py));

      newParticles.push({
        id: Date.now() + Math.random(),
        x: px,
        y: py,
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
  }, [levelIndex, gameInitialized]);

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

     setItems(newItems);
     setPowerUps(newPowerUps);
     setFarmItems([]); // Clear farm items on new level
     setFarmer((f) => ({
       ...f,
       targetId: null,
       carrying: [],
       powerUps: [], // Clear power-ups on new level
       isPowerUpTarget: false,
       isFarmTarget: false
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
     // Capture current state values to avoid closure staleness
     const currentPowerUps = [...powerUps];
     const currentItems = [...items];
     const currentFarmPos = { ...farmPos };

     setFarmer((prev) => {
        if (!prev.targetId && prev.carrying.length === 0) return prev;

        let target;
         let currentSpeed = BASE_SPEED;
         let maxCarry = 1;

         // Apply vehicle power-ups - only if enabled in config
         if (CONFIG.enablePowerUps) {
           if (prev.powerUps.includes('tractor')) {
             currentSpeed = BASE_SPEED * 2; // Tractor: Double speed
             maxCarry = 2; // Tractor: Carry 2 items
           } else if (prev.powerUps.includes('rocket')) {
             currentSpeed = BASE_SPEED * 4; // Rocket: Quadruple speed
             maxCarry = 4; // Rocket: Carry 4 items
           } else if (prev.powerUps.includes('lotty')) {
             currentSpeed = BASE_SPEED * 3; // Lotty: Triple speed
             maxCarry = 3; // Lotty: Carry 3 items
           }
         }

        if (prev.isFarmTarget) {
          // Move to farm - apply carry speed penalty if carrying items
          if (prev.carrying.length > 0) {
            currentSpeed *= CARRY_SPEED_FACTOR;
          }
          target = { x: currentFarmPos.x + FARM_SIZE / 2, y: currentFarmPos.y + FARM_SIZE / 2 };
        } else {
          // Check if target is a power-up
          if (prev.isPowerUpTarget) {
            const powerUp = currentPowerUps.find((p) => p.id === prev.targetId);
            if (powerUp) {
              target = powerUp;
            } else {
              // Power-up might have been collected already
              return { ...prev, targetId: null, isPowerUpTarget: false };
            }
          } else {
            // Target is an item
            const item = currentItems.find((i) => i.id === prev.targetId);
            if (item) {
              target = item;
            } else {
              return { ...prev, targetId: null };
            }
          }
        }

        const dist = distance(prev, target);
         if (dist < 25) {
          if (prev.isPowerUpTarget) {
            // Collect power-up
            const powerUp = currentPowerUps.find((p) => p.id === prev.targetId);
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
              
              createParticles(powerUp.x, powerUp.y, 'sparkles', 15);
              createFloatingAnimation(powerUp.x, powerUp.y, floatingText);
              return {
                ...prev,
                powerUps: [...prev.powerUps, powerUpType],
                targetId: null,
                isPowerUpTarget: false
              };
            }
          } else if (prev.isFarmTarget) {
            // Deposit items at farm
            prev.carrying.forEach(itemId => {
              const carriedItem = currentItems.find((i) => i.id === itemId);
              if (carriedItem) {
                setFarmItems((old) => [...old, carriedItem.type]);
                createFloatingAnimation(prev.x, prev.y, "+1");
                // Add particle effects
                const randomType = ['happy', 'confetti', 'sparkles', 'hearts'][Math.floor(Math.random() * 4)];
                createParticles(prev.x, prev.y, randomType, 12);
              }
            });
            setItems((old) =>
              old.filter((i) => !prev.carrying.includes(i.id))
            );
            setScore((s) => s + prev.carrying.length);
            return { ...prev, carrying: [], targetId: null, isFarmTarget: false };
          } else {
             // Determine max carry capacity based on power-ups - only if enabled in config
             let maxCarry = 1;
             if (CONFIG.enablePowerUps) {
               if (prev.powerUps.includes('tractor')) {
                 maxCarry = 2;
               } else if (prev.powerUps.includes('rocket')) {
                 maxCarry = 4;
               } else if (prev.powerUps.includes('lotty')) {
                 maxCarry = 3;
               }
             }
            
              if (prev.carrying.length < maxCarry) {
                // Pick up item if not carrying max capacity
                 const updatedFarmer = { ...prev, carrying: [...prev.carrying, prev.targetId], targetId: null };
                 // Automatically find next item to pick up if still under max capacity
                 return setNextItemTarget(updatedFarmer, currentItems);
              } else {
                // Already carrying max capacity - swap items
                console.log("Swapping items - current carrying:", prev.carrying);
                // Remove the first item from carrying to make space for the new one
                const itemToDrop = prev.carrying[0];
                const updatedCarrying = [...prev.carrying.slice(1), prev.targetId];
                const updatedFarmer = { ...prev, carrying: updatedCarrying, targetId: null };
                console.log("Updated carrying after swap:", updatedCarrying);
                // Find the dropped item and spawn it back at the current position
                const droppedItemData = currentItems.find(i => i.id === itemToDrop);
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
               return prev;
             }
          }
        }

        const dx = target.x - prev.x;
        const dy = target.y - prev.y;
        const len = Math.hypot(dx, dy);
        const moveX = (dx / len) * (currentSpeed / 60);
        const moveY = (dy / len) * (currentSpeed / 60);

        return { ...prev, x: prev.x + moveX, y: prev.y + moveY };
      });

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
              const powerUpType = powerUp.type === '🚜' ? 'tractor' : 'backpack';
              createParticles(powerUp.x, powerUp.y, 'sparkles', 15);
              createFloatingAnimation(powerUp.x, powerUp.y, powerUp.type === '🚜' ? 'SPEED UP!' : 'DOUBLE CARRY!');
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

   // Function to automatically find and set next item target if carrying less than max
   function setNextItemTarget(prevFarmer, currentItems) {
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

    if (prevFarmer.carrying.length < maxCarry) {
      // Find the closest item that isn't already being carried
      let closestItem = null;
      let closestDistance = Infinity;
      
      currentItems.forEach(item => {
        if (!prevFarmer.carrying.includes(item.id)) {
          const dist = distance(prevFarmer, item);
          if (dist < closestDistance) {
            closestDistance = dist;
            closestItem = item;
          }
        }
      });

      if (closestItem) {
        return { ...prevFarmer, targetId: closestItem.id, isPowerUpTarget: false, isFarmTarget: false };
      }
    }
    
    return prevFarmer;
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