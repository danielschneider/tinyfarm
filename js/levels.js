const LEVELS = [
  { name: "Sheep Roundup", emoji: "🐑", targetTime: 30 },
  { name: "Corn Harvest", emoji: "🌽", targetTime: 40 },
  { name: "Pig Push", emoji: "🐖", targetTime: 50 },
  { name: "Egg Collect", emoji: "🥚", targetTime: 60 }
];

function getSpawnRange(levelIndex) {
  const level = levelIndex + 1;
  return {
    min: 3 + (level - 1) * 2,
    max: 7 + (level - 1) * 4
  };
}