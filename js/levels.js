const LEVELS = [
  { name: "Sheep Roundup", emoji: "🐑", targetTime: 30, wanderSpeed: 0.3 },
  { name: "Corn Harvest", emoji: "🌽", targetTime: 40, wanderSpeed: 0 }, // Crops don't wander
  { name: "Pig Push", emoji: "🐖", targetTime: 50, wanderSpeed: 0.5 },
  { name: "Egg Collect", emoji: "🥚", targetTime: 60, wanderSpeed: 0 }, // Eggs don't wander
  { name: "Chicken Chase", emoji: "🐓", targetTime: 65, wanderSpeed: 0.6 },
  { name: "Carrot Patch", emoji: "🥕", targetTime: 55, wanderSpeed: 0 }, // Carrots don't wander
  { name: "Cow Herd", emoji: "🐄", targetTime: 70, wanderSpeed: 0.2 },
  { name: "Tomato Pick", emoji: "🍅", targetTime: 60, wanderSpeed: 0 }, // Tomatoes don't wander
  { name: "Bunny Hop", emoji: "🐇", targetTime: 55, wanderSpeed: 0.7 },
  { name: "Wheat Field", emoji: "🌾", targetTime: 65, wanderSpeed: 0 }, // Wheat doesn't wander
  { name: "Goat Gather", emoji: "🐐", targetTime: 70, wanderSpeed: 0.4 },
  { name: "Potato Dig", emoji: "🥔", targetTime: 60, wanderSpeed: 0 } // Potatoes don't wander
];

function getSpawnRange(levelIndex) {
  const level = levelIndex + 1;
  return {
    min: 3 + (level - 1) * 2,
    max: 7 + (level - 1) * 4
  };
}