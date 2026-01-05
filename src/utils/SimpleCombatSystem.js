/**
 * SimpleCombatSystem
 *
 * Handles basic melee combat for linear levels (Level2 & Level3).
 * Simple attack with hitbox and visual effect.
 */
export class SimpleCombatSystem {
  constructor(scene, enemyManager) {
    this.scene = scene;
    this.enemyManager = enemyManager;
    this.canAttack = true;

    // Setup attack input
    this.attackKey = scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );
  }

  /**
   * Update combat system (check for attack input)
   */
  update() {
    if (Phaser.Input.Keyboard.JustDown(this.attackKey) && this.canAttack) {
      this.attack();
    }
  }

  /**
   * Perform attack with hitbox and check for enemy hits
   */
  attack() {
    this.canAttack = false;

    const player = this.scene.player;
    const attackRange = 50;

    // Create attack hitbox
    const attackBox = this.scene.add.rectangle(
      player.x,
      player.y,
      attackRange,
      attackRange,
      0xffffff,
      0
    );
    this.scene.physics.add.existing(attackBox);

    // Visual effect
    const effect = this.scene.add.sprite(player.x, player.y, "attack_effect");
    effect.setScale(1.5);
    effect.setAlpha(0.8);

    // Check for enemy hits
    this.checkAttackHits(player, attackRange);

    // Clean up
    this.scene.time.delayedCall(200, () => {
      attackBox.destroy();
      effect.destroy();
      this.scene.time.delayedCall(300, () => {
        this.canAttack = true;
      });
    });
  }

  /**
   * Check if attack hits any enemies and apply damage
   */
  checkAttackHits(player, attackRange) {
    const enemyGroup = this.scene.enemies;

    enemyGroup.children.entries.forEach((enemy) => {
      if (enemy.active) {
        const dist = Phaser.Math.Distance.Between(
          player.x,
          player.y,
          enemy.x,
          enemy.y
        );

        if (dist < attackRange) {
          this.enemyManager.damageEnemy(
            enemy,
            1,
            this.getHealAmount(),
            (x, y, heal) => {
              this.showEnemyDefeatEffect(x, y, heal);
            }
          );
        }
      }
    });
  }

  /**
   * Get heal amount based on level (can be overridden)
   */
  getHealAmount() {
    return 2; // Default heal amount
  }

  /**
   * Show visual effect when enemy is defeated
   */
  showEnemyDefeatEffect(x, y, healAmount) {
    const inventory = this.scene.registry.get("inventory") || window.inventory;
    inventory.heal(healAmount);
    this.scene.hud.update();

    const msg = this.scene.add
      .text(x, y - 30, `+${healAmount}HP`, {
        fontSize: "18px",
        fill: "#00ff00",
        fontFamily: "Courier New",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.scene.time.delayedCall(1000, () => msg.destroy());
  }
}
