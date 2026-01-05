import { inventory } from "../inventory.js";
import { getLevelTheme } from "../utils/levelThemes.js";
import { loadLevelTilemap } from "../utils/tilemapLoader.js";
import {
  getRandomPosition as utilGetRandomPosition,
  getOppositeDirection as utilGetOppositeDirection,
} from "../utils/roomHelpers.js";
import { GameEffects } from "../utils/GameEffects.js";

/**
 * RoomBuilder - Handles room creation, layout, and door management
 */
export class RoomBuilder {
  constructor(scene) {
    this.scene = scene;
    this.roomWidth = 1280;
    this.roomHeight = 720;
  }

  /**
   * Create a new room
   */
  createRoom(roomX, currentLevel, enemyManager) {
    this.cleanupRoom();
    this.initializeGroups();

    const theme = getLevelTheme(currentLevel);

    // Load tilemap and background
    this.setupBackground(currentLevel, theme);

    // Track occupied positions
    const avoidAreas = [];

    // Build walls
    this.buildWalls(roomX);

    // Add obstacles
    this.addObstacles(roomX, currentLevel, theme, avoidAreas);

    // Add hazards
    this.addHazards(roomX, theme, avoidAreas);

    // Add money items
    this.addMoney(roomX, avoidAreas);

    // Add enemies
    this.addEnemies(roomX, theme, enemyManager, avoidAreas);

    // Add NPCs
    this.addNPCs(roomX, currentLevel, avoidAreas);

    // Create doors
    this.createDoors(roomX, currentLevel);

    return avoidAreas;
  }

  /**
   * Cleanup existing room objects
   */
  cleanupRoom() {
    const { scene } = this;

    // Kill tweens
    if (scene.items) scene.tweens.killTweensOf(scene.items.getChildren());
    if (scene.doorVisuals)
      scene.tweens.killTweensOf(scene.doorVisuals.getChildren());
    if (scene.decorations)
      scene.tweens.killTweensOf(scene.decorations.getChildren());
    if (scene.hazards) scene.tweens.killTweensOf(scene.hazards.getChildren());
    if (scene.npcs) scene.tweens.killTweensOf(scene.npcs.getChildren());

    // Clear groups
    if (scene.walls) scene.walls.clear(true, true);
    if (scene.obstacles) scene.obstacles.clear(true, true);
    if (scene.enemies) scene.enemies.clear(true, true);
    if (scene.items) scene.items.clear(true, true);
    if (scene.projectiles) scene.projectiles.clear(true, true);
    if (scene.decorations) scene.decorations.clear(true, true);
    if (scene.hazards) scene.hazards.clear(true, true);
    if (scene.npcs) scene.npcs.clear(true, true);
    if (scene.doorTriggers) scene.doorTriggers.clear(true, true);
    if (scene.doorVisuals) scene.doorVisuals.clear(true, true);
  }

  /**
   * Initialize room groups
   */
  initializeGroups() {
    const { scene } = this;

    if (!scene.doorTriggers)
      scene.doorTriggers = scene.physics.add.staticGroup();
    if (!scene.doorVisuals) scene.doorVisuals = scene.add.group();

    scene.walls = scene.physics.add.staticGroup();
    scene.obstacles = scene.physics.add.staticGroup();
    scene.hazards = scene.physics.add.group();
    scene.decorations = scene.add.group();
    scene.items = scene.physics.add.group();
    scene.enemies = scene.physics.add.group();
    scene.projectiles = scene.physics.add.group();
    scene.npcs = scene.physics.add.group();
  }

  /**
   * Setup background and tilemap
   */
  setupBackground(currentLevel, theme) {
    const { scene } = this;

    loadLevelTilemap(scene, currentLevel);

    // Themed background
    if (currentLevel === 3) {
      scene.add.image(640, 360, "alley").setDepth(-20);
    } else if (currentLevel !== 1) {
      scene.add
        .rectangle(
          this.roomWidth / 2,
          this.roomHeight / 2,
          this.roomWidth,
          this.roomHeight,
          theme.bgColor
        )
        .setDepth(-20);
    }

    // Fallback decorations for level 1 without tilemap
    if (currentLevel === 1 && !scene.tilemapLayer) {
      scene.add.rectangle(640, 400, 300, 200, 0x8b0000, 0.4).setDepth(0);
    }
  }

