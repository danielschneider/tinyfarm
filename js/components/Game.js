function Game() {
  const { useState, useEffect, useRef } = React;

  const FARM_X = 40;
  const FARM_Y = 40;
  const FARM_SIZE = 120;
  const SPEED = 200; // pixels per second

  const [levelIndex, setLevelIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [bonus, setBonus] = useState(0);
  const [items, setItems] = useState([]);
  const [farmer, setFarmer] = useState({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    targetId: null,
    carrying: null
  });

  const startTimeRef = useRef(Date.now());
  const animationRef = useRef();

  useEffect(() => {
    startLevel();
  }, [levelIndex]);

  function startLevel() {
    const range = getSpawnRange(levelIndex);
    const spawnCount =
      Math.floor(Math.random() * (range.max - range.min + 1)) +
      range.min;

    const newItems = [];
    for (let i = 0; i < spawnCount; i++) {
      newItems.push({
        id: i,
        type: LEVELS[levelIndex].emoji,
        x: Math.random() * (window.innerWidth - 200) + 150,
        y: Math.random() * (window.innerHeight - 100) + 50
      });
    }

    setItems(newItems);
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

      if (prev.carrying) {
        target = { x: FARM_X + 60, y: FARM_Y + 60 };
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
          // deposit
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
      const moveX = (dx / len) * (SPEED / 60);
      const moveY = (dy / len) * (SPEED / 60);

      return { ...prev, x: prev.x + moveX, y: prev.y + moveY };
    });

    animationRef.current = requestAnimationFrame(update);
  }

  useEffect(() => {
    animationRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationRef.current);
  });

  useEffect(() => {
    if (items.length === 0) {
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
  }, [items]);

  function handleItemClick(id) {
    if (!farmer.targetId && !farmer.carrying) {
      setFarmer((f) => ({ ...f, targetId: id }));
    }
  }

  return React.createElement(
    "div",
    { className: "game-container" },

    React.createElement("div", { className: "field" }),

    React.createElement(FarmZone, { x: FARM_X, y: FARM_Y }),

    items.map((item) =>
      React.createElement(Item, {
        key: item.id,
        item,
        onClick: handleItemClick
      })
    ),

    React.createElement(Farmer, {
      x: farmer.x,
      y: farmer.y
    }),

    React.createElement(ScoreBoard, {
      level: levelIndex + 1,
      score,
      bonus
    })
  );
}