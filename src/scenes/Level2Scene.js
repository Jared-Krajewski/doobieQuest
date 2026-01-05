import Phaser from "phaser";
import { inventory } from "../inventory.js";
import { SimplePlayerController } from "../utils/SimplePlayerController.js";
import { SimpleHUD } from "../utils/SimpleHUD.js";
import { SimpleEnemyManager } from "../utils/SimpleEnemyManager.js";
import { SimpleCombatSystem } from "../utils/SimpleCombatSystem.js";

export class Level2Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level2Scene" });
  }

  create() {
    // Set world bounds for larger store
    const worldWidth = 2400;
    const worldHeight = 1400;
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

    // Background - bright store
    this.cameras.main.setBackgroundColor("#e8e8e8");
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);

    // Title
    this.titleText = this.add
      .text(960, 50, "LEVEL 2: Corner Store Dash", {
        fontSize: "32px",
        fill: "#ff4500",
        fontFamily: "Courier New",
      })
      .setOrigin(0.5)
      .setScrollFactor(0);

    // Initialize HUD
    this.hud = new SimpleHUD(this, {
      textColor: "#000000",
      bgColor: "#ffffff",
    });

    // Create floor tiles
    const tileSize = 32;
    for (let x = 0; x < worldWidth; x += tileSize) {
      for (let y = 0; y < worldHeight; y += tileSize) {
        this.add.image(x + 16, y + 16, "floor_tile");
      }
    }

    // Create walls
    this.walls = this.physics.add.staticGroup();

    // Outer walls
    for (let x = 0; x < worldWidth; x += tileSize) {
      this.walls.create(x + 16, 16, "wall_shelf").setImmovable(true);
      this.walls
        .create(x + 16, worldHeight - 16, "wall_shelf")
        .setImmovable(true);
    }
    for (let y = 0; y < worldHeight; y += tileSize) {
      this.walls.create(16, y + 16, "wall_shelf").setImmovable(true);
      this.walls
        .create(worldWidth - 16, y + 16, "wall_shelf")
        .setImmovable(true);
    }

    // Create store aisles (shelving units)
    this.aisles = this.physics.add.staticGroup();

    // Aisle 1 - left side
    for (let y = 200; y < 1200; y += tileSize) {
      this.aisles.create(400, y, "wall_shelf").setImmovable(true);
      this.aisles.create(450, y, "products").setImmovable(true);
    }

    // Aisle 2 - center left
    for (let y = 200; y < 1200; y += tileSize) {
      this.aisles.create(800, y, "wall_shelf").setImmovable(true);
      this.aisles.create(850, y, "products").setImmovable(true);
    }

    // Aisle 3 - center right
    for (let y = 200; y < 1200; y += tileSize) {
      this.aisles.create(1400, y, "wall_shelf").setImmovable(true);
      this.aisles.create(1450, y, "products").setImmovable(true);
    }

    // Aisle 4 - right side
    for (let y = 200; y < 1200; y += tileSize) {
      this.aisles.create(1900, y, "wall_shelf").setImmovable(true);
      this.aisles.create(1950, y, "products").setImmovable(true);
    }

    // Checkout counter (top area)
    for (let x = 100; x < 700; x += tileSize) {
      this.aisles.create(x, 150, "table").setImmovable(true);
    }

    // Initialize player controller
    this.playerController = new SimplePlayerController(this, 200, 1300);
    this.player = this.playerController.sprite;
    this.physics.add.collider(this.player, this.walls);
    this.physics.add.collider(this.player, this.aisles);

    // Camera follows player
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    // Initialize enemy manager and create enemies
    this.enemyManager = new SimpleEnemyManager(this);
    this.enemies = this.physics.add.group();
    this.invincible = false;

    // Cashier 1 - patrols aisle 1
    this.enemyManager.createVerticalPatroller(
      this.enemies,
      400,
      500,
      "cashier",
      200,
      1100,
      80,
      3
    );

    // Cashier 2 - patrols aisle 2
    this.enemyManager.createVerticalPatroller(
      this.enemies,
      800,
      800,
      "cashier",
      200,
      1100,
      -80,
      3
    );

    // Cashier 3 - patrols aisle 3
    this.enemyManager.createVerticalPatroller(
      this.enemies,
      1400,
      400,
      "cashier",
      200,
      1100,
      80,
      3
    );

    // Roaming enemies between aisles
    this.enemyManager.createRoamer(this.enemies, 600, 700, "roamer", 2);
    this.enemyManager.createRoamer(this.enemies, 1200, 900, "roamer", 2);

    // Setup collisions
    this.physics.add.collider(this.enemies, this.walls);
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.hitEnemy,
      null,
      this
    );

    // Initialize combat system
    this.combatSystem = new SimpleCombatSystem(this, this.enemyManager);

    // Papers (on checkout counter - need $5)
    this.papers = this.physics.add.sprite(400, 150, "papers");
    this.papers.setSize(24, 24);
    this.physics.add.overlap(
      this.player,
      this.papers,
      this.buyPapers,
      null,
      this
    );

    // Exit door (right side)
    this.door = this.add.rectangle(2350, 700, 40, 80, 0x4169e1);
    this.add
      .text(2350, 700, "EXIT", {
        fontSize: "16px",
        fill: "#ffffff",
        fontFamily: "Courier New",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    this.physics.add.existing(this.door, true);
    this.physics.add.overlap(
      this.player,
      this.door,
      this.exitLevel,
      null,
      this
    );

    // Instructions
    this.add
      .text(
        960,
        1020,
        "Get PAPERS ($5) - Avoid cashiers! (-$2 & 10HP per hit)",
        {
          fontSize: "18px",
          fill: "#000000",
          fontFamily: "Courier New",
          backgroundColor: "#ffff00",
          padding: { x: 8, y: 4 },
        }
      )
      .setOrigin(0.5)
      .setScrollFactor(0);

    // Controls are handled by playerController and combatSystem
    this.hud.update();
  }

  update() {
    // Check for game over
    if (inventory.health <= 0) {
      this.gameOver();
      return;
    }

    // Update systems
    this.playerController.update();
    this.enemyManager.update(this.enemies);
    this.combatSystem.update();
    this.hud.update();
  }

  attack() {
    // Attack is now handled by SimpleCombatSystem
    this.combatSystem.attack();
  }

  hitEnemy(player, enemy) {
    if (!this.invincible) {
      inventory.takeDamage(10);
      inventory.addMoney(-2);
      this.hud.update();

      // Flash player
      this.invincible = true;
      this.playerController.flashDamage(() => {
        this.invincible = false;
      });

      this.hud.showMessage(player.x, player.y - 50, "-10HP, -$2!", {
        fontSize: "20px",
        color: "#ff0000",
        fontStyle: "bold",
      });
    }
  }

  buyPapers(player, papers) {
    if (inventory.money >= 5 && !inventory.hasPapers) {
      papers.destroy();
      inventory.addMoney(-5);
      inventory.hasPapers = true;
      this.hud.update();

      this.hud.showMessage(player.x, player.y - 50, "Got PAPERS! (-$5)", {
        fontSize: "24px",
        color: "#00ff00",
        fontStyle: "bold",
        duration: 2000,
      });
    } else if (inventory.money < 5) {
      this.hud.showMessage(
        player.x,
        player.y - 50,
        `Need $${5 - inventory.money} more!`,
        {
          fontSize: "20px",
          color: "#ff0000",
          backgroundColor: "#ffffff",
          padding: { x: 6, y: 4 },
        }
      );
    }
  }

  exitLevel() {
    if (inventory.hasPapers) {
      this.scene.start("Level3Scene");
    } else {
      this.hud.showMessage(
        this.player.x,
        this.player.y - 50,
        "Need PAPERS first!",
        {
          fontSize: "20px",
          color: "#ff0000",
          backgroundColor: "#ffffff",
          padding: { x: 6, y: 4 },
          duration: 2000,
        }
      );
    }
  }

  updateHUD() {
    // Delegate to SimpleHUD
    this.hud.update();
  }

  gameOver() {
    const gameOverText = this.add
      .text(960, 400, "GAME OVER\n\nYou ran out of health!", {
        fontSize: "48px",
        fill: "#ff0000",
        fontFamily: "Courier New",
        align: "center",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0);

    const restartText = this.add
      .text(960, 540, "Press SPACE to restart", {
        fontSize: "24px",
        fill: "#ffffff",
        fontFamily: "Courier New",
      })
      .setOrigin(0.5)
      .setScrollFactor(0);

    this.physics.pause();
    this.input.keyboard.once("keydown-SPACE", () => {
      inventory.reset();
      this.scene.start("Level1Scene");
    });
  }
}
