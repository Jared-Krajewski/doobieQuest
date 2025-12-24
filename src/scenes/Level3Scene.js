import Phaser from "phaser";
import { inventory } from "../inventory.js";

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

    // HUD
    this.hudText = this.add
      .text(20, 20, "", {
        fontSize: "20px",
        fill: "#ffffff",
        fontFamily: "Courier New",
        backgroundColor: "#000000",
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

    // Player
    this.player = this.physics.add.sprite(1000, 1500, "player");
    this.player.setCollideWorldBounds(true);
    this.player.setSize(28, 28);
    this.physics.add.collider(this.player, this.walls);
    this.physics.add.collider(this.player, this.obstacles);

    // Camera follows player
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    // Police enemies patrolling the alley
    this.police = this.physics.add.group();
    this.invincible = false;

    // Officer 1 - horizontal patrol left area
    const cop1 = this.police.create(400, 600, "police");
    cop1.setSize(28, 28);
    cop1.minX = 250;
    cop1.maxX = 700;
    cop1.setVelocityX(100);
    cop1.health = 4;
    cop1.enemyType = "police";

    // Officer 2 - vertical patrol center
    const cop2 = this.police.create(1000, 800, "police");
    cop2.setSize(28, 28);
    cop2.minY = 400;
    cop2.maxY = 1200;
    cop2.setVelocityY(-100);
    cop2.health = 4;
    cop2.enemyType = "police";

    // Officer 3 - horizontal patrol right area
    const cop3 = this.police.create(1600, 1000, "police");
    cop3.setSize(28, 28);
    cop3.minX = 1300;
    cop3.maxX = 1750;
    cop3.setVelocityX(-100);
    cop3.health = 4;
    cop3.enemyType = "police";

    // Roaming enemies (alley creatures)
    const roamer1 = this.police.create(700, 900, "roamer");
    roamer1.setSize(24, 24);
    roamer1.setVelocity(
      Phaser.Math.Between(-80, 80),
      Phaser.Math.Between(-80, 80)
    );
    roamer1.setBounce(1);
    roamer1.health = 2;
    roamer1.enemyType = "roamer";

    const roamer2 = this.police.create(1300, 700, "roamer");
    roamer2.setSize(24, 24);
    roamer2.setVelocity(
      Phaser.Math.Between(-80, 80),
      Phaser.Math.Between(-80, 80)
    );
    roamer2.setBounce(1);
    roamer2.health = 2;
    roamer2.enemyType = "roamer";

    this.physics.add.collider(this.police, this.walls);
    this.physics.add.collider(this.police, this.obstacles);
    this.physics.add.overlap(
      this.player,
      this.police,
      this.hitPolice,
      null,
      this
    );

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

    // Police patrol logic
    this.police.children.entries.forEach((cop) => {
      if (cop.active) {
        // Police patrol patterns
        if (cop.enemyType === "police") {
          // Horizontal patrol
          if (cop.minX !== undefined) {
            if (cop.x >= cop.maxX) {
              cop.setVelocityX(-100);
            } else if (cop.x <= cop.minX) {
              cop.setVelocityX(100);
            }
          }
          // Vertical patrol
          if (cop.minY !== undefined) {
            if (cop.y >= cop.maxY) {
              cop.setVelocityY(-100);
            } else if (cop.y <= cop.minY) {
              cop.setVelocityY(100);
            }
          }
        }
        // Roamer random movement
        else if (
          cop.enemyType === "roamer" &&
          Phaser.Math.Between(0, 100) < 2
        ) {
          const angle = (Phaser.Math.Between(0, 360) * Math.PI) / 180;
          cop.setVelocity(Math.cos(angle) * 80, Math.sin(angle) * 80);
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
    this.police.children.entries.forEach((cop) => {
      if (cop.active) {
        const dist = Phaser.Math.Distance.Between(
          this.player.x,
          this.player.y,
          cop.x,
          cop.y
        );
        if (dist < attackRange) {
          cop.health--;
          cop.setTint(0xff0000);
          this.time.delayedCall(200, () => cop.clearTint());

          if (cop.health <= 0) {
            cop.destroy();
            const msg = this.add
              .text(cop.x, cop.y - 30, "+3HP", {
                fontSize: "18px",
                fill: "#00ff00",
                fontFamily: "Courier New",
                fontStyle: "bold",
              })
              .setOrigin(0.5);
            inventory.heal(3);
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

  hitPolice(player, cop) {
    if (!this.invincible) {
      inventory.takeDamage(20);
      this.updateHUD();

      // Flash player
      this.player.setTint(0xff0000);
      this.invincible = true;

      this.time.delayedCall(1000, () => {
        this.player.clearTint();
        this.invincible = false;
      });

      const msg = this.add
        .text(player.x, player.y - 50, "-20HP!", {
          fontSize: "24px",
          fill: "#ff0000",
          fontFamily: "Courier New",
          fontStyle: "bold",
        })
        .setOrigin(0.5);

      this.time.delayedCall(1500, () => msg.destroy());
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
      this.updateHUD();

      const doobie = this.physics.add.sprite(dealer.x, dealer.y, "doobie");
      doobie.setSize(24, 24);
      this.physics.add.overlap(
        player,
        doobie,
        () => {
          doobie.destroy();
          inventory.hasDoobie = true;
          this.updateHUD();
          this.winGame();
        },
        null,
        this
      );

      const msg = this.add
        .text(dealer.x, dealer.y - 80, '"Here ya go, enjoy!"\n-$5', {
          fontSize: "20px",
          fill: "#00ff00",
          fontFamily: "Courier New",
          align: "center",
          fontStyle: "bold",
        })
        .setOrigin(0.5);

      this.time.delayedCall(3000, () => msg.destroy());
    } else if (!hasAllItems) {
      const missing = [];
      if (inventory.money < 5) missing.push(`$${5 - inventory.money}`);
      if (!inventory.hasLighter) missing.push("LIGHTER");
      if (!inventory.hasPapers) missing.push("PAPERS");

      const msg = this.add
        .text(dealer.x, dealer.y - 60, `Need: ${missing.join(", ")}`, {
          fontSize: "18px",
          fill: "#ff0000",
          fontFamily: "Courier New",
          backgroundColor: "#000000",
          padding: { x: 6, y: 4 },
        })
        .setOrigin(0.5);

      this.time.delayedCall(2000, () => msg.destroy());
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