  /**
   * Build room walls
   */
  buildWalls(roomX) {
    const { scene, roomWidth, roomHeight } = this;

    // Determine door positions
    const leftDoorY = roomX === 1 || roomX === 2 ? 380 : null;
    const rightDoorY =
      roomX === 0 || roomX === 1 || (roomX === 2 && scene.currentLevel < 3)
        ? 380
        : null;

    // Top wall
    for (let x = 0; x < roomWidth; x += 32) {
      scene.walls
        .create(x + 16, 96, "wall_wood")
        .setImmovable(true)
        .setDepth(1);
    }

    // Bottom wall
    for (let x = 0; x < roomWidth; x += 32) {
      scene.walls
        .create(x + 16, roomHeight - 16, "wall_wood")
        .setImmovable(true)
        .setDepth(1);
    }

    // Bottom barrier (invisible)
    const bottomBarrier = scene.add.rectangle(
      roomWidth / 2,
      roomHeight - 8,
      roomWidth,
      16,
      0x000000,
      0
    );
    scene.physics.add.existing(bottomBarrier, true);
    scene.walls.add(bottomBarrier);

    // Left wall (with door gap)
    for (let y = 80; y < roomHeight; y += 32) {
      const tileCenterY = y + 16;
      const skipForDoor = leftDoorY && Math.abs(tileCenterY - leftDoorY) <= 24;
      if (!skipForDoor) {
        scene.walls
          .create(16, tileCenterY, "wall_wood")
          .setImmovable(true)
          .setDepth(1);
      }
    }

    // Right wall (with door gap)
    for (let y = 80; y < roomHeight; y += 32) {
      const tileCenterY = y + 16;
      const skipForDoor =
        rightDoorY && Math.abs(tileCenterY - rightDoorY) <= 24;
      if (!skipForDoor) {
        scene.walls
          .create(roomWidth - 16, tileCenterY, "wall_wood")
          .setImmovable(true)
          .setDepth(1);
      }
    }
  }

  /**
   * Add obstacles to room
   */
  addObstacles(roomX, currentLevel, theme, avoidAreas) {
    const { scene } = this;
    const baseObstacles = 3 + roomX;
    const numObstacles = Phaser.Math.Between(baseObstacles, baseObstacles + 2);

    // Store shelves for level 2
    if (currentLevel === 2 && roomX > 0) {
      const shelfRows = 2;
      for (let row = 0; row < shelfRows; row++) {
        const xPos = 150 + row * 200;
        for (let y = 160; y < 400; y += 60) {
          const pos = { x: xPos, y };
          avoidAreas.push({ x: pos.x, y: pos.y, radius: 45 });
          const shelf = scene.obstacles.create(pos.x, pos.y, "wall_shelf");
          shelf.setImmovable(true).setDepth(5).setScale(1.2, 0.8);
        }
      }
    }

    // Random obstacles
    for (let i = 0; i < numObstacles; i++) {
      const pos = this.getRandomPosition(avoidAreas, 80);
      avoidAreas.push({ x: pos.x, y: pos.y, radius: 50 });

      const obstacle = scene.obstacles.create(pos.x, pos.y, theme.obstacleType);
      obstacle.setImmovable(true).setDepth(5);

      const scale = Phaser.Math.FloatBetween(
        0.9 + roomX * 0.15,
        1.3 + roomX * 0.15
      );
      obstacle.setScale(scale);

      // Hide lighter in first obstacle of level 1
      if (currentLevel === 1 && !inventory.hasLighter && i === 0) {
        const lighter = scene.items.create(pos.x, pos.y - 20, "lighter");
        lighter.itemType = "lighter";
        lighter.setDepth(6).setScale(0.9);
        GameEffects.createPulse(scene, lighter, 1.15, 800);
      }
    }
  }

