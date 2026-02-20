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

  const startTimeRef = useRef(Date.now());
  const animationRef = useRef();

  useEffect(() => {
    // Call startLevel when levelIndex changes, regardless of gameInitialized state
    startLevel();
  }, [levelIndex]);

  // Initialize game on mount
  useEffect(() => {
    if (!gameInitialized) {
      setGameInitialized(true);
    }
  }, []);

  function startLevel() {
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
    for (let i = 0; i < spawnCount; i++) {
      newItems.push({
        id: uniqueId + i,
        type: LEVELS[levelIndex].emoji,
        x: Math.random() * (bounds.maxX - bounds.minX - 60) + bounds.minX + 30,
        y: Math.random() * (bounds.maxY - bounds.minY - 60) + bounds.minY + 30
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

  function update(timestamp) {
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
          return { ...prev, carrying: prev.targetId, targetId: null };
        } else {
          // deposit - remove item from field and add to farm
          const carriedItem = items.find((i) => i.id === prev.carrying);
          if (carriedItem) {
            setFarmItems((old) => [...old, carriedItem.type]);
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

    animationRef.current = requestAnimationFrame(update);
  }

  useEffect(() => {
    animationRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationRef.current);
  });

  useEffect(() => {
    if (items.length === 0 && gameInitialized) {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const targetTime = LEVELS[levelIndex].targetTime;
      const timeBonus =
        Math.max(0, Math.floor((targetTime - elapsed) / 5)) * 10;

      setScore((s) => s + timeBonus);
      setBonus(timeBonus);

      setTimeout(() => {
        setLevelIndex((i) => (i + 1) % LEVELS.length);
      }, 2000);
    }
  }, [items, gameInitialized]);

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

    React.createElement(ScoreBoard, {
      level: levelIndex + 1,
      score,
      bonus
    })
  );
}