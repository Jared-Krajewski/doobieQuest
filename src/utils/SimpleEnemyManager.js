/**
 * SimpleEnemyManager
 *
 * Manages simple enemy AI with patrol and roaming behaviors.
 * Used for Level2 and Level3 linear gameplay.
 */
export class SimpleEnemyManager {
  constructor(scene) {
    this.scene = scene;
  }

  /**
   * Create a vertical patrol enemy (e.g., cashier in aisle)
   */
  createVerticalPatroller(group, x, y, sprite, minY, maxY, speed, health) {
    const enemy = group.create(x, y, sprite);
    enemy.setSize(28, 28);
    enemy.minY = minY;
    enemy.maxY = maxY;
    enemy.setVelocityY(speed);
    enemy.health = health;
    enemy.enemyType = "vertical_patrol";
    return enemy;
  }

  /**
   * Create a horizontal patrol enemy (e.g., police officer)
   */
  createHorizontalPatroller(group, x, y, sprite, minX, maxX, speed, health) {
    const enemy = group.create(x, y, sprite);
    enemy.setSize(28, 28);
    enemy.minX = minX;
    enemy.maxX = maxX;
    enemy.setVelocityX(speed);
    enemy.health = health;
    enemy.enemyType = "horizontal_patrol";
    return enemy;
  }

  /**
   * Create a roaming enemy that bounces off obstacles
   */
  createRoamer(group, x, y, sprite, health) {
    const enemy = group.create(x, y, sprite);
    enemy.setSize(24, 24);
    enemy.setVelocity(
      Phaser.Math.Between(-80, 80),
      Phaser.Math.Between(-80, 80)
    );
    enemy.setBounce(1);
    enemy.health = health;
    enemy.enemyType = "roamer";
    return enemy;
  }

  /**
   * Update all enemies' AI behaviors
   */
  update(enemyGroup) {
    enemyGroup.children.entries.forEach((enemy) => {
      if (!enemy.active) return;

      // Vertical patrol logic
      if (enemy.enemyType === "vertical_patrol") {
        if (enemy.y >= enemy.maxY) {
          enemy.setVelocityY(-Math.abs(enemy.body.velocity.y));
        } else if (enemy.y <= enemy.minY) {
          enemy.setVelocityY(Math.abs(enemy.body.velocity.y));
        }
      }
      // Horizontal patrol logic
      else if (enemy.enemyType === "horizontal_patrol") {
        if (enemy.x >= enemy.maxX) {
          enemy.setVelocityX(-Math.abs(enemy.body.velocity.x));
        } else if (enemy.x <= enemy.minX) {
          enemy.setVelocityX(Math.abs(enemy.body.velocity.x));
        }
      }
      // Roamer random direction changes
      else if (
        enemy.enemyType === "roamer" &&
        Phaser.Math.Between(0, 100) < 2
      ) {
        const angle = (Phaser.Math.Between(0, 360) * Math.PI) / 180;
        enemy.setVelocity(Math.cos(angle) * 80, Math.sin(angle) * 80);
      }
    });
  }

  /**
   * Damage an enemy and handle death
   */
  damageEnemy(enemy, damage, healAmount, onDeath) {
    if (!enemy.active) return false;

    enemy.health -= damage;
    enemy.setTint(0xff0000);

    this.scene.time.delayedCall(200, () => {
      if (enemy.active) enemy.clearTint();
    });

    if (enemy.health <= 0) {
      enemy.destroy();
      if (onDeath) onDeath(enemy.x, enemy.y, healAmount);
      return true;
    }
    return false;
  }
}
