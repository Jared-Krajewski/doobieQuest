/**
 * Level theme configurations
 * Contains visual, gameplay, and enemy data for each level
 */

export const LEVEL_THEMES = {
  1: {
    name: "THE CRIB",
    color: 0x4a3020,
    bgColor: 0x6b5444, // Brown wood floor
    obstacleType: "box",
    hazards: ["crab", "spill"], // Themed hazards
    enemyType: "roamer",
    enemySprite: "dog",
    enemyHealth: 2,
    enemyCount: [1, 2, 3], // Room 0, 1, 2
    shooterCount: [0, 0, 0],
  },
  2: {
    name: "CONVENIENCE STORE",
    color: 0x3a4a5a,
    bgColor: 0xd0d0d0, // Light gray tiles
    obstacleType: "box",
    hazards: ["spill"], // Wet floor (use only new spill sprite)
    enemyType: "police",
    enemySprite: "police",
    enemyHealth: 2,
    enemyCount: [1, 2, 3],
    shooterCount: [1, 2, 2],
  },
  3: {
    name: "BACK ALLEY",
    color: 0x2a2a2a,
    bgColor: 0x3a3a3a, // Dark concrete
    obstacleType: "box",
    hazards: ["rat", "spill"], // Alley hazards (use new spill sprite)
    enemyType: "dealer",
    enemySprite: "dog",
    enemyHealth: 2,
    enemyCount: [2, 3, 4],
    shooterCount: [1, 2, 3],
  },
};

export function getLevelTheme(level) {
  return LEVEL_THEMES[level] || LEVEL_THEMES[1];
}

export function getLevelMissionText(theme) {
  const missions = {
    "THE CRIB": "Get out of the crib and get to the store!",
    "CONVENIENCE STORE": "Make it through the store to the alley!",
    "BACK ALLEY": "Find the dealer in the alley!",
  };
  return missions[theme.name] || "Survive and progress!";
}
