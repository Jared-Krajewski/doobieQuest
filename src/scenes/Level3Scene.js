import Phaser from "phaser";
import { inventory } from "../inventory.js";
import { SimplePlayerController } from "../utils/SimplePlayerController.js";
import { SimpleHUD } from "../utils/SimpleHUD.js";
import { SimpleEnemyManager } from "../utils/SimpleEnemyManager.js";
import { SimpleCombatSystem } from "../utils/SimpleCombatSystem.js";

export class Level3Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level3Scene" });
  }

  create() {
    // Set world bounds for dark alley
    const worldWidth = 2000;
    const worldHeight = 1600;
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

    // Background - dark alley
    this.cameras.main.setBackgroundColor("#1a1a1a");
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);

    // Title
    this.titleText = this.add
      .text(960, 50, "LEVEL 3: The Alleyway Hookup", {
        fontSize: "32px",
        fill: "#9370DB",
        fontFamily: "Courier New",
      })
      .setOrigin(0.5)
      .setScrollFactor(0);

    // Initialize HUD (dark theme)
    this.hud = new SimpleHUD(this, {
      textColor: "#ffffff",
      bgColor: "#000000",
    });

    // Create floor
    const tileSize = 32;
    for (let x = 0; x < worldWidth; x += tileSize) {
      for (let y = 0; y < worldHeight; y += tileSize) {
        this.add.image(x + 16, y + 16, "floor_stone");
      }
    }

    // Create walls
    this.walls = this.physics.add.staticGroup();

    // Outer walls
    for (let x = 0; x < worldWidth; x += tileSize) {
      this.walls.create(x + 16, 16, "wall_brick").setImmovable(true);
      this.walls
        .create(x + 16, worldHeight - 16, "wall_brick")
        .setImmovable(true);
    }
    for (let y = 0; y < worldHeight; y += tileSize) {
      this.walls.create(16, y + 16, "wall_brick").setImmovable(true);
      this.walls
        .create(worldWidth - 16, y + 16, "wall_brick")
        .setImmovable(true);
    }

    // Alley obstacles - dumpsters, crates, debris
    this.obstacles = this.physics.add.staticGroup();

    // Dumpsters along left wall
    for (let y = 200; y < 1400; y += 200) {
      this.obstacles.create(150, y, "dumpster").setImmovable(true);
      this.obstacles.create(182, y, "dumpster").setImmovable(true);
    }

    // Dumpsters along right wall
    for (let y = 300; y < 1500; y += 200) {
      this.obstacles.create(1850, y, "dumpster").setImmovable(true);
      this.obstacles.create(1818, y, "dumpster").setImmovable(true);
    }

    // Center obstacles (crates/debris)
    const centerObstacles = [
      { x: 600, y: 400 },
      { x: 632, y: 400 },
      { x: 1000, y: 600 },
      { x: 1032, y: 600 },
      { x: 1400, y: 500 },
      { x: 1432, y: 500 },
      { x: 800, y: 1000 },
      { x: 832, y: 1000 },
      { x: 1200, y: 1200 },
      { x: 1232, y: 1200 },
    ];

    centerObstacles.forEach((pos) => {
      this.obstacles.create(pos.x, pos.y, "dumpster").setImmovable(true);
    });

    // Initialize player controller
    this.playerController = new SimplePlayerController(this, 1000, 1500);
    this.player = this.playerController.sprite;
    this.physics.add.collider(this.player, this.walls);
    this.physics.add.collider(this.player, this.obstacles);

    // Camera follows player
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    // Initialize enemy manager and create enemies (use police group name)
    this.enemyManager = new SimpleEnemyManager(this);
    this.enemies = this.physics.add.group(); // Use "enemies" for combat system compatibility
    this.invincible = false;

    // Officer 1 - horizontal patrol left area
    this.enemyManager.createHorizontalPatroller(
      this.enemies,
      400,
      600,
      "police",
      250,
      700,
      100,
      4
    );

    // Officer 2 - vertical patrol center (requires both X and Y patrol)
    const cop2 = this.enemies.create(1000, 800, "police");
    cop2.setSize(28, 28);
    cop2.minY = 400;
    cop2.maxY = 1200;
    cop2.setVelocityY(-100);
    cop2.health = 4;
    cop2.enemyType = "vertical_patrol";

    // Officer 3 - horizontal patrol right area
    this.enemyManager.createHorizontalPatroller(
      this.enemies,
      1600,
      1000,
      "police",
      1300,
      1750,
      -100,
      4
    );

    // Roaming enemies (alley creatures)
    this.enemyManager.createRoamer(this.enemies, 700, 900, "roamer", 2);
    this.enemyManager.createRoamer(this.enemies, 1300, 700, "roamer", 2);

    // Setup collisions
    this.physics.add.collider(this.enemies, this.walls);
    this.physics.add.collider(this.enemies, this.obstacles);
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.hitPolice,
      null,
      this
    );

    // Initialize combat system (Level3 heals 3HP instead of 2HP)
    this.combatSystem = new SimpleCombatSystem(this, this.enemyManager);
    this.combatSystem.getHealAmount = () => 3; // Override heal amount for Level3

    // Dealer (in the back corner, shadowy area)
    this.dealer = this.physics.add.sprite(1000, 200, "dealer");
    this.dealer.setSize(28, 28);
    this.dealer.setImmovable(true);
    this.physics.add.overlap(
      this.player,
      this.dealer,
      this.checkWinCondition,
      null,
      this
    );

    // Doobie spawn point
    this.doobieSpawned = false;

    // Instructions
    this.add
      .text(
        960,
        1020,
        "Reach the DEALER with $5+, LIGHTER, and PAPERS! Avoid POLICE! (-20HP)",
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

  hitPolice(player, cop) {
    if (!this.invincible) {
      inventory.takeDamage(20);
      this.hud.update();

      // Flash player
      this.invincible = true;
      this.playerController.flashDamage(() => {
        this.invincible = false;
      });

      this.hud.showMessage(player.x, player.y - 50, "-20HP!", {
        fontSize: "24px",
        color: "#ff0000",
        fontStyle: "bold",
      });
    }
  }

  checkWinCondition(player, dealer) {
    const hasAllItems =
      inventory.money >= 5 && inventory.hasLighter && inventory.hasPapers;

    if (hasAllItems && !this.doobieSpawned) {
      // Spawn the doobie!
      this.doobieSpawned = true;
      dealer.destroy();

      // Deduct $5
      inventory.addMoney(-5);
      this.hud.update();

      const doobie = this.physics.add.sprite(dealer.x, dealer.y, "doobie");
      doobie.setSize(24, 24);
      this.physics.add.overlap(
        player,
        doobie,
        () => {
          doobie.destroy();
          inventory.hasDoobie = true;
          this.hud.update();
          this.winGame();
        },
        null,
        this
      );

      this.hud.showMessage(
        dealer.x,
        dealer.y - 80,
        '"Here ya go, enjoy!"\n-$5',
        {
          fontSize: "20px",
          color: "#00ff00",
          fontStyle: "bold",
          duration: 3000,
        }
      );
    } else if (!hasAllItems) {
      const missing = [];
      if (inventory.money < 5) missing.push(`$${5 - inventory.money}`);
      if (!inventory.hasLighter) missing.push("LIGHTER");
      if (!inventory.hasPapers) missing.push("PAPERS");

      this.hud.showMessage(
        dealer.x,
        dealer.y - 60,
        `Need: ${missing.join(", ")}`,
        {
          fontSize: "18px",
          color: "#ff0000",
          backgroundColor: "#000000",
          padding: { x: 6, y: 4 },
          duration: 2000,
        }
      );
    }
  }

  winGame() {
    this.physics.pause();

    const winText = this.add
      .text(960, 400, "QUEST COMPLETE!\n\nYou got the DOOBIE!", {
        fontSize: "48px",
        fill: "#00ff00",
        fontFamily: "Courier New",
        align: "center",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0);

    const restartText = this.add
      .text(960, 540, "Press SPACE to play again", {
        fontSize: "24px",
        fill: "#ffffff",
        fontFamily: "Courier New",
      })
      .setOrigin(0.5)
      .setScrollFactor(0);

    this.input.keyboard.once("keydown-SPACE", () => {
      inventory.reset();
      this.scene.start("Level1Scene");
    });
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