  /**
   * Add hazards to room
   */
  addHazards(roomX, theme, avoidAreas) {
    const { scene } = this;
    const baseHazards = 2 + roomX;
    const numHazards = Phaser.Math.Between(baseHazards, baseHazards + 2);

    for (let i = 0; i < numHazards; i++) {
      const pos = this.getRandomPosition(avoidAreas, 70);
      avoidAreas.push({ x: pos.x, y: pos.y, radius: 40 });

      const hazardTypes = theme.hazards;
      const hazardType =
        hazardTypes[Math.floor(Math.random() * hazardTypes.length)];

      let hazard;
      // Moving hazards
      if (hazardType === "rat" || hazardType === "crab") {
        hazard = scene.physics.add.sprite(pos.x, pos.y, hazardType);
        hazard.setBounce(1, 1);
        const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
        const speed = hazardType === "rat" ? 40 : 25;
        hazard.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
        hazard.body.setImmovable(false);
        if (hazardType === "crab") hazard.play("crab_attack", true);
        scene.hazards.add(hazard);
      } else if (hazardType === "spill") {
        hazard = scene.physics.add.sprite(pos.x, pos.y, hazardType);
        hazard.setImmovable(true);
        hazard.setScale(0.12);
        hazard.setSize(20, 20);
        scene.hazards.add(hazard);
      } else {
        hazard = scene.hazards.create(pos.x, pos.y, hazardType);
      }

      hazard.setDepth(1);
    }
  }

  /**
   * Add money items to room
   */
  addMoney(roomX, avoidAreas) {
    const { scene } = this;
    const numMoney = Phaser.Math.Between(2, 3 + roomX);

    for (let i = 0; i < numMoney; i++) {
      const pos = this.getRandomPosition(avoidAreas, 70);
      avoidAreas.push({ x: pos.x, y: pos.y, radius: 30 });

      const money = scene.items.create(pos.x, pos.y, "money");
      money.itemType = "money";
      money.value = Phaser.Math.Between(1, 5);
      money.setDepth(5);

      // Animations
      GameEffects.createSpin(scene, money);
      GameEffects.createBob(scene, money);
    }
  }

  /**
   * Add enemies to room
   */
  addEnemies(roomX, theme, enemyManager, avoidAreas) {
    const { scene } = this;
    const roamerCount = theme.enemyCount[roomX];
    const shooterCount = theme.shooterCount[roomX];

    // Create roamers
    for (let i = 0; i < roamerCount; i++) {
      const pos = this.getRandomPosition(avoidAreas, 80);
      avoidAreas.push({ x: pos.x, y: pos.y, radius: 40 });
      enemyManager.createRoamer(
        pos.x,
        pos.y,
        theme.enemySprite,
        theme.enemyHealth
      );
    }

    // Create shooters
    for (let i = 0; i < shooterCount; i++) {
      const pos = this.getRandomPosition(avoidAreas, 80);
      avoidAreas.push({ x: pos.x, y: pos.y, radius: 40 });
      enemyManager.createShooter(pos.x, pos.y, theme.enemyHealth);
    }
  }

  /**
   * Add NPCs to room
   */
  addNPCs(roomX, currentLevel, avoidAreas) {
    const { scene } = this;

    // Clerk in level 2
    if (currentLevel === 2 && !inventory.hasPapers) {
      const clerkPos = this.getRandomPosition(avoidAreas, 80);
      avoidAreas.push({ x: clerkPos.x, y: clerkPos.y, radius: 60 });

      const clerk = scene.npcs.create(clerkPos.x, clerkPos.y, "roamer");
      clerk.setImmovable(true);
      clerk.setTint(0x4488ff);
      clerk.npcType = "clerk";

      const clerkLabel = scene.add
        .text(clerkPos.x, clerkPos.y - 40, "CLERK", {
          fontSize: "14px",
          fill: "#ffffff",
          fontFamily: "Courier New",
          fontStyle: "bold",
          backgroundColor: "#000000",
          padding: { x: 6, y: 3 },
        })
        .setOrigin(0.5)
        .setDepth(50);
      scene.doorVisuals.add(clerkLabel);
    }
    // Dealer in level 3 room 3
    else if (currentLevel === 3 && roomX === 2 && !inventory.hasDoobie) {
      const dealerPos = this.getRandomPosition(avoidAreas, 80);
      avoidAreas.push({ x: dealerPos.x, y: dealerPos.y, radius: 60 });

      const dealer = scene.npcs.create(dealerPos.x, dealerPos.y, "dealer");
      dealer.setImmovable(true);
      dealer.setSize(12, 12);
      dealer.setScale(0.1);
      dealer.npcType = "dealer";
    }
  }

