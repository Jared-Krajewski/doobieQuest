/**
 * GameEffects - Reusable visual effects for game events
 */
export class GameEffects {
  /**
   * Create sparkle effect
   */
  static createSparkle(scene, x, y, color = 0xffff00, duration = 300) {
    const sparkle = scene.add.circle(x, y, 20, color, 0.8);
    sparkle.setDepth(50);

    scene.tweens.add({
      targets: sparkle,
      scaleX: 2,
      scaleY: 2,
      alpha: 0,
      duration,
      onComplete: () => sparkle.destroy(),
    });

    return sparkle;
  }

  /**
   * Create floating text
   */
  static createFloatingText(scene, x, y, text, config = {}) {
    const defaultConfig = {
      fontSize: "16px",
      fill: "#ffff00",
      fontStyle: "bold",
      stroke: "#000000",
      strokeThickness: 2,
    };

    const finalConfig = { ...defaultConfig, ...config };

    const floatText = scene.add
      .text(x, y, text, finalConfig)
      .setOrigin(0.5)
      .setDepth(51);

    scene.tweens.add({
      targets: floatText,
      y: y - 40,
      alpha: 0,
      duration: 800,
      onComplete: () => floatText.destroy(),
    });

    return floatText;
  }

  /**
   * Create damage flash effect
   */
  static createDamageFlash(scene, target, duration = 1000) {
    target.setTint(0xff0000);

    scene.time.delayedCall(duration, () => {
      if (target.active) target.clearTint();
    });
  }

  /**
   * Create pulsing animation
   */
  static createPulse(scene, target, scale = 1.1, duration = 800) {
    scene.tweens.add({
      targets: target,
      scaleX: scale,
      scaleY: scale,
      duration,
      yoyo: true,
      repeat: -1,
    });
  }

  /**
   * Create bobbing animation
   */
  static createBob(scene, target, distance = 10, duration = 800) {
    const startY = target.y;
    scene.tweens.add({
      targets: target,
      y: startY - distance,
      duration,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  /**
   * Create spinning animation
   */
  static createSpin(scene, target, duration = 2000) {
    scene.tweens.add({
      targets: target,
      angle: 360,
      duration,
      repeat: -1,
    });
  }
}
