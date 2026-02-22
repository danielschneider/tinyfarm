import { CONFIG, getPlayableBounds, getRandomFarmPosition, FARM_SIZE } from './GameConfig.js';
import { initializeGameState } from './GameState.js';
import { updateGame } from './GameUpdate.js';
import { startLevel, handleLevelTransition } from './GameLevel.js';
import { handleItemClick, handlePowerUpClick, handleFarmClick } from './GameEvents.js';
import { initAudioContext } from './AudioManager.js';
import { Farmer } from './Farmer.js';
import { Item } from './Item.js';
import { PowerUp } from './PowerUp.js';
import { FarmZone } from './FarmZone.js';
import { ScoreBoard } from './ScoreBoard.js';
import { UpgradeShop } from './UpgradeShop.js';
import { UPGRADES, getUpgradeLevel } from './UpgradeSystem.js';
import { Coin } from './Coin.js';
import { createParticles } from './ParticleSystem.js';
import { createFloatingAnimation } from './GameLogic.js';

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
  const [coins, setCoins] = useState([]);
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
  const [combo, setCombo] = useState(0);
  const [comboTimer, setComboTimer] = useState(0);
  const [highScore, setHighScore] = useState(() => localStorage.getItem('tinyFarmHighScore') || 0);

  const startTimeRef = useRef(Date.now());
  const animationRef = useRef();
  const [transitioning, setTransitioning] = useState(false);
  const [levelStarted, setLevelStarted] = useState(false);

  // Initialize game on mount
  useEffect(() => {
    if (!gameInitialized) {
      setGameInitialized(true);
      startLevel(levelIndex, setFarmPos, setItems, setPowerUps, setFarmItems, setFarmer, setBonus, setCoins, startTimeRef, getPlayableBounds);
    }
  }, []);

  // Call startLevel when levelIndex changes
  useEffect(() => {
    if (gameInitialized && levelIndex > 0) {
      console.log("Level index changed to:", levelIndex);
      startLevel(levelIndex, setFarmPos, setItems, setPowerUps, setFarmItems, setFarmer, setBonus, setCoins, startTimeRef, getPlayableBounds);
    }
  }, [levelIndex, gameInitialized]);

  // Animation loop
  useEffect(() => {
    animationRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationRef.current);
  });

  // Combo timer
  useEffect(() => {
    if (comboTimer > 0) {
      const timer = setInterval(() => {
        setComboTimer((t) => {
          if (t <= 100) {
            setCombo(0);
            return 0;
          }
          return t - 100;
        });
      }, 100);
      return () => clearInterval(timer);
    }
  }, [comboTimer]);

  // Level transition logic
  useEffect(() => {
    handleLevelTransition(
      items,
      gameInitialized,
      transitioning,
      levelStarted,
      levelIndex,
      startTimeRef,
      setScore,
      setBonus,
      setTransitioning,
      setLevelIndex,
      setLevelStarted,
      farmPos,
      setParticles,
      getPlayableBounds,
      farmer
    );
  }, [items, gameInitialized, transitioning, farmer]);

  // Update game state
   function update(timestamp) {
    updateGame(
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
    );

    animationRef.current = requestAnimationFrame(update);
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
      onClick: () => handleFarmClick(setFarmer)
    }),

     // Render coins
     coins.map((coin) =>
       React.createElement(Coin, {
         key: coin.id,
         coin: coin,
         onClick: (id) => {
           setCoins(prev => prev.filter(c => c.id !== id));
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
         }
       })
     ),

     // Render power-ups - only if enabled in config
     CONFIG.enablePowerUps ? powerUps.map((powerUp) =>
       React.createElement(PowerUp, {
         key: powerUp.id,
         powerUp,
         onClick: (id) => handlePowerUpClick(id, setFarmer)
       })
     ) : null,

    items.filter((item) => !farmer.carrying.includes(item.id)).map((item) =>
      React.createElement(Item, {
        key: item.id,
        item,
        onClick: (id) => handleItemClick(id, setFarmer, items, farmer)
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

     React.createElement(UpgradeShop, {
      score,
      onUpgradePurchase: setScore
    }),
     React.createElement(ScoreBoard, {
      level: levelIndex + 1,
      score,
      bonus,
      combo,
      highScore
    })
  );
}