  /**
   * Create doors for room navigation
   */
  createDoors(roomX, currentLevel) {
    const { scene, roomWidth } = this;

    if (roomX === 0) {
      // Only forward door
      this.createDoor(roomWidth - 24, 380, "right", 1, false);
    } else if (roomX === 1) {
      // Back and forward doors
      this.createDoor(24, 380, "left", 0, false);
      this.createDoor(roomWidth - 24, 380, "right", 2, false);
    } else if (roomX === 2) {
      // Back door
      this.createDoor(24, 380, "left", 1, false);
      // Exit to next level if not at max
      if (currentLevel < 3) {
        this.createDoor(roomWidth - 24, 380, "right", 0, true);
      }
    }
  }

  /**
   * Create a single door
   */
  createDoor(x, y, direction, toRoomX, levelTransition) {
    const { scene, roomWidth } = this;
    const doorColor = levelTransition ? 0xffd700 : 0x654321;
    const glowColor = levelTransition ? 0xffaa00 : 0x8b6914;

    // Door frame at wall edge
    const edgeX =
      direction === "left" ? 16 : direction === "right" ? roomWidth - 16 : x;
    const edgeY = y;

    const frame = scene.add
      .rectangle(edgeX, edgeY, 32, 64, 0x4b3621)
      .setDepth(2);
    frame.setStrokeStyle(3, 0x2d1b0e);
    scene.doorVisuals.add(frame);

    // Door glow
    const innerGlow = scene.add
      .rectangle(edgeX, edgeY, 24, 56, glowColor, 0.7)
      .setDepth(2);
    scene.doorVisuals.add(innerGlow);

    // Trigger area
    const doorBg = scene.add.rectangle(x, y, 48, 64, doorColor, 0).setDepth(1);
    scene.doorVisuals.add(doorBg);

    // Arrow
    const arrowText = levelTransition ? "⬆" : "→";
    const arrow = scene.add
      .text(x, y, arrowText, {
        fontSize: "32px",
        fill: levelTransition ? "#ffff00" : "#ffffff",
        fontFamily: "Arial",
        stroke: "#000000",
        strokeThickness: 2,
      })
      .setOrigin(0.5)
      .setDepth(2);
    scene.doorVisuals.add(arrow);

    // Pulse animation
    GameEffects.createPulse(scene, arrow, 1.2, 800);

    // Add physics
    scene.physics.add.existing(doorBg, true);
    scene.doorTriggers.add(doorBg);
    scene.physics.add.overlap(scene.player, doorBg, () => {
      const now = scene.time.now;
      const timeSinceLastDoor = now - (scene.lastDoorTime || 0);

      if (!scene.transitioning && timeSinceLastDoor > 2000) {
        scene.transitioning = true;
        scene.lastDoorTime = now;
        scene.changeRoom(toRoomX, direction, levelTransition, x, y);
      }
    });

    // Exit label
    if (levelTransition) {
      const exitLabel = scene.add
        .text(x, y - 40, "EXIT", {
          fontSize: "16px",
          fill: "#ffff00",
          fontFamily: "Courier New",
          fontStyle: "bold",
          stroke: "#000000",
          strokeThickness: 3,
        })
        .setOrigin(0.5)
        .setDepth(2);
      scene.doorVisuals.add(exitLabel);
    }
  }

  /**
   * Get random position avoiding obstacles
   */
  getRandomPosition(avoidAreas = [], minDistanceFromWalls = 80) {
    const { roomWidth, roomHeight } = this;
    const maxAttempts = 100;

    for (let i = 0; i < maxAttempts; i++) {
      const x = Phaser.Math.Between(
        minDistanceFromWalls,
        roomWidth - minDistanceFromWalls
      );
      const y = Phaser.Math.Between(
        150 + minDistanceFromWalls,
        roomHeight - minDistanceFromWalls - 50
      );

      let safe = true;
      for (const area of avoidAreas) {
        const dist = Phaser.Math.Distance.Between(x, y, area.x, area.y);
        const minDist = (area.radius || 50) + 20;
        if (dist < minDist) {
          safe = false;
          break;
        }
      }

      if (safe) return { x, y };
    }

    return { x: 640, y: 400 };
  }
}
