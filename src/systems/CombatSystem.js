/**
 * CombatSystem - Handles player attacks, projectiles, and combat mechanics
 */
export class CombatSystem {
  constructor(scene, player, enemyManager) {
    this.scene = scene;
    this.player = player;
    this.enemyManager = enemyManager;

    this.canAttack = true;
    this.canThrow = true;
    this.bongThrown = null;
  }

  /**
   * Update combat system (check bong projectile)
   */
  update() {
    this.updateBongProjectile();
  }

  /**
   * Perform melee attack
   */
  attack() {
    if (!this.canAttack) return;

    this.canAttack = false;
    const { scene, player } = this;

    // Play attack animation
    player.playAnimation("player_attack_1", true);
    player.sprite.once("animationcomplete", () => {
      if (player.sprite && player.sprite.active) {
        player.playAnimation("player_idle", true);
      }
    });

    // Create attack hitbox
    const attackDist = 40;
    let attackX = player.sprite.x;
    let attackY = player.sprite.y;

    const dir = player.lastDirection;
    if (dir === "up") attackY -= attackDist;
    else if (dir === "down") attackY += attackDist;
    else if (dir === "left") attackX -= attackDist;
    else if (dir === "right") attackX += attackDist;

    const attackBox = scene.add.rectangle(
      attackX,
      attackY,
      50,
      50,
      0xffffff,
      0
    );
    scene.physics.add.existing(attackBox);
    attackBox.setDepth(10);

    // Attack effect
    let effectX = player.sprite.x;
    const effectY = player.sprite.y;

    if (dir === "left") effectX -= 40;
    else if (dir === "right") effectX += 40;

    const effect = scene.add.image(effectX, effectY, "attack_effect");
    effect.setDepth(15).setScale(0.5).setAlpha(0.8);

    // Animate effect
    scene.tweens.add({
      targets: effect,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: 200,
      ease: "Cubic.easeOut",
      onComplete: () => effect.destroy(),
    });

    // Check enemy hits
    scene.enemies.children.entries.forEach((enemy) => {
      if (enemy.active) {
        const dist = Phaser.Math.Distance.Between(
          attackX,
          attackY,
          enemy.x,
          enemy.y
        );
        if (dist < 40) {
          this.enemyManager.damageEnemy(enemy, 1);
        }
      }
    });

    // Cleanup
    scene.time.delayedCall(150, () => {
      attackBox.destroy();
      scene.time.delayedCall(200, () => {
        this.canAttack = true;
      });
    });
  }

  /**
   * Throw boomerang projectile
   */
  throwBong() {
    if (!this.canThrow || this.bongThrown) return;

    this.canThrow = false;
    const { scene, player } = this;

    // Calculate velocity based on direction
    const speed = 300;
    let vx = 0,
      vy = 0;

    const dir = player.lastDirection;
    if (dir === "up") vy = -speed;
    else if (dir === "down") vy = speed;
    else if (dir === "left") vx = -speed;
    else if (dir === "right") vx = speed;

    // Create projectile
    this.bongThrown = scene.physics.add.sprite(
      player.sprite.x,
      player.sprite.y,
      "bong_sprite"
    );
    this.bongThrown.setScale(0.06);
    this.bongThrown.setVelocity(vx, vy);
    this.bongThrown.setDepth(10);
    this.bongThrown.startX = player.sprite.x;
    this.bongThrown.startY = player.sprite.y;
    this.bongThrown.returning = false;

    // Spinning animation
    scene.tweens.add({
      targets: this.bongThrown,
      angle: 360,
      duration: 800,
      repeat: -1,
      ease: "Linear",
    });

    // Add collision with walls/obstacles
    scene.physics.add.collider(this.bongThrown, scene.walls, () => {
      if (this.bongThrown) this.bongThrown.returning = true;
    });
    scene.physics.add.collider(this.bongThrown, scene.obstacles, () => {
      if (this.bongThrown) this.bongThrown.returning = true;
    });
  }

  /**
   * Update boomerang projectile behavior
   */
  updateBongProjectile() {
    if (!this.bongThrown || !this.bongThrown.active) return;

    const { scene, player } = this;
    this.bongThrown.angle += 15;

    // Return after distance
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
      scene.physics.moveToObject(this.bongThrown, player.sprite, 250);

      // Collect when returns
      const distToPlayer = Phaser.Math.Distance.Between(
        player.sprite.x,
        player.sprite.y,
        this.bongThrown.x,
        this.bongThrown.y
      );

      if (distToPlayer < 30) {
        this.bongThrown.destroy();
        this.bongThrown = null;
        this.canThrow = true;
      }
    }

    // Check hits
    scene.enemies.children.entries.forEach((enemy) => {
      if (enemy.active && this.bongThrown && this.bongThrown.active) {
        const dist = Phaser.Math.Distance.Between(
          this.bongThrown.x,
          this.bongThrown.y,
          enemy.x,
          enemy.y
        );
        if (dist < 30 && !enemy.hitByBong) {
          this.enemyManager.damageEnemy(enemy, 1);
          enemy.hitByBong = true;
          scene.time.delayedCall(500, () => {
            if (enemy.active) enemy.hitByBong = false;
          });
        }
      }
    });
  }

  /**
   * Check if attack button pressed
   */
  isAttackPressed(attackKey, gamepad) {
    return (
      Phaser.Input.Keyboard.JustDown(attackKey) ||
      (gamepad && gamepad.A && Phaser.Input.Gamepad.JustDown(gamepad.A))
    );
  }

  /**
   * Check if throw button pressed
   */
  isThrowPressed(throwKey, gamepad) {
    return (
      Phaser.Input.Keyboard.JustDown(throwKey) ||
      (gamepad && gamepad.B && Phaser.Input.Gamepad.JustDown(gamepad.B))
    );
  }
}
