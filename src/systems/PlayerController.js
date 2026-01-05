/**
 * PlayerController - Manages player movement, input, and state
 */
export class PlayerController {
  constructor(scene, x, y) {
    this.scene = scene;
    this.lastDirection = "down";
    this.speed = 230;

    // Create player sprite
    this.sprite = scene.physics.add.sprite(x, y, "player");
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setSize(34, 64);
    this.sprite.setOffset(48, 64);
    this.sprite.setDepth(10);
    this.sprite.setScale(1);
    this.sprite.play("player_idle");

    // Setup controls
    this.setupControls();
  }

  setupControls() {
    // WASD controls
    this.wasd = {
      up: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };

    // Arrow keys
    this.cursors = this.scene.input.keyboard.createCursorKeys();

    // Gamepad support
    this.scene.input.gamepad.once("connected", (pad) => {
      this.gamepad = pad;
    });
  }

  update() {
    this.sprite.setVelocity(0);

    let moveX = 0;
    let moveY = 0;

    // Keyboard input
    if (this.cursors.left.isDown || this.wasd.left.isDown) moveX = -1;
    else if (this.cursors.right.isDown || this.wasd.right.isDown) moveX = 1;

    if (this.cursors.up.isDown || this.wasd.up.isDown) moveY = -1;
    else if (this.cursors.down.isDown || this.wasd.down.isDown) moveY = 1;

    // Gamepad input
    if (this.gamepad) {
      const leftStick = this.gamepad.leftStick;
      if (Math.abs(leftStick.x) > 0.2) moveX = leftStick.x;
      if (Math.abs(leftStick.y) > 0.2) moveY = leftStick.y;
    }

    // Apply movement
    if (moveX !== 0 || moveY !== 0) {
      const angle = Math.atan2(moveY, moveX);
      this.sprite.setVelocity(
        Math.cos(angle) * this.speed,
        Math.sin(angle) * this.speed
      );

      // Update direction
      if (Math.abs(moveX) > Math.abs(moveY)) {
        this.lastDirection = moveX > 0 ? "right" : "left";
      } else {
        this.lastDirection = moveY > 0 ? "down" : "up";
      }

      // Play walk animation if not attacking
      const currentAnim = this.sprite.anims.currentAnim;
      if (currentAnim && !currentAnim.key.includes("attack")) {
        if (currentAnim.key !== "player_walk") {
          this.sprite.play("player_walk", true);
        }
      }

      // Flip sprite for horizontal movement
      if (this.lastDirection === "left") {
        this.sprite.setFlipX(true);
      } else if (this.lastDirection === "right") {
        this.sprite.setFlipX(false);
      }
    } else {
      // Play idle animation if not attacking
      const currentAnim = this.sprite.anims.currentAnim;
      if (currentAnim && !currentAnim.key.includes("attack")) {
        if (currentAnim.key !== "player_idle") {
          this.sprite.play("player_idle", true);
        }
      }
    }
  }

  setPosition(x, y) {
    this.sprite.setPosition(x, y);
  }

  getPosition() {
    return { x: this.sprite.x, y: this.sprite.y };
  }

  setTint(color) {
    this.sprite.setTint(color);
  }

  clearTint() {
    this.sprite.clearTint();
  }

  playAnimation(animKey, ignoreIfPlaying = false) {
    this.sprite.play(animKey, ignoreIfPlaying);
  }

  destroy() {
    this.sprite.destroy();
  }
}
