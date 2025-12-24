import Phaser from "phaser";
import { inventory } from "../inventory.js";

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

    // HUD
    this.hudText = this.add
      .text(20, 20, "", {
        fontSize: "20px",
        fill: "#000000",
        fontFamily: "Courier New",
        backgroundColor: "#ffffff",
        padding: { x: 10, y: 6 },
      })
      .setScrollFactor(0);

    // Health bar
    this.healthBarBg = this.add
      .rectangle(960, 100, 400, 30, 0x000000)
      .setScrollFactor(0);
    this.healthBar = this.add
      .rectangle(760, 100, 400, 26, 0x00ff00)
      .setScrollFactor(0)
      .setOrigin(0, 0.5);

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

    // Player
    this.player = this.physics.add.sprite(200, 1300, "player");
    this.player.setCollideWorldBounds(true);
    this.player.setSize(28, 28);
    this.physics.add.collider(this.player, this.walls);
    this.physics.add.collider(this.player, this.aisles);

    // Camera follows player
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    // Enemies - Grumpy Cashiers patrolling aisles
    this.enemies = this.physics.add.group();
    this.invincible = false;

    // Cashier 1 - patrols aisle 1
    const cashier1 = this.enemies.create(400, 500, "cashier");
    cashier1.setSize(28, 28);
    cashier1.minY = 200;
    cashier1.maxY = 1100;
    cashier1.setVelocityY(80);
    cashier1.health = 3;
    cashier1.enemyType = "cashier";

    // Cashier 2 - patrols aisle 2
    const cashier2 = this.enemies.create(800, 800, "cashier");
    cashier2.setSize(28, 28);
    cashier2.minY = 200;
    cashier2.maxY = 1100;
    cashier2.setVelocityY(-80);
    cashier2.health = 3;
    cashier2.enemyType = "cashier";

    // Cashier 3 - patrols aisle 3
    const cashier3 = this.enemies.create(1400, 400, "cashier");
    cashier3.setSize(28, 28);
    cashier3.minY = 200;
    cashier3.maxY = 1100;
    cashier3.setVelocityY(80);
    cashier3.health = 3;
    cashier3.enemyType = "cashier";

    // Roaming enemies between aisles
    const roamer1 = this.enemies.create(600, 700, "roamer");
    roamer1.setSize(24, 24);
    roamer1.setVelocity(
      Phaser.Math.Between(-80, 80),
      Phaser.Math.Between(-80, 80)
    );
    roamer1.setBounce(1);
    roamer1.health = 2;
    roamer1.enemyType = "roamer";

    const roamer2 = this.enemies.create(1200, 900, "roamer");
    roamer2.setSize(24, 24);
    roamer2.setVelocity(
      Phaser.Math.Between(-80, 80),
      Phaser.Math.Between(-80, 80)
    );
    roamer2.setBounce(1);
    roamer2.health = 2;
    roamer2.enemyType = "roamer";

    this.physics.add.collider(this.enemies, this.walls);
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.hitEnemy,
      null,
      this
    );

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

    // Controls
    this.cursors = this.input.keyboard.createCursorKeys();
    this.attackKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );
    this.canAttack = true;

    this.updateHUD();
  }

  update() {
    // Update health bar
    const healthPercent = inventory.health / inventory.maxHealth;
    this.healthBar.width = 400 * healthPercent;
    this.healthBar.fillColor =
      healthPercent > 0.5
        ? 0x00ff00
        : healthPercent > 0.25
        ? 0xffff00
        : 0xff0000;

    // Check for game over
    if (inventory.health <= 0) {
      this.gameOver();
      return;
    }

    // 4-directional movement
    const speed = 200;
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    }

    // Normalize diagonal movement
    if (
      this.player.body.velocity.x !== 0 &&
      this.player.body.velocity.y !== 0
    ) {
      this.player.setVelocity(
        this.player.body.velocity.x * 0.707,
        this.player.body.velocity.y * 0.707
      );
    }

    // Enemy patrol logic
    this.enemies.children.entries.forEach((enemy) => {
      if (enemy.active) {
        // Cashier vertical patrol
        if (enemy.enemyType === "cashier") {
          if (enemy.y >= enemy.maxY) {
            enemy.setVelocityY(-80);
          } else if (enemy.y <= enemy.minY) {
            enemy.setVelocityY(80);
          }
        }
        // Roamer random movement
        else if (
          enemy.enemyType === "roamer" &&
          Phaser.Math.Between(0, 100) < 2
        ) {
          const angle = (Phaser.Math.Between(0, 360) * Math.PI) / 180;
          enemy.setVelocity(Math.cos(angle) * 80, Math.sin(angle) * 80);
        }
      }
    });

    // Attack with bong
    if (Phaser.Input.Keyboard.JustDown(this.attackKey) && this.canAttack) {
      this.attack();
    }
  }

  attack() {
    this.canAttack = false;

    // Create attack hitbox
    const attackRange = 50;
    const attackBox = this.add.rectangle(
      this.player.x,
      this.player.y,
      attackRange,
      attackRange,
      0xffffff,
      0
    );
    this.physics.add.existing(attackBox);

    // Visual effect
    const effect = this.add.sprite(
      this.player.x,
      this.player.y,
      "attack_effect"
    );
    effect.setScale(1.5);
    effect.setAlpha(0.8);

    // Check for enemy hits
    this.enemies.children.entries.forEach((enemy) => {
      if (enemy.active) {
        const dist = Phaser.Math.Distance.Between(
          this.player.x,
          this.player.y,
          enemy.x,
          enemy.y
        );
        if (dist < attackRange) {
          enemy.health--;
          enemy.setTint(0xff0000);
          this.time.delayedCall(200, () => enemy.clearTint());

          if (enemy.health <= 0) {
            enemy.destroy();
            const msg = this.add
              .text(enemy.x, enemy.y - 30, "+2HP", {
                fontSize: "18px",
                fill: "#00ff00",
                fontFamily: "Courier New",
                fontStyle: "bold",
              })
              .setOrigin(0.5);
            inventory.heal(2);
            this.updateHUD();
            this.time.delayedCall(1000, () => msg.destroy());
          }
        }
      }
    });

    // Clean up
    this.time.delayedCall(200, () => {
      attackBox.destroy();
      effect.destroy();
      this.time.delayedCall(300, () => {
        this.canAttack = true;
      });
    });
  }

  hitEnemy(player, enemy) {
    if (!this.invincible) {
      inventory.takeDamage(10);
      inventory.addMoney(-2);
      this.updateHUD();

      // Flash player
      this.player.setTint(0xff0000);
      this.invincible = true;

      this.time.delayedCall(1000, () => {
        this.player.clearTint();
        this.invincible = false;
      });

      const msg = this.add
        .text(player.x, player.y - 50, "-10HP, -$2!", {
          fontSize: "20px",
          fill: "#ff0000",
          fontFamily: "Courier New",
          fontStyle: "bold",
        })
        .setOrigin(0.5);

      this.time.delayedCall(1500, () => msg.destroy());
    }
  }

  buyPapers(player, papers) {
    if (inventory.money >= 5 && !inventory.hasPapers) {
      papers.destroy();
      inventory.addMoney(-5);
      inventory.hasPapers = true;
      this.updateHUD();

      const msg = this.add
        .text(player.x, player.y - 50, "Got PAPERS! (-$5)", {
          fontSize: "24px",
          fill: "#00ff00",
          fontFamily: "Courier New",
          fontStyle: "bold",
        })
        .setOrigin(0.5);

      this.time.delayedCall(2000, () => msg.destroy());
    } else if (inventory.money < 5) {
      const msg = this.add
        .text(player.x, player.y - 50, `Need $${5 - inventory.money} more!`, {
          fontSize: "20px",
          fill: "#ff0000",
          fontFamily: "Courier New",
          backgroundColor: "#ffffff",
          padding: { x: 6, y: 4 },
        })
        .setOrigin(0.5);

      this.time.delayedCall(1500, () => msg.destroy());
    }
  }

  exitLevel() {
    if (inventory.hasPapers) {
      this.scene.start("Level3Scene");
    } else {
      const msg = this.add
        .text(this.player.x, this.player.y - 50, "Need PAPERS first!", {
          fontSize: "20px",
          fill: "#ff0000",
          fontFamily: "Courier New",
          backgroundColor: "#ffffff",
          padding: { x: 6, y: 4 },
        })
        .setOrigin(0.5);

      this.time.delayedCall(2000, () => msg.destroy());
    }
  }

  updateHUD() {
    const items = [];
    if (inventory.hasLighter) items.push("🔥 Lighter");
    if (inventory.hasPapers) items.push("📄 Papers");
    if (inventory.hasDoobie) items.push("🌿 Doobie");

    this.hudText.setText(
      `💰 $${inventory.money} | ❤️ ${inventory.health}HP | ${
        items.join(" | ") || "No items"
      }`
    );
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
