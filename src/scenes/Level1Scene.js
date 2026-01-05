import Phaser from "phaser";
import { inventory } from "../inventory.js";
import { getLevelTheme } from "../utils/levelThemes.js";
import { getOppositeDirection } from "../utils/roomHelpers.js";
import { PlayerController } from "../systems/PlayerController.js";
import { EnemyManager } from "../systems/EnemyManager.js";
import { HUDManager } from "../systems/HUDManager.js";
import { RoomBuilder } from "../systems/RoomBuilder.js";
import { CombatSystem } from "../systems/CombatSystem.js";
import { NPCManager } from "../systems/NPCManager.js";
import { ItemManager } from "../systems/ItemManager.js";

export class Level1Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level1Scene" });
  }

  create() {
    // Room and level tracking
    this.currentLevel = 1;
    this.currentRoom = { x: 0 };
    this.entryDoor = { x: 640, y: 500 };
    this.roomWidth = 1280;
    this.roomHeight = 720;

    // World setup
    this.physics.world.setBounds(0, 0, this.roomWidth, this.roomHeight);
    this.cameras.main.setBounds(0, 0, this.roomWidth, this.roomHeight);
    this.cameras.main.setBackgroundColor("#2d1b0e");

    // State flags
    this.transitioning = false;
    this.falling = false;
    this.lastDoorTime = 0;
    this.gameOverTriggered = false;
    this.invincible = false;

    // Tilemap layers
    this.tilemapLayer = null;
    this.tilemapLayer2 = null;

    // Initialize systems
    this.hudManager = new HUDManager(this);
    this.playerController = new PlayerController(this, 640, 500);
    this.player = this.playerController.sprite; // For backward compatibility
    this.enemyManager = new EnemyManager(this);
    this.roomBuilder = new RoomBuilder(this);
    this.combatSystem = new CombatSystem(this, this.playerController, this.enemyManager);
    this.npcManager = new NPCManager(this, this.hudManager);
    this.itemManager = new ItemManager(this, this.hudManager);

    // Camera follows player
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    // Setup input
    this.setupInput();

    // Create initial room
    this.createRoom(0);

    // Initial HUD update
    this.hudManager.update();
    this.hudManager.updateProgress(this.currentLevel, this.currentRoom.x);
  }

  setupInput() {
    // Action keys
    this.attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.throwKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.smokeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);

    // Gamepad (handled by PlayerController)
    this.gamepad = this.playerController.gamepad;
  }

  createRoom(roomX) {
    // Build room using RoomBuilder
    this.roomBuilder.createRoom(roomX, this.currentLevel, this.enemyManager);

    // Setup collisions
    this.setupCollisions();

    // Update HUD
    const theme = getLevelTheme(this.currentLevel);
    this.hudManager.animateMissionText(this.getLevelMissionText(theme));
    this.hudManager.updateProgress(this.currentLevel, this.currentRoom.x);
  }

  setupCollisions() {
    // Player collisions
    this.physics.add.collider(this.player, this.walls);
    this.physics.add.collider(this.player, this.obstacles);

    // Remove old overlaps
    if (this.enemyOverlap) this.enemyOverlap.destroy();
    if (this.projectileOverlap) this.projectileOverlap.destroy();
    if (this.hazardOverlap) this.hazardOverlap.destroy();
    if (this.itemOverlap) this.itemOverlap.destroy();
    if (this.npcOverlap) this.npcOverlap.destroy();

    // Create new overlaps
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
      (player, item) => this.itemManager.collectItem(player, item),
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
    this.npcOverlap = this.physics.add.overlap(
      this.player,
      this.npcs,
      (player, npc) => this.npcManager.handleNearNPC(player, npc),
      null,
      this
    );

    // Enemy collisions
    if (this.enemies) {
      this.physics.add.collider(this.enemies, this.walls);
      this.physics.add.collider(this.enemies, this.obstacles);
    }

    // Projectile collisions
    if (this.projectiles) {
      this.physics.add.collider(this.projectiles, this.walls, (proj) => proj.destroy());
      this.physics.add.collider(this.projectiles, this.obstacles, (proj) => proj.destroy());
    }

    // Hazard collisions
    if (this.hazards) {
      this.physics.add.collider(this.hazards, this.walls);
      this.physics.add.collider(this.hazards, this.obstacles);
    }
  }

  update() {
    // Check game over
    if (inventory.health <= 0 && inventory.lives <= 0) {
      this.gameOver();
      return;
    }

    // Update systems
    this.playerController.update();
    this.enemyManager.update(this.enemies, this.player, this.projectiles);
    this.combatSystem.update();
    this.npcManager.update(this.player);
    this.updateHazards();

    // Handle input
    this.handleInput();

    // Update HUD
    this.hudManager.update();
  }

  handleInput() {
    // Attack
    if (this.combatSystem.isAttackPressed(this.attackKey, this.gamepad)) {
      this.combatSystem.attack();
    }

    // Throw
    if (this.combatSystem.isThrowPressed(this.throwKey, this.gamepad)) {
      this.combatSystem.throwBong();
    }

    // Interact
    if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
      this.npcManager.tryInteract();
    }

    // Smoke
    if (Phaser.Input.Keyboard.JustDown(this.smokeKey)) {
      this.trySmokeJoint();
    }
  }

  updateHazards() {
    if (!this.hazards) return;

    this.hazards.children.entries.forEach((hazard) => {
      if (hazard.active && hazard.body && hazard.body.velocity) {
        // Keep hazards in bounds
        const margin = 60;
        if (
          hazard.x < margin ||
          hazard.x > this.roomWidth - margin ||
          hazard.y < 150 ||
          hazard.y > this.roomHeight - margin - 50
        ) {
          const toCenterX = this.roomWidth / 2 - hazard.x;
          const toCenterY = this.roomHeight / 2 - hazard.y;
          const angle = Math.atan2(toCenterY, toCenterX);
          const speed = 30;
          hazard.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
        }
      }
    });
  }

  changeRoom(newRoomX, fromDirection, levelTransition, doorX, doorY) {
    this.entryDoor = { x: doorX, y: doorY };

    // Fade out
    this.cameras.main.fadeOut(200, 0, 0, 0);

    this.time.delayedCall(200, () => {
      // Handle level transition
      if (levelTransition) {
        this.currentLevel = Math.min(3, this.currentLevel + 1);
        this.currentRoom.x = 0;
      } else {
        this.currentRoom.x = newRoomX;
      }

      this.createRoom(this.currentRoom.x);

      // Position player at entrance
      const oppositeDir = getOppositeDirection(fromDirection);
      this.positionPlayerAtEntrance(oppositeDir);

      // Fade in
      this.cameras.main.fadeIn(200, 0, 0, 0);
      this.time.delayedCall(300, () => {
        this.transitioning = false;
        this.lastDoorTime = this.time.now;
        this.hudManager.updateProgress(this.currentLevel, this.currentRoom.x);
      });
    });
  }

  positionPlayerAtEntrance(entranceDirection) {
    let x, y;
    
    switch (entranceDirection) {
      case "up":
        x = 640;
        y = 180;
        break;
      case "down":
        x = 640;
        y = this.roomHeight - 150;
        break;
      case "left":
        x = 150;
        y = 380;
        break;
      case "right":
        x = this.roomWidth - 150;
        y = 380;
        break;
      default:
        x = 640;
        y = 380;
    }

    this.playerController.setPosition(x, y);
    this.entryDoor = { x, y };
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

    return !inventory.hasDoobie
      ? `${theme.name}: Buy weed from dealer (E)!`
      : `${theme.name}: Objective complete! Press Q to roll a doobie, smoke and WIN!`;
  }

  hitEnemy(player, enemy) {
    if (!this.invincible) {
      inventory.takeDamage(1);
      this.hudManager.update();

      this.playerController.setTint(0xff0000);
      this.invincible = true;

      this.time.delayedCall(1000, () => {
        this.playerController.clearTint();
        this.invincible = false;
      });
    }
  }

  hitByProjectile(player, projectile) {
    if (!this.invincible) {
      projectile.destroy();
      inventory.takeDamage(1);
      this.hudManager.update();

      this.playerController.setTint(0xff0000);
      this.invincible = true;

      this.time.delayedCall(1000, () => {
        this.playerController.clearTint();
        this.invincible = false;
      });
    }
  }

  hitHazard(player, hazard) {
    if (!this.invincible && !this.falling) {
      this.falling = true;
      this.invincible = true;

      // Falling animation
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

          // Respawn at entry
          this.playerController.setPosition(this.entryDoor.x, this.entryDoor.y);

          // Invincibility flash
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

          this.hudManager.update();
        },
      });
    }
  }

  trySmokeJoint() {
    if (inventory.hasLighter && inventory.hasPapers && inventory.hasDoobie) {
      this.showVictory();
    } else {
      const missing = [];
      if (!inventory.hasLighter) missing.push("lighter");
      if (!inventory.hasPapers) missing.push("papers");
      if (!inventory.hasDoobie) missing.push("weed");

      this.hudManager.showTimedPrompt(`Need: ${missing.join(", ")}!`, 2000);
    }
  }

  showVictory() {
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
  }

  gameOver() {
    if (this.gameOverTriggered) return;
    this.gameOverTriggered = true;

    this.physics.pause();

    // Destroy input keys
    if (this.attackKey) this.attackKey.destroy();
    if (this.throwKey) this.throwKey.destroy();
    if (this.interactKey) this.interactKey.destroy();
    if (this.smokeKey) this.smokeKey.destroy();

    // Play death animation
    if (this.player && this.player.anims && this.player.anims.currentAnim?.key !== "player_dead") {
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

    const spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    spaceKey.once("down", () => {
      spaceKey.destroy();
      inventory.reset();
      this.scene.restart();
    });
  }
}
