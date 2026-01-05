import { inventory } from "../inventory.js";

/**
 * SimpleHUD
 *
 * Manages basic HUD display for linear levels (Level2 & Level3).
 * Shows health bar, money, and items.
 */
export class SimpleHUD {
  constructor(scene, config = {}) {
    this.scene = scene;

    // HUD text
    this.hudText = scene.add
      .text(20, 20, "", {
        fontSize: "20px",
        fill: config.textColor || "#000000",
        fontFamily: "Courier New",
        backgroundColor: config.bgColor || "#ffffff",
        padding: { x: 10, y: 6 },
      })
      .setScrollFactor(0);

    // Health bar background
    this.healthBarBg = scene.add
      .rectangle(960, 100, 400, 30, 0x000000)
      .setScrollFactor(0);

    // Health bar (fills based on health)
    this.healthBar = scene.add
      .rectangle(760, 100, 400, 26, 0x00ff00)
      .setScrollFactor(0)
      .setOrigin(0, 0.5);

    this.update();
  }

  /**
   * Update HUD to reflect current inventory state
   */
  update() {
    const items = [];
    if (inventory.hasLighter) items.push("🔥 Lighter");
    if (inventory.hasPapers) items.push("📄 Papers");
    if (inventory.hasDoobie) items.push("🌿 Doobie");

    this.hudText.setText(
      `💰 $${inventory.money} | ❤️ ${inventory.health}HP | ${
        items.join(" | ") || "No items"
      }`
    );

    // Update health bar
    const healthPercent = inventory.health / inventory.maxHealth;
    this.healthBar.width = 400 * healthPercent;
    this.healthBar.fillColor =
      healthPercent > 0.5
        ? 0x00ff00
        : healthPercent > 0.25
        ? 0xffff00
        : 0xff0000;
  }

  /**
   * Show temporary message above player
   */
  showMessage(x, y, text, config = {}) {
    const msg = this.scene.add
      .text(x, y, text, {
        fontSize: config.fontSize || "20px",
        fill: config.color || "#ffffff",
        fontFamily: "Courier New",
        fontStyle: config.fontStyle || "normal",
        backgroundColor: config.backgroundColor || "transparent",
        padding: config.padding || { x: 0, y: 0 },
      })
      .setOrigin(0.5);

    this.scene.time.delayedCall(config.duration || 1500, () => msg.destroy());
    return msg;
  }
}
