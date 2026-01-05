/**
 * SimplePlayerController
 *
 * Handles basic 4-directional player movement and input for linear levels (Level2 & Level3).
 * Simpler than the main PlayerController since these levels don't have complex mechanics.
 */
export class SimplePlayerController {
  constructor(scene, x, y) {
    this.scene = scene;
    this.sprite = scene.physics.add.sprite(x, y, "player");
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setSize(28, 28);

    this.speed = 200;
    this.cursors = scene.input.keyboard.createCursorKeys();
  }

  /**
   * Update player movement based on keyboard input
   */
  update() {
    this.sprite.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.sprite.setVelocityX(-this.speed);
    } else if (this.cursors.right.isDown) {
      this.sprite.setVelocityX(this.speed);
    }

    if (this.cursors.up.isDown) {
      this.sprite.setVelocityY(-this.speed);
    } else if (this.cursors.down.isDown) {
      this.sprite.setVelocityY(this.speed);
    }

    // Normalize diagonal movement
    if (
      this.sprite.body.velocity.x !== 0 &&
      this.sprite.body.velocity.y !== 0
    ) {
      this.sprite.setVelocity(
        this.sprite.body.velocity.x * 0.707,
        this.sprite.body.velocity.y * 0.707
      );
    }
  }

  /**
   * Flash player with red tint (damage effect)
   */
  flashDamage(callback) {
    this.sprite.setTint(0xff0000);
    this.scene.time.delayedCall(1000, () => {
      this.sprite.clearTint();
      if (callback) callback();
    });
  }
}
