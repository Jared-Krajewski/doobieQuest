import Phaser from "phaser";
import { inventory } from "../inventory.js";
import { getLevelTheme, getLevelMissionText } from "../utils/levelThemes.js";
import { loadLevelTilemap } from "../utils/tilemapLoader.js";
import {
  getRandomPosition as utilGetRandomPosition,
  getOppositeDirection as utilGetOppositeDirection,
} from "../utils/roomHelpers.js";

export class Level1Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level1Scene" });
  }

  create() {
    // Current room and level tracking
    this.currentLevel = 1; // Level 1, 2, or 3
    this.currentRoom = { x: 0 }; // Room 0, 1, or 2 within level (changed to x only)
    this.entryDoor = { x: 640, y: 500 }; // Track where player entered room from
    this.roomWidth = 1280;
    this.roomHeight = 720;

    // Set world bounds
    this.physics.world.setBounds(0, 0, this.roomWidth, this.roomHeight);
    this.cameras.main.setBounds(0, 0, this.roomWidth, this.roomHeight);
    this.cameras.main.setBackgroundColor("#2d1b0e");

    // Tilemap layers will be created in createRoom()
    this.tilemapLayer = null;
    this.tilemapLayer2 = null;

    // Player state
    this.lastDirection = "down";
    this.canAttack = true;
    this.canThrow = true;
    this.invincible = false;
    this.bongThrown = null;
    this.transitioning = false;
    this.falling = false;
    this.lastDoorTime = 0; // Track door usage cooldown
    this.gameOverTriggered = false; // Prevent multiple game over calls

    // Create HUD (fixed to camera)
    this.createHUD();

    // Player - create FIRST so createRoom can set up collisions
    this.player = this.physics.add.sprite(640, 500, "player");
    this.player.setCollideWorldBounds(true);
    this.player.setSize(34, 64); // Match new visual size
    this.player.setOffset(48, 64); // Center hitbox in 128x128 frame
    this.player.setDepth(10);
    this.player.setScale(1); // Double size: 128x128 -> 64x64 on screen
    this.player.play("player_idle");

    // Camera follows player
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    // Create room
    this.createRoom(0);

    // Controls - Keyboard (WASD primary, arrows secondary)
    this.wasd = {
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
    this.cursors = this.input.keyboard.createCursorKeys();
    this.attackKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );
    this.throwKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SHIFT
    );
    this.interactKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.E
    );
    this.smokeKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.Q
    );

    // Gamepad support
    this.input.gamepad.once("connected", (pad) => {
      this.gamepad = pad;
    });

    this.updateHUD();
    // Initial progress HUD
    this.updateProgressHUD();
  }

  createHUD() {
    // HUD Background
    this.add
      .rectangle(640, 30, 1260, 50, 0x000000, 0.8)
      .setScrollFactor(0)
      .setDepth(100);

    // Hearts (left side)
    this.heartContainers = [];
    for (let i = 0; i < inventory.maxHealth; i++) {
      const heart = this.add
        .image(30 + i * 40, 30, "heart")
        .setScrollFactor(0)
        .setDepth(101);
      heart.setScale(0.8);
      this.heartContainers.push(heart);
    }

    // Lives display
    this.livesText = this.add
      .text(280, 30, `LIVES: ${inventory.lives}`, {
        fontSize: "24px",
        fill: "#ffffff",
        fontFamily: "Courier New",
        fontStyle: "bold",
      })
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(101);

    // Money display
    this.moneyText = this.add
      .text(480, 30, `💰 $${inventory.money}`, {
        fontSize: "24px",
        fill: "#ffd700",
        fontFamily: "Courier New",
        fontStyle: "bold",
      })
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(101);

    // Items display
    this.itemsText = this.add
      .text(630, 30, "", {
        fontSize: "20px",
        fill: "#ffffff",
        fontFamily: "Courier New",
      })
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(101);

    // Mission objectives
    this.missionText = this.add
      .text(640, 695, "MISSION: Find the treasure and defeat all enemies!", {
        fontSize: "16px",
        fill: "#ffff00",
        fontFamily: "Courier New",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(101);

    // Progress display (Level / Room)
    this.progressText = this.add
      .text(
        20,
        60,
        `Level ${this.currentLevel}/3 — Room ${this.currentRoom.x + 1}/3`,
        {
          fontSize: "16px",
          fill: "#ffffff",
          fontFamily: "Courier New",
          fontStyle: "bold",
          stroke: "#000000",
          strokeThickness: 2,
        }
      )
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(101);

    // Controls display (on-screen)
    this.add
      .text(
        640,
        60,
        "WASD/Arrows: Move  |  SPACE: Attack  |  SHIFT: Throw Bongerang  |  E: Interact  |  Q: Smoke",
        {
          fontSize: "14px",
          fill: "#ffffff",
          fontFamily: "Courier New",
          backgroundColor: "#000000",
          padding: { x: 10, y: 4 },
          alpha: 0.8,
        }
      )
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(101);

    // Interaction prompt (hidden by default)
    this.interactionPrompt = this.add
      .text(640, 360, "", {
        fontSize: "18px",
        fill: "#ffff00",
        fontFamily: "Courier New",
        fontStyle: "bold",
        backgroundColor: "#000000",
        padding: { x: 15, y: 8 },
        stroke: "#ffffff",
        strokeThickness: 2,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(102)
      .setVisible(false);
  }

  // Helper: Get random safe position avoiding walls and other objects
  getRandomPosition(avoidAreas = [], minDistanceFromWalls = 80) {
    const maxAttempts = 100; // More attempts to find good positions
    for (let i = 0; i < maxAttempts; i++) {
      const x = Phaser.Math.Between(
        minDistanceFromWalls,
        this.roomWidth - minDistanceFromWalls
      );
      const y = Phaser.Math.Between(
        150 + minDistanceFromWalls,
        this.roomHeight - minDistanceFromWalls - 50
      );

      // Check if position conflicts with existing areas
      let safe = true;
      for (const area of avoidAreas) {
        const dist = Phaser.Math.Distance.Between(x, y, area.x, area.y);
        const minDist = (area.radius || 50) + 20; // Add extra buffer
        if (dist < minDist) {
          safe = false;
          break;
        }
      }

      if (safe) return { x, y };
    }
    // Fallback to center-ish if no safe spot found
    return { x: 640, y: 400 };
  }

  // Helper: Get level theme data
  getLevelTheme(level) {
    return getLevelTheme(level);
  }

  getLevelMissionText(theme) {
    if (this.currentLevel === 1) {
      return !inventory.hasLighter
        ? `${theme.name}: Find the lighter!`
        : `${theme.name}: Objective complete! Find the exit!`;
    }

    if (this.currentLevel === 2) {
      return !inventory.hasPapers
        ? `${theme.name}: Buy papers from the clerk (E)!`
        : `${theme.name}: Objective complete! Find the exit!`;
    }

    // Level 3
    return !inventory.hasDoobie
      ? `${theme.name}: Buy weed from dealer (E)!`
      : `${theme.name}: Objective complete! Press Q to roll a doobie, smoke and WIN!`;
  }

  createRoom(roomX) {
    // Clear existing room objects
    // Kill tweens tied to room objects before destroying them (prevents stale tween crashes)
    if (this.items) this.tweens.killTweensOf(this.items.getChildren());
    if (this.doorVisuals)
      this.tweens.killTweensOf(this.doorVisuals.getChildren());
    if (this.decorations)
      this.tweens.killTweensOf(this.decorations.getChildren());
    if (this.hazards) this.tweens.killTweensOf(this.hazards.getChildren());
    if (this.npcs) this.tweens.killTweensOf(this.npcs.getChildren());

    if (this.walls) this.walls.clear(true, true);
    if (this.obstacles) this.obstacles.clear(true, true);
    if (this.enemies) this.enemies.clear(true, true);
    if (this.items) this.items.clear(true, true);
    if (this.projectiles) this.projectiles.clear(true, true);
    if (this.decorations) this.decorations.clear(true, true);
    if (this.hazards) this.hazards.clear(true, true);
    if (this.npcs) this.npcs.clear(true, true);
    // Clear any existing door triggers/visuals to avoid stale overlaps
    if (this.doorTriggers) this.doorTriggers.clear(true, true);
    if (this.doorVisuals) this.doorVisuals.clear(true, true);

    // Initialize groups if not yet created
    if (!this.doorTriggers) this.doorTriggers = this.physics.add.staticGroup();
    if (!this.doorVisuals) this.doorVisuals = this.add.group();

    // Get level theme
    const theme = this.getLevelTheme(this.currentLevel);

    // Load tilemap backgrounds
    loadLevelTilemap(this, this.currentLevel);

    // Themed background based on level (only for non-crib levels)
    // Keep this BEHIND any tilemap layers so it doesn't cover them.
    if (this.currentLevel === 3) {
      this.add.image(640, 360, "alley").setDepth(-20);
    } else if (this.currentLevel !== 1) {
      this.add
        .rectangle(
          this.roomWidth / 2,
          this.roomHeight / 2,
          this.roomWidth,
          this.roomHeight,
          theme.bgColor
        )
        .setDepth(-20);
    }

    // Add texture details based on level (minimal decorations)
    // If the crib tilemap is active, do not draw extra background overlays.
    if (this.currentLevel === 1 && !this.tilemapLayer) {
      // Fallback-only: simple rug in center
      this.add.rectangle(640, 400, 300, 200, 0x8b0000, 0.4).setDepth(0);
    }
    // Store and alley have clean backgrounds with no decorations

    // Walls
    this.walls = this.physics.add.staticGroup();

    // Determine door positions to carve gaps in walls for flush look
    const leftDoorY = roomX === 1 || roomX === 2 ? 380 : null;
    const rightDoorY =
      roomX === 0 || roomX === 1 || (roomX === 2 && this.currentLevel < 3)
        ? 380
        : null;

    // Top wall
    for (let x = 0; x < this.roomWidth; x += 32) {
      this.walls
        .create(x + 16, 96, "wall_wood")
        .setImmovable(true)
        .setDepth(1);
    }

    // Bottom wall
    for (let x = 0; x < this.roomWidth; x += 32) {
      this.walls
        .create(x + 16, this.roomHeight - 16, "wall_wood")
        .setImmovable(true)
        .setDepth(1);
    }

    // Invisible barrier at bottom to keep enemies in bounds
    const bottomBarrier = this.add.rectangle(
      this.roomWidth / 2,
      this.roomHeight - 8,
      this.roomWidth,
      16,
      0x000000,
      0
    );
    this.physics.add.existing(bottomBarrier, true);
    this.walls.add(bottomBarrier);

    // Left wall (skip tiles at door opening)
    for (let y = 80; y < this.roomHeight; y += 32) {
      const tileCenterY = y + 16;
      const skipForDoor = leftDoorY && Math.abs(tileCenterY - leftDoorY) <= 24;
      if (skipForDoor) continue;
      this.walls
        .create(16, tileCenterY, "wall_wood")
        .setImmovable(true)
        .setDepth(1);
    }

    // Right wall (skip tiles at door opening)
    for (let y = 80; y < this.roomHeight; y += 32) {
      const tileCenterY = y + 16;
      const skipForDoor =
        rightDoorY && Math.abs(tileCenterY - rightDoorY) <= 24;
      if (skipForDoor) continue;
      this.walls
        .create(this.roomWidth - 16, tileCenterY, "wall_wood")
        .setImmovable(true)
        .setDepth(1);
    }

    // Initialize groups
    this.obstacles = this.physics.add.staticGroup();
    this.hazards = this.physics.add.group();
    this.decorations = this.add.group();
    this.items = this.physics.add.group();
    this.enemies = this.physics.add.group();
    this.projectiles = this.physics.add.group();
    this.npcs = this.physics.add.group();

    // Track occupied positions to avoid overlaps
    const avoidAreas = [];

    // RANDOMIZED OBSTACLES - varies by room number and level theme
    const baseObstacles = 3 + roomX; // Room 0: 3-5, Room 1: 4-6, Room 2: 5-7
    const numObstacles = Phaser.Math.Between(baseObstacles, baseObstacles + 2);

    // Store shelves in convenience store create maze-like layout
    if (this.currentLevel === 2 && roomX > 0) {
      // Create vertical shelving rows
      const shelfRows = 2;
      for (let row = 0; row < shelfRows; row++) {
        const xPos = 150 + row * 200;
        for (let y = 160; y < 400; y += 60) {
          const pos = { x: xPos, y };
          avoidAreas.push({ x: pos.x, y: pos.y, radius: 45 });
          const shelf = this.obstacles.create(pos.x, pos.y, "wall_shelf");
          shelf.setImmovable(true).setDepth(5);
          shelf.setScale(1.2, 0.8);
        }
      }
    }

    for (let i = 0; i < numObstacles; i++) {
      const pos = this.getRandomPosition(avoidAreas, 80);
      avoidAreas.push({ x: pos.x, y: pos.y, radius: 50 });

      const obstacleSprite = theme.obstacleType;
      const obstacle = this.obstacles.create(pos.x, pos.y, obstacleSprite);
      obstacle.setImmovable(true).setDepth(5);

      // Scale varies by level and room
      const scale = Phaser.Math.FloatBetween(
        0.9 + roomX * 0.15,
        1.3 + roomX * 0.15
      );
      obstacle.setScale(scale);

      // LIGHTER hidden in couch in any room of Level 1
      if (this.currentLevel === 1 && !inventory.hasLighter && i === 0) {
        const lighter = this.items.create(pos.x, pos.y - 20, "lighter");
        lighter.itemType = "lighter";
        lighter.setDepth(6);
        lighter.setScale(0.9);

        // Glowing effect
        this.tweens.add({
          targets: lighter,
          alpha: 0.6,
          duration: 800,
          yoyo: true,
          repeat: -1,
        });
      }
    }

    // RANDOMIZED HAZARDS - themed by level
    const baseHazards = 2 + roomX; // Room 0: 2-4, Room 1: 3-5, Room 2: 4-6
    const numHazards = Phaser.Math.Between(baseHazards, baseHazards + 2);
    for (let i = 0; i < numHazards; i++) {
      const pos = this.getRandomPosition(avoidAreas, 70);
      avoidAreas.push({ x: pos.x, y: pos.y, radius: 40 });

      // Themed hazard based on level
      const hazardTypes = theme.hazards;
      const hazardType =
        hazardTypes[Math.floor(Math.random() * hazardTypes.length)];

      let hazard;
      // Moving hazards need physics from creation
      if (hazardType === "rat" || hazardType === "crab") {
        hazard = this.physics.add.sprite(pos.x, pos.y, hazardType);
        hazard.setBounce(1, 1);
        const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
        const speed = hazardType === "rat" ? 40 : 25;
        hazard.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
        hazard.body.setImmovable(false);
        if (hazardType === "crab") hazard.play("crab_attack", true);
        // Add to hazards group for cleanup
        this.hazards.add(hazard);
      } else if (hazardType === "spill") {
        // Spill needs proper collision as immovable dynamic body
        hazard = this.physics.add.sprite(pos.x, pos.y, hazardType);
        hazard.setImmovable(true);
        this.hazards.add(hazard);
      } else {
        // Static hazards
        hazard = this.hazards.create(pos.x, pos.y, hazardType);
      }

      hazard.setDepth(1);
      if (hazardType === "spill") {
        hazard.setScale(0.12); // Make spill hazards very small visually
        hazard.setSize(20, 20); // Larger physics body for damage detection
      }
    }

    // RANDOMIZED MONEY ITEMS - more valuable in later rooms
    const numMoney = Phaser.Math.Between(2, 3 + roomX); // More money in later rooms
    for (let i = 0; i < numMoney; i++) {
      const pos = this.getRandomPosition(avoidAreas, 70);
      avoidAreas.push({ x: pos.x, y: pos.y, radius: 30 });

      const money = this.items.create(pos.x, pos.y, "money");
      money.itemType = "money";
      money.value = Phaser.Math.Between(1, 5); // Simple 1-5 coin value
      money.setDepth(5);

      // Spinning animation
      this.tweens.add({
        targets: money,
        angle: 360,
        duration: 2000,
        repeat: -1,
      });

      // Bobbing animation
      this.tweens.add({
        targets: money,
        y: pos.y - 10,
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }

    // RANDOMIZED ENEMIES based on level and room
    const roamerCount = theme.enemyCount[roomX];
    const shooterCount = theme.shooterCount[roomX];

    // Create roaming enemies
    for (let i = 0; i < roamerCount; i++) {
      const pos = this.getRandomPosition(avoidAreas, 80);
      avoidAreas.push({ x: pos.x, y: pos.y, radius: 40 });

      const enemy = this.enemies.create(pos.x, pos.y, theme.enemySprite);
      // dog sprites are 32x40 frames; use a smaller body near the feet
      enemy.setScale(1.2);
      enemy.setSize(20, 14);
      enemy.setOffset(6, 26);
      if (enemy.anims) enemy.play("dog_walk", true);
      enemy.setBounce(1);
      enemy.health = theme.enemyHealth;
      enemy.enemyType = "roamer";

      // Random velocity
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const speed = Phaser.Math.Between(40, 70);
      enemy.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    }

    // Create shooter enemies
    for (let i = 0; i < shooterCount; i++) {
      const pos = this.getRandomPosition(avoidAreas, 80);
      avoidAreas.push({ x: pos.x, y: pos.y, radius: 40 });

      const enemy = this.enemies.create(pos.x, pos.y, "police");
      enemy.setScale(1.5); // Larger for visibility
      enemy.setSize(21, 26);
      enemy.setOffset(3, 3);
      enemy.health = theme.enemyHealth; // Same health as roamers - 2 hits
      enemy.enemyType = "shooter";
      enemy.lastShot = 0;
      // Not immovable - allow them to roam
      enemy.roamSpeed = Phaser.Math.Between(30, 50);
      enemy.roamAngle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      enemy.roamChangeTime = this.time.now + Phaser.Math.Between(1000, 2000);
      enemy.play("police_walk", true); // Always animate
    }

    // Decorations removed - they were causing visual clutter

    // NPC CREATION - Clerk in any room of Level 2, Dealer in Level 3 Room 3
    if (this.currentLevel === 2 && !inventory.hasPapers) {
      // Clerk in convenience store (any room of Level 2)
      const clerkPos = this.getRandomPosition(avoidAreas, 80);
      avoidAreas.push({ x: clerkPos.x, y: clerkPos.y, radius: 60 });

      const clerk = this.npcs.create(clerkPos.x, clerkPos.y, "roamer");
      clerk.setImmovable(true);
      clerk.setTint(0x4488ff); // Blue tint for clerk
      clerk.npcType = "clerk";

      // Label
      const clerkLabel = this.add
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
      this.doorVisuals.add(clerkLabel); // Track for cleanup
    } else if (this.currentLevel === 3 && roomX === 2 && !inventory.hasDoobie) {
      // Dealer in back alley (final room of Level 3)
      const dealerPos = this.getRandomPosition(avoidAreas, 80);
      avoidAreas.push({ x: dealerPos.x, y: dealerPos.y, radius: 60 });

      const dealer = this.npcs.create(dealerPos.x, dealerPos.y, "dealer");
      dealer.setImmovable(true);
      dealer.setSize(12, 12);
      dealer.setScale(0.1);
      dealer.npcType = "dealer";
    }

    // DOOR CREATION - Fixed positions to prevent spam (triggers inside, visuals at edge)
    // Room 0: Only forward door (right side) -> goes to Room 1
    if (roomX === 0) {
      // Forward door (right)
      this.createDoor(this.roomWidth - 24, 380, "right", 1, false);
      this.animateMissionText(this.getLevelMissionText(theme));
      if (this.progressText)
        this.progressText.setText(
          `Level ${this.currentLevel}/3 — Room ${roomX + 1}/3`
        );
    }
    // Room 1: Door back (left) -> Room 0 and forward (right) -> Room 2
    else if (roomX === 1) {
      // Back door (left) and forward door (right)
      this.createDoor(24, 380, "left", 0, false);
      this.createDoor(this.roomWidth - 24, 380, "right", 2, false);
      this.animateMissionText(this.getLevelMissionText(theme));
      if (this.progressText)
        this.progressText.setText(
          `Level ${this.currentLevel}/3 — Room ${roomX + 1}/3`
        );
    }
    // Room 2: Door back (left) -> Room 1 and maybe to next level (right)
    else if (roomX === 2) {
      // Back door (left)
      this.createDoor(24, 380, "left", 1, false);

      // If not at max level, create door to next level
      if (this.currentLevel < 3) {
        // EXIT door (right) to next level Room 0
        this.createDoor(this.roomWidth - 24, 380, "right", 0, true);
        this.animateMissionText(this.getLevelMissionText(theme));
        if (this.progressText)
          this.progressText.setText(
            `Level ${this.currentLevel}/3 — Room ${roomX + 1}/3`
          );
      } else {
        // Level 3 Room 3 - final room
        this.animateMissionText(this.getLevelMissionText(theme));
        if (this.progressText)
          this.progressText.setText(
            `Level ${this.currentLevel}/3 — Room ${roomX + 1}/3`
          );
      }
    }

    // Setup collisions
    if (this.player) {
      this.physics.add.collider(this.player, this.walls);
      this.physics.add.collider(this.player, this.obstacles);

      // Remove old overlaps to prevent duplicates
      if (this.enemyOverlap) this.enemyOverlap.destroy();
      if (this.projectileOverlap) this.projectileOverlap.destroy();
      if (this.hazardOverlap) this.hazardOverlap.destroy();
      if (this.itemOverlap) this.itemOverlap.destroy();
      if (this.npcOverlap) this.npcOverlap.destroy();

      // Create fresh overlaps for this room
      this.enemyOverlap = this.physics.add.overlap(
        this.player,
        this.enemies,
        this.hitEnemy,
        null,
        this
      );
      this.itemOverlap = this.physics.add.overlap(
        this.player,
        this.items,
        this.collectItem,
        null,
        this
      );
      this.projectileOverlap = this.physics.add.overlap(
        this.player,
        this.projectiles,
        this.hitByProjectile,
        null,
        this
      );
      this.hazardOverlap = this.physics.add.overlap(
        this.player,
        this.hazards,
        this.hitHazard,
        null,
        this
      );

      // NPC interactions
      if (this.npcs) {
        this.npcOverlap = this.physics.add.overlap(
          this.player,
          this.npcs,
          this.nearNPC,
          null,
          this
        );
      }

      console.log("[Room Setup] Overlaps registered:", {
        enemies: this.enemies.getLength(),
        hazards: this.hazards.getLength(),
        projectiles: this.projectiles.getLength(),
      });

      // Update progress HUD at end of room creation
      this.updateProgressHUD();
    }

    if (this.enemies) {
      this.physics.add.collider(this.enemies, this.walls);
      this.physics.add.collider(this.enemies, this.obstacles);
    }

    if (this.projectiles) {
      this.physics.add.collider(this.projectiles, this.walls, (proj) =>
        proj.destroy()
      );
      this.physics.add.collider(this.projectiles, this.obstacles, (proj) =>
        proj.destroy()
      );
    }

    // Moving hazards collide with walls and obstacles
    if (this.hazards) {
      this.physics.add.collider(this.hazards, this.walls);
      this.physics.add.collider(this.hazards, this.obstacles);
    }
  }

  updateProgressHUD() {
    if (this.progressText) {
      this.progressText.setText(
        `Level ${this.currentLevel}/3 — Room ${this.currentRoom.x + 1}/3`
      );
    }
  }

  // Get random door position on specified wall
  getRandomDoorPosition(wall) {
    // 0=top, 1=right, 2=bottom, 3=left
    switch (wall) {
      case 0: // Top
        return {
          x: Phaser.Math.Between(120, this.roomWidth - 120),
          y: 96 + 32,
        };
      case 1: // Right
        return {
          x: this.roomWidth - 48,
          y: Phaser.Math.Between(180, this.roomHeight - 100),
        };
      case 2: // Bottom
        return {
          x: Phaser.Math.Between(120, this.roomWidth - 120),
          y: this.roomHeight - 48,
        };
      case 3: // Left
        return { x: 48, y: Phaser.Math.Between(180, this.roomHeight - 100) };
      default:
        return { x: this.roomWidth - 48, y: 280 };
    }
  }

  // Get direction name from wall index
  getDoorDirection(wall) {
    const directions = ["up", "right", "down", "left"];
    return directions[wall];
  }

  createDoor(x, y, direction, toRoomX, levelTransition = false) {
    // Better door visual with glow effect
    const doorColor = levelTransition ? 0xffd700 : 0x654321; // Gold for level transitions
    const glowColor = levelTransition ? 0xffaa00 : 0x8b6914;

    // Visual door frame at the actual wall edge (perfectly aligned)
    const edgeX =
      direction === "left"
        ? 16
        : direction === "right"
        ? this.roomWidth - 16
        : x;
    const edgeY = y;
    const frame = this.add
      .rectangle(edgeX, edgeY, 32, 64, 0x4b3621)
      .setDepth(2);
    frame.setStrokeStyle(3, 0x2d1b0e);
    this.doorVisuals.add(frame);

    // Door glow inside frame
    const innerGlow = this.add
      .rectangle(edgeX, edgeY, 24, 56, glowColor, 0.7)
      .setDepth(2);
    this.doorVisuals.add(innerGlow);

    // Trigger area at edge for seamless transition
    const doorBg = this.add.rectangle(x, y, 48, 64, doorColor, 0).setDepth(1);
    this.doorVisuals.add(doorBg);

    // Animated arrow
    const arrowText = levelTransition ? "⬆" : "→";
    const arrow = this.add
      .text(x, y, arrowText, {
        fontSize: "32px",
        fill: levelTransition ? "#ffff00" : "#ffffff",
        fontFamily: "Arial",
        stroke: "#000000",
        strokeThickness: 2,
      })
      .setOrigin(0.5)
      .setDepth(2);
    this.doorVisuals.add(arrow);

    // Pulse animation for arrow
    this.tweens.add({
      targets: arrow,
      scaleX: 1.2,
      scaleY: 1.2,
      alpha: 0.7,
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    this.physics.add.existing(doorBg, true);
    this.doorTriggers.add(doorBg);
    this.physics.add.overlap(this.player, doorBg, () => {
      const now = this.time.now;
      const timeSinceLastDoor = now - (this.lastDoorTime || 0);

      if (!this.transitioning && timeSinceLastDoor > 2000) {
        // 2 second cooldown
        this.transitioning = true;
        this.lastDoorTime = now;
        console.log("[Door] Entered", {
          dir: direction,
          toRoomX,
          levelTransition,
          x,
          y,
        });
        this.changeRoom(toRoomX, direction, levelTransition, x, y);
      }
    });

    // Label next-level exits clearly
    if (levelTransition) {
      const exitLabel = this.add
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
      this.doorVisuals.add(exitLabel);
    }
  }

  changeRoom(newRoomX, fromDirection, levelTransition, doorX, doorY) {
    // Store entry door position for respawn
    this.entryDoor = { x: doorX, y: doorY };

    // Fade out transition
    this.cameras.main.fadeOut(200, 0, 0, 0);

    this.time.delayedCall(200, () => {
      // Handle level transition
      if (levelTransition) {
        this.currentLevel = Math.min(3, this.currentLevel + 1);
        this.currentRoom.x = 0; // Start at room 0 of new level
        console.log(
          "[Room] Level transition → Level",
          this.currentLevel,
          "Room",
          this.currentRoom.x
        );
      } else {
        this.currentRoom.x = newRoomX;
        console.log(
          "[Room] Change room → Level",
          this.currentLevel,
          "Room",
          this.currentRoom.x
        );
      }

      this.createRoom(this.currentRoom.x);

      // Position player at entrance based on direction they came from
      const oppositeDir = this.getOppositeDirection(fromDirection);
      this.positionPlayerAtEntrance(oppositeDir);

      // Fade in and reset transitioning flag
      this.cameras.main.fadeIn(200, 0, 0, 0);
      this.time.delayedCall(300, () => {
        this.transitioning = false;
        // Prevent immediate re-entry by setting door cooldown
        this.lastDoorTime = this.time.now;
        // Ensure HUD reflects latest state
        this.updateProgressHUD();
      });
    });
  }

  getOppositeDirection(dir) {
    const opposites = {
      up: "down",
      down: "up",
      left: "right",
      right: "left",
    };
    return opposites[dir] || "down";
  }

  positionPlayerAtEntrance(entranceDirection) {
    // Position player AWAY from the door they just came through
    switch (entranceDirection) {
      case "up":
        this.player.setPosition(640, 180);
        break;
      case "down":
        this.player.setPosition(640, this.roomHeight - 150);
        break;
      case "left":
        this.player.setPosition(150, 380);
        break;
      case "right":
        this.player.setPosition(this.roomWidth - 150, 380);
        break;
      default:
        this.player.setPosition(640, 380);
    }

    // Update entry door to this position for respawning
    this.entryDoor = { x: this.player.x, y: this.player.y };
  }

  update() {
    // Check game over
    if (inventory.health <= 0 && inventory.lives <= 0) {
      this.gameOver();
      return;
    }

    // Movement - Keyboard or Gamepad
    const speed = 230;
    this.player.setVelocity(0);

    let moveX = 0;
    let moveY = 0;

    // Keyboard input
    if (this.cursors.left.isDown || this.wasd.left.isDown) moveX = -1;
    else if (this.cursors.right.isDown || this.wasd.right.isDown) moveX = 1;

    if (this.cursors.up.isDown || this.wasd.up.isDown) moveY = -1;
    else if (this.cursors.down.isDown || this.wasd.down.isDown) moveY = 1;

    // Gamepad input (left stick)
    if (this.gamepad) {
      const leftStick = this.gamepad.leftStick;
      if (Math.abs(leftStick.x) > 0.2) moveX = leftStick.x;
      if (Math.abs(leftStick.y) > 0.2) moveY = leftStick.y;
    }

    // Apply movement
    if (moveX !== 0 || moveY !== 0) {
      const angle = Math.atan2(moveY, moveX);
      this.player.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);

      // Update direction
      if (Math.abs(moveX) > Math.abs(moveY)) {
        this.lastDirection = moveX > 0 ? "right" : "left";
      } else {
        this.lastDirection = moveY > 0 ? "down" : "up";
      }

      // Play walk animation if not attacking
      if (
        this.player.anims.currentAnim &&
        !this.player.anims.currentAnim.key.includes("attack")
      ) {
        if (this.player.anims.currentAnim.key !== "player_walk") {
          this.player.play("player_walk", true);
        }
      }

      // Flip sprite for left/right movement
      if (this.lastDirection === "left") {
        this.player.setFlipX(true);
      } else if (this.lastDirection === "right") {
        this.player.setFlipX(false);
      }
    } else {
      // Play idle animation if not attacking
      if (
        this.player.anims.currentAnim &&
        !this.player.anims.currentAnim.key.includes("attack")
      ) {
        if (this.player.anims.currentAnim.key !== "player_idle") {
          this.player.play("player_idle", true);
        }
      }
    }

    // Attack - SPACE or A button
    const attackPressed =
      Phaser.Input.Keyboard.JustDown(this.attackKey) ||
      (this.gamepad &&
        this.gamepad.A &&
        Phaser.Input.Gamepad.JustDown(this.gamepad.A));

    if (attackPressed && this.canAttack) {
      this.attack();
    }

    // Throw bong - SHIFT or B button
    const throwPressed =
      Phaser.Input.Keyboard.JustDown(this.throwKey) ||
      (this.gamepad &&
        this.gamepad.B &&
        Phaser.Input.Gamepad.JustDown(this.gamepad.B));

    if (throwPressed && this.canThrow && !this.bongThrown) {
      this.throwBong();
    }

    // Interact with NPCs - E key
    if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
      this.tryInteract();
    }

    // Smoke joint - Q key
    if (Phaser.Input.Keyboard.JustDown(this.smokeKey)) {
      this.trySmokeJoint();
    }

    // Check NPC proximity to hide prompt when leaving
    if (this.nearbyNPC && this.npcs) {
      const dist = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        this.nearbyNPC.x,
        this.nearbyNPC.y
      );
      if (dist > 60) {
        this.nearbyNPC = null;
        this.interactionPrompt.setVisible(false);
      }
    }

    // Update bong projectile
    if (this.bongThrown && this.bongThrown.active) {
      this.bongThrown.angle += 15;

      // Return to player after distance
      const dist = Phaser.Math.Distance.Between(
        this.bongThrown.startX,
        this.bongThrown.startY,
        this.bongThrown.x,
        this.bongThrown.y
      );

      if (dist > 200 && !this.bongThrown.returning) {
        this.bongThrown.returning = true;
      }

      if (this.bongThrown.returning) {
        this.physics.moveToObject(this.bongThrown, this.player, 250);

        // Collect bong when it returns
        const distToPlayer = Phaser.Math.Distance.Between(
          this.player.x,
          this.player.y,
          this.bongThrown.x,
          this.bongThrown.y
        );

        if (distToPlayer < 30) {
          this.bongThrown.destroy();
          this.bongThrown = null;
          this.canThrow = true;
        }
      }

      // Check bong hits enemies
      this.enemies.children.entries.forEach((enemy) => {
        if (enemy.active && this.bongThrown && this.bongThrown.active) {
          const dist = Phaser.Math.Distance.Between(
            this.bongThrown.x,
            this.bongThrown.y,
            enemy.x,
            enemy.y
          );
          if (dist < 30 && !enemy.hitByBong) {
            this.damageEnemy(enemy, 1);
            enemy.hitByBong = true;
            this.time.delayedCall(500, () => {
              if (enemy.active) enemy.hitByBong = false;
            });
          }
        }
      });
    }

    // Enemy AI
    this.enemies.children.entries.forEach((enemy) => {
      if (enemy.active) {
        // Keep enemies within bounds (prevent door escapes)
        const margin = 60;
        if (
          enemy.x < margin ||
          enemy.x > this.roomWidth - margin ||
          enemy.y < 150 ||
          enemy.y > this.roomHeight - margin - 50
        ) {
          // Bounce back toward center
          const toCenterX = this.roomWidth / 2 - enemy.x;
          const toCenterY = this.roomHeight / 2 - enemy.y;
          const angle = Math.atan2(toCenterY, toCenterX);
          if (enemy.enemyType === "roamer") {
            enemy.setVelocity(Math.cos(angle) * 60, Math.sin(angle) * 60);
          }
        }

        // Roamer AI - random direction changes
        if (enemy.enemyType === "roamer" && Phaser.Math.Between(0, 100) < 2) {
          const angle = Phaser.Math.Between(0, 360) * (Math.PI / 180);
          enemy.setVelocity(Math.cos(angle) * 60, Math.sin(angle) * 60);
        }

        // Face roamers in movement direction
        if (
          enemy.enemyType === "roamer" &&
          enemy.body &&
          enemy.body.velocity &&
          enemy.anims
        ) {
          if (enemy.body.velocity.x < -10) {
            if (enemy.anims.currentAnim?.key !== "dog_walk_left") {
              enemy.play("dog_walk_left", true);
            }
          } else if (enemy.body.velocity.x > 10) {
            if (enemy.anims.currentAnim?.key !== "dog_walk") {
              enemy.play("dog_walk", true);
            }
          }
        }

        // Shooter AI - shoot at player periodically while roaming
        if (enemy.enemyType === "shooter") {
          // Roam around continuously
          if (this.time.now > enemy.roamChangeTime) {
            enemy.roamAngle = Phaser.Math.FloatBetween(0, Math.PI * 2);
            enemy.roamChangeTime =
              this.time.now + Phaser.Math.Between(1500, 3000);
          }

          const vx = Math.cos(enemy.roamAngle) * enemy.roamSpeed;
          const vy = Math.sin(enemy.roamAngle) * enemy.roamSpeed;
          enemy.setVelocity(vx, vy);

          // Face direction of movement
          // Avoid rapid flipX toggling when vx is near 0 (looks like flashing)
          if (Math.abs(vx) > 5) {
            enemy.setFlipX(vx < 0);
          }

          // Keep walk running; ignoreIfPlaying prevents animation restart flashing
          enemy.play("police_walk", true);

          const timeSinceLastShot = this.time.now - (enemy.lastShot || 0);
          if (timeSinceLastShot > 2000) {
            // Shoot every 2 seconds
            enemy.lastShot = this.time.now;

            // Play shoot animation briefly (don't stop walk animation completely)
            const currentFrame = enemy.anims.currentFrame;
            enemy.play("police_shoot", true);

            // Return to walk animation after shooting
            enemy.once("animationcomplete", () => {
              if (enemy.active && enemy.health > 0) {
                enemy.play("police_walk", true);
              }
            });

            // Fire projectile toward player
            const projectile = this.projectiles.create(
              enemy.x,
              enemy.y,
              "projectile"
            );
            projectile.setScale(0.8);

            const angle = Phaser.Math.Angle.Between(
              enemy.x,
              enemy.y,
              this.player.x,
              this.player.y
            );

            const speed = 120; // Slower projectiles
            projectile.setVelocity(
              Math.cos(angle) * speed,
              Math.sin(angle) * speed
            );
          }
        }
      }
    });

    // Hazard AI (moving hazards)
    if (this.hazards) {
      this.hazards.children.entries.forEach((hazard) => {
        if (hazard.active && hazard.body && hazard.body.velocity) {
          // Keep hazards within bounds
          const margin = 60;
          if (
            hazard.x < margin ||
            hazard.x > this.roomWidth - margin ||
            hazard.y < 150 ||
            hazard.y > this.roomHeight - margin - 50
          ) {
            // Bounce back
            const toCenterX = this.roomWidth / 2 - hazard.x;
            const toCenterY = this.roomHeight / 2 - hazard.y;
            const angle = Math.atan2(toCenterY, toCenterX);
            const speed = 30;
            hazard.setVelocity(
              Math.cos(angle) * speed,
              Math.sin(angle) * speed
            );
          }
        }
      });
    }

    this.updateHUD();
  }

  attack() {
    this.canAttack = false;

    // Play attack animation
    this.player.play("player_attack_1", true);
    this.player.once("animationcomplete", () => {
      if (this.player && this.player.active) {
        this.player.play("player_idle", true);
      }
    });

    // Create directional attack hitbox
    const attackDist = 40;
    // Center attack on player body
    let attackX = this.player.x;
    let attackY = this.player.y;

    if (this.lastDirection === "up") attackY -= attackDist;
    else if (this.lastDirection === "down") attackY += attackDist;
    else if (this.lastDirection === "left") attackX -= attackDist;
    else if (this.lastDirection === "right") attackX += attackDist;

    const attackBox = this.add.rectangle(attackX, attackY, 50, 50, 0xffffff, 0);
    this.physics.add.existing(attackBox);
    attackBox.setDepth(10);

    // Create attack effect centered vertically, offset horizontally by direction
    let effectX = this.player.x;
    const effectY = this.player.y; // Always centered vertically

    if (this.lastDirection === "left") effectX -= 40;
    else if (this.lastDirection === "right") effectX += 40;

    const effect = this.add.image(effectX, effectY, "attack_effect");
    effect.setDepth(15);
    effect.setScale(0.5);
    effect.setAlpha(0.8);

    // Attack slash animation
    this.tweens.add({
      targets: effect,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: 200,
      ease: "Cubic.easeOut",
      onComplete: () => effect.destroy(),
    });

    // Check hits
    this.enemies.children.entries.forEach((enemy) => {
      if (enemy.active) {
        const dist = Phaser.Math.Distance.Between(
          attackX,
          attackY,
          enemy.x,
          enemy.y
        );
        if (dist < 40) {
          this.damageEnemy(enemy, 1);
        }
      }
    });

    // Clean up
    this.time.delayedCall(150, () => {
      attackBox.destroy();
      this.time.delayedCall(200, () => {
        this.canAttack = true;
      });
    });
  }

  throwBong() {
    this.canThrow = false;

    // Create bong projectile in direction player is facing
    const speed = 300;
    let vx = 0,
      vy = 0;

    if (this.lastDirection === "up") vy = -speed;
    else if (this.lastDirection === "down") vy = speed;
    else if (this.lastDirection === "left") vx = -speed;
    else if (this.lastDirection === "right") vx = speed;

    this.bongThrown = this.physics.add.sprite(
      this.player.x,
      this.player.y,
      "bong_sprite"
    );
    this.bongThrown.setScale(0.06); // Slightly larger bong projectile
    this.bongThrown.setVelocity(vx, vy);
    this.bongThrown.setDepth(10);
    this.bongThrown.startX = this.player.x;
    this.bongThrown.startY = this.player.y;
    this.bongThrown.returning = false;

    // Add spinning animation
    this.tweens.add({
      targets: this.bongThrown,
      angle: 360,
      duration: 800,
      repeat: -1,
      ease: "Linear",
    });

    // Add collision
    this.physics.add.collider(this.bongThrown, this.walls, () => {
      if (this.bongThrown) this.bongThrown.returning = true;
    });
    this.physics.add.collider(this.bongThrown, this.obstacles, () => {
      if (this.bongThrown) this.bongThrown.returning = true;
    });
  }

  damageEnemy(enemy, damage) {
    enemy.health -= damage;
    enemy.setTint(0xff0000);
    this.time.delayedCall(200, () => {
      if (enemy.active) enemy.clearTint();
    });

    if (enemy.health <= 0) {
      // Drop heart
      const heart = this.items.create(enemy.x, enemy.y, "heart");
      heart.itemType = "heart";
      heart.value = 1;
      heart.setDepth(5);

      // Play death animation for police before destroying
      if (enemy.enemyType === "shooter" && enemy.texture.key === "police") {
        enemy.play("police_dead");
        enemy.setVelocity(0, 0);
        // Fade out the body over 2 seconds
        this.tweens.add({
          targets: enemy,
          alpha: 0,
          duration: 2000,
          onComplete: () => {
            if (enemy.active) enemy.destroy();
          },
        });
      } else {
        enemy.destroy();
      }
    }
  }

  hitEnemy(player, enemy) {
    if (!this.invincible) {
      console.log(
        "[Damage] Enemy overlap",
        enemy.enemyType,
        "inv=",
        this.invincible
      );
      inventory.takeDamage(1);
      this.updateHUD();

      // Flash player
      this.player.setTint(0xff0000);
      this.invincible = true;

      this.time.delayedCall(1000, () => {
        this.player.clearTint();
        this.invincible = false;
      });
    }
  }

  hitByProjectile(player, projectile) {
    if (!this.invincible) {
      console.log("[Damage] Projectile hit inv=", this.invincible);
      projectile.destroy();
      inventory.takeDamage(1);
      this.updateHUD();

      this.player.setTint(0xff0000);
      this.invincible = true;

      this.time.delayedCall(1000, () => {
        this.player.clearTint();
        this.invincible = false;
      });
    }
  }

  nearNPC(player, npc) {
    // Show interaction prompt when near NPC
    if (npc.npcType === "clerk" && !inventory.hasPapers) {
      this.nearbyNPC = npc;
      const cost = 20;
      this.interactionPrompt
        .setText(
          `Press E to buy papers ($${cost})\nYou have $${inventory.money}`
        )
        .setVisible(true);
    } else if (npc.npcType === "dealer" && !inventory.hasDoobie) {
      this.nearbyNPC = npc;
      const cost = 50;
      this.interactionPrompt
        .setText(`Press E to buy weed ($${cost})\nYou have $${inventory.money}`)
        .setVisible(true);
    }
  }

  tryInteract() {
    if (!this.nearbyNPC) return;

    if (this.nearbyNPC.npcType === "clerk") {
      const cost = 20;
      if (inventory.money >= cost) {
        inventory.money -= cost;
        inventory.hasPapers = true;
        this.interactionPrompt.setText("Papers purchased!").setVisible(true);
        this.time.delayedCall(1500, () => {
          this.interactionPrompt.setVisible(false);
        });
        this.updateHUD();
        this.missionText.setText("THE CRIB - Find the exit!");
      } else {
        this.interactionPrompt
          .setText(`Not enough money! Need $${cost}`)
          .setVisible(true);
        this.time.delayedCall(1500, () => {
          this.interactionPrompt.setVisible(false);
        });
      }
    } else if (this.nearbyNPC.npcType === "dealer") {
      const cost = 50;
      if (inventory.money >= cost) {
        inventory.money -= cost;
        inventory.hasDoobie = true;
        this.interactionPrompt.setText("Weed purchased!").setVisible(true);
        this.time.delayedCall(1500, () => {
          this.interactionPrompt.setVisible(false);
        });
        this.updateHUD();
        this.missionText.setText(
          "BACK ALLEY - Press Q to roll a doobie, smoke and WIN!"
        );
      } else {
        this.interactionPrompt
          .setText(`Not enough money! Need $${cost}`)
          .setVisible(true);
        this.time.delayedCall(1500, () => {
          this.interactionPrompt.setVisible(false);
        });
      }
    }
  }

  trySmokeJoint() {
    if (inventory.hasLighter && inventory.hasPapers && inventory.hasDoobie) {
      // Victory!
      this.physics.pause();

      const victoryBg = this.add
        .rectangle(640, 360, 1280, 720, 0x000000, 0.8)
        .setScrollFactor(0)
        .setDepth(200);

      const victoryText = this.add
        .text(640, 280, "🌿 YOU WIN! 🌿", {
          fontSize: "64px",
          fill: "#00ff00",
          fontFamily: "Courier New",
          fontStyle: "bold",
          stroke: "#000000",
          strokeThickness: 4,
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(201);

      const subText = this.add
        .text(640, 380, "Time to chill and enjoy that doobie!", {
          fontSize: "24px",
          fill: "#ffffff",
          fontFamily: "Courier New",
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(201);

      const restartText = this.add
        .text(640, 460, "Press SPACE to play again", {
          fontSize: "20px",
          fill: "#ffff00",
          fontFamily: "Courier New",
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(201);

      // Pulse victory text
      this.tweens.add({
        targets: victoryText,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 800,
        yoyo: true,
        repeat: -1,
      });

      this.input.keyboard.once("keydown-SPACE", () => {
        inventory.reset();
        this.scene.restart();
      });
    } else {
      // Missing items
      const missing = [];
      if (!inventory.hasLighter) missing.push("lighter");
      if (!inventory.hasPapers) missing.push("papers");
      if (!inventory.hasDoobie) missing.push("weed");

      this.interactionPrompt
        .setText(`Need: ${missing.join(", ")}!`)
        .setVisible(true);
      this.time.delayedCall(2000, () => {
        this.interactionPrompt.setVisible(false);
      });
    }
  }

  collectItem(player, item) {
    if (item.itemType === "money") {
      inventory.addMoney(item.value);

      // Sparkle effect
      const sparkle = this.add.circle(item.x, item.y, 20, 0xffff00, 0.8);
      sparkle.setDepth(50);
      this.tweens.add({
        targets: sparkle,
        scaleX: 2,
        scaleY: 2,
        alpha: 0,
        duration: 300,
        onComplete: () => sparkle.destroy(),
      });

      // Float text showing value
      const valueText = this.add
        .text(item.x, item.y, `+$${item.value}`, {
          fontSize: "16px",
          fill: "#ffff00",
          fontStyle: "bold",
          stroke: "#000000",
          strokeThickness: 2,
        })
        .setOrigin(0.5);
      valueText.setDepth(51);
      this.tweens.add({
        targets: valueText,
        y: item.y - 40,
        alpha: 0,
        duration: 800,
        onComplete: () => valueText.destroy(),
      });

      item.destroy();
    } else if (item.itemType === "heart") {
      inventory.heal(item.value);

      // Healing sparkle
      const sparkle = this.add.circle(item.x, item.y, 20, 0xff0000, 0.8);
      sparkle.setDepth(50);
      this.tweens.add({
        targets: sparkle,
        scaleX: 2,
        scaleY: 2,
        alpha: 0,
        duration: 300,
        onComplete: () => sparkle.destroy(),
      });

      item.destroy();
    } else if (item.itemType === "lighter") {
      inventory.hasLighter = true;

      // Pickup sparkle
      const sparkle = this.add.circle(item.x, item.y, 20, 0xff8800, 0.8);
      sparkle.setDepth(50);
      this.tweens.add({
        targets: sparkle,
        scaleX: 2,
        scaleY: 2,
        alpha: 0,
        duration: 400,
        onComplete: () => sparkle.destroy(),
      });

      // Pickup text
      const pickupText = this.add
        .text(item.x, item.y, "Lighter found!", {
          fontSize: "16px",
          fill: "#ff8800",
          fontStyle: "bold",
          stroke: "#000000",
          strokeThickness: 2,
        })
        .setOrigin(0.5);
      pickupText.setDepth(51);
      this.tweens.add({
        targets: pickupText,
        y: item.y - 40,
        alpha: 0,
        duration: 1000,
        onComplete: () => pickupText.destroy(),
      });

      item.destroy();
      this.missionText.setText("THE CRIB - Lighter found! Find the exit!");
    }
    this.updateHUD();
  }

  hitHazard(player, hazard) {
    if (!this.invincible && !this.falling) {
      console.log("[Damage] Hazard overlap inv=", this.invincible);
      this.falling = true;
      this.invincible = true;

      // Falling animation - shrink and spin
      this.tweens.add({
        targets: player,
        scaleX: 0.2,
        scaleY: 0.2,
        angle: 720,
        alpha: 0.3,
        duration: 600,
        ease: "Cubic.easeIn",
        onComplete: () => {
          // Reset player
          player.setScale(1);
          player.setAlpha(1);
          player.setAngle(0);

          // Take damage
          inventory.takeDamage(1);

          // Respawn at entry door position
          player.setPosition(this.entryDoor.x, this.entryDoor.y);

          // Flash invincibility
          this.tweens.add({
            targets: player,
            alpha: 0.5,
            duration: 100,
            yoyo: true,
            repeat: 8,
            onComplete: () => {
              player.setAlpha(1);
              this.invincible = false;
              this.falling = false;
            },
          });

          this.updateHUD();
        },
      });
    }
  }

  updateHUD() {
    // Update hearts with animation
    for (let i = 0; i < this.heartContainers.length; i++) {
      const heart = this.heartContainers[i];
      if (i < inventory.health) {
        heart.setAlpha(1);
        // Pulse filled hearts
        if (!heart.getData("pulsing")) {
          heart.setData("pulsing", true);
          this.tweens.add({
            targets: heart,
            scaleX: 0.85,
            scaleY: 0.85,
            duration: 500,
            yoyo: true,
            repeat: -1,
          });
        }
      } else {
        heart.setAlpha(0.3);
        // Stop pulsing empty hearts
        if (heart.getData("pulsing")) {
          this.tweens.killTweensOf(heart);
          heart.setScale(0.8);
          heart.setData("pulsing", false);
        }
      }
    }

    // Update lives
    this.livesText.setText(`LIVES: ${inventory.lives}`);

    // Update money
    this.moneyText.setText(`💰 $${inventory.money}`);

    // Update items
    const items = [];
    if (inventory.hasLighter) items.push("🔥");
    if (inventory.hasPapers) items.push("📄");
    if (inventory.hasDoobie) items.push("🌿");
    this.itemsText.setText(items.join(" "));
  }

  animateMissionText(text) {
    if (!this.missionText) return;
    this.tweens.killTweensOf(this.missionText);
    this.missionText.setText(text);
    this.missionText.setScale(2.5);
    this.missionText.setAlpha(1);
    this.tweens.add({
      targets: this.missionText,
      scaleX: 1,
      scaleY: 1,
      duration: 600,
      ease: "Back.easeOut",
    });
  }

  animateMissionText(text) {
    if (!this.missionText) return;
    this.missionText.setText(text);
    this.missionText.setScale(2.5);
    this.missionText.setAlpha(1);
    this.tweens.add({
      targets: this.missionText,
      scaleX: 1,
      scaleY: 1,
      duration: 600,
      ease: "Back.easeOut",
    });
  }

  gameOver() {
    // Prevent multiple game over calls
    if (this.gameOverTriggered) return;
    this.gameOverTriggered = true;

    this.physics.pause();

    // Remove attack key to prevent conflicts
    if (this.attackKey) {
      this.attackKey.destroy();
    }

    // Remove all other key listeners to prevent input during game over
    if (this.throwKey) this.throwKey.destroy();
    if (this.interactKey) this.interactKey.destroy();
    if (this.smokeKey) this.smokeKey.destroy();

    // Play death animation if not already
    if (
      this.player &&
      this.player.anims &&
      this.player.anims.currentAnim?.key !== "player_dead"
    ) {
      this.player.play("player_dead");
    }

    const gameOverText = this.add
      .text(640, 360, "GAME OVER", {
        fontSize: "64px",
        fill: "#ff0000",
        fontFamily: "Courier New",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(200);

    const restartText = this.add
      .text(640, 460, "Press SPACE to restart", {
        fontSize: "28px",
        fill: "#ffffff",
        fontFamily: "Courier New",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(200);

    // Use a fresh key binding for restart (one-time use)
    const spaceKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );
    spaceKey.once("down", () => {
      // Clean up before restart
      spaceKey.destroy();
      inventory.reset();
      this.scene.restart();
    });
  }
}
