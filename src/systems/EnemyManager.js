/**
 * EnemyManager - Manages enemy AI behavior and updates
 */
export class EnemyManager {
  constructor(scene) {
    this.scene = scene;
  }

  /**
   * Update all enemies in the group
   */
  update(enemies, player, projectiles) {
    if (!enemies) return;

    enemies.children.entries.forEach((enemy) => {
      if (!enemy.active) return;

      this.keepInBounds(enemy);

      if (enemy.enemyType === "roamer") {
        this.updateRoamer(enemy);
      } else if (enemy.enemyType === "shooter") {
        this.updateShooter(enemy, player, projectiles);
      }
    });
  }

  /**
   * Keep enemy within room bounds
   */
  keepInBounds(enemy) {
    const margin = 60;
    const { roomWidth, roomHeight } = this.scene;

    if (
      enemy.x < margin ||
      enemy.x > roomWidth - margin ||
      enemy.y < 150 ||
      enemy.y > roomHeight - margin - 50
    ) {
      // Bounce back toward center
      const toCenterX = roomWidth / 2 - enemy.x;
      const toCenterY = roomHeight / 2 - enemy.y;
      const angle = Math.atan2(toCenterY, toCenterX);

      if (enemy.enemyType === "roamer") {
        enemy.setVelocity(Math.cos(angle) * 60, Math.sin(angle) * 60);
      }
    }
  }

  /**
   * Update roaming enemy behavior
   */
  updateRoamer(enemy) {
    // Random direction changes
    if (Phaser.Math.Between(0, 100) < 2) {
      const angle = Phaser.Math.Between(0, 360) * (Math.PI / 180);
      enemy.setVelocity(Math.cos(angle) * 60, Math.sin(angle) * 60);
    }

    // Face movement direction
    if (enemy.body && enemy.body.velocity && enemy.anims) {
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
  }

  /**
   * Update shooter enemy behavior
   */
  updateShooter(enemy, player, projectiles) {
    const now = this.scene.time.now;

    // Continuous roaming
    if (now > enemy.roamChangeTime) {
      enemy.roamAngle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      enemy.roamChangeTime = now + Phaser.Math.Between(1500, 3000);
    }

    const vx = Math.cos(enemy.roamAngle) * enemy.roamSpeed;
    const vy = Math.sin(enemy.roamAngle) * enemy.roamSpeed;
    enemy.setVelocity(vx, vy);

    // Face movement direction (avoid flicker at vx near 0)
    if (Math.abs(vx) > 5) {
      enemy.setFlipX(vx < 0);
    }

    // Keep walk animation running
    enemy.play("police_walk", true);

    // Shoot periodically
    const timeSinceLastShot = now - (enemy.lastShot || 0);
    if (timeSinceLastShot > 2000) {
      this.shootAtPlayer(enemy, player, projectiles);
    }
  }

  /**
   * Make enemy shoot projectile at player
   */
  shootAtPlayer(enemy, player, projectiles) {
    enemy.lastShot = this.scene.time.now;

    // Play shoot animation
    enemy.play("police_shoot", true);

    // Return to walk animation after shooting
    enemy.once("animationcomplete", () => {
      if (enemy.active && enemy.health > 0) {
        enemy.play("police_walk", true);
      }
    });

    // Create projectile
    const projectile = projectiles.create(enemy.x, enemy.y, "projectile");
    projectile.setScale(0.8);

    const angle = Phaser.Math.Angle.Between(
      enemy.x,
      enemy.y,
      player.x,
      player.y
    );

    const speed = 120;
    projectile.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
  }

  /**
   * Create roaming enemy
   */
  createRoamer(x, y, spriteKey, health, scale = 1.2) {
    const { enemies } = this.scene;
    const enemy = enemies.create(x, y, spriteKey);

    enemy.setScale(scale);
    enemy.setSize(20, 14);
    enemy.setOffset(6, 26);

    if (enemy.anims) {
      enemy.play("dog_walk", true);
    }

    enemy.setBounce(1);
    enemy.health = health;
    enemy.enemyType = "roamer";

    // Random initial velocity
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const speed = Phaser.Math.Between(40, 70);
    enemy.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);

    return enemy;
  }

  /**
   * Create shooter enemy
   */
  createShooter(x, y, health, scale = 1.5) {
    const { enemies } = this.scene;
    const enemy = enemies.create(x, y, "police");

    enemy.setScale(scale);
    enemy.setSize(21, 26);
    enemy.setOffset(3, 3);
    enemy.health = health;
    enemy.enemyType = "shooter";
    enemy.lastShot = 0;
    enemy.roamSpeed = Phaser.Math.Between(30, 50);
    enemy.roamAngle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    enemy.roamChangeTime =
      this.scene.time.now + Phaser.Math.Between(1000, 2000);
    enemy.play("police_walk", true);

    return enemy;
  }

  /**
   * Damage an enemy
   */
  damageEnemy(enemy, damage) {
    enemy.health -= damage;
    enemy.setTint(0xff0000);

    this.scene.time.delayedCall(200, () => {
      if (enemy.active) enemy.clearTint();
    });

    if (enemy.health <= 0) {
      this.killEnemy(enemy);
    }
  }

  /**
   * Kill enemy and drop loot
   */
  killEnemy(enemy) {
    const { items } = this.scene;

    // Drop heart
    const heart = items.create(enemy.x, enemy.y, "heart");
    heart.itemType = "heart";
    heart.value = 1;
    heart.setDepth(5);

    // Death animation for police
    if (enemy.enemyType === "shooter" && enemy.texture.key === "police") {
      enemy.play("police_dead");
      enemy.setVelocity(0, 0);

      this.scene.tweens.add({
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
