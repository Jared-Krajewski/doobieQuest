/**
 * Helper functions for room and door management
 */

export function getRandomDoorPosition(wall, roomWidth, roomHeight) {
  const margin = 200;
  switch (wall) {
    case "left":
      return { x: 0, y: Phaser.Math.Between(margin, roomHeight - margin) };
    case "right":
      return {
        x: roomWidth,
        y: Phaser.Math.Between(margin, roomHeight - margin),
      };
    case "top":
      return { x: Phaser.Math.Between(margin, roomWidth - margin), y: 0 };
    case "bottom":
      return {
        x: Phaser.Math.Between(margin, roomWidth - margin),
        y: roomHeight,
      };
    default:
      return { x: roomWidth / 2, y: roomHeight / 2 };
  }
}

export function getDoorDirection(wall) {
  return wall;
}

export function getOppositeDirection(dir) {
  const opposites = {
    left: "right",
    right: "left",
    top: "bottom",
    bottom: "top",
  };
  return opposites[dir] || "right";
}

export function getRandomPosition(
  roomWidth,
  roomHeight,
  avoidAreas = [],
  minDistanceFromWalls = 80
) {
  let pos;
  let attempts = 0;
  const maxAttempts = 50;

  do {
    pos = {
      x: Phaser.Math.Between(
        minDistanceFromWalls,
        roomWidth - minDistanceFromWalls
      ),
      y: Phaser.Math.Between(
        minDistanceFromWalls,
        roomHeight - minDistanceFromWalls
      ),
    };
    attempts++;
    // Check distance from all avoid areas
    const tooClose = avoidAreas.some((area) => {
      const dx = pos.x - area.x;
      const dy = pos.y - area.y;
      return Math.sqrt(dx * dx + dy * dy) < 100;
    });
    if (!tooClose) break;
  } while (attempts < maxAttempts);

  return pos;
}
