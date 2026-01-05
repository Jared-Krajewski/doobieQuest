import { inventory } from "../inventory.js";

/**
 * HUDManager - Manages all HUD elements and updates
 */
export class HUDManager {
  constructor(scene) {
    this.scene = scene;
    this.createHUD();
  }

  createHUD() {
    const scene = this.scene;

    // HUD Background
    scene.add
      .rectangle(640, 30, 1260, 50, 0x000000, 0.8)
      .setScrollFactor(0)
      .setDepth(100);

    // Hearts
    this.heartContainers = [];
    for (let i = 0; i < inventory.maxHealth; i++) {
      const heart = scene.add
        .image(30 + i * 40, 30, "heart")
        .setScrollFactor(0)
        .setDepth(101)
        .setScale(0.8);
      this.heartContainers.push(heart);
    }

    // Lives display
    this.livesText = scene.add
      .text(280, 30, `LIVES: ${inventory.lives}`, {
        fontSize: "24px",
        fill: "#ffffff",
        fontFamily: "Courier New",
        fontStyle: "bold",
      })
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(101);

    // Money display
    this.moneyText = scene.add
      .text(480, 30, `💰 $${inventory.money}`, {
        fontSize: "24px",
        fill: "#ffd700",
        fontFamily: "Courier New",
        fontStyle: "bold",
      })
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(101);

    // Items display
    this.itemsText = scene.add
      .text(630, 30, "", {
        fontSize: "20px",
        fill: "#ffffff",
        fontFamily: "Courier New",
      })
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(101);

    // Mission objectives
    this.missionText = scene.add
      .text(640, 695, "MISSION: Find the treasure and defeat all enemies!", {
        fontSize: "16px",
        fill: "#ffff00",
        fontFamily: "Courier New",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(101);

    // Progress display
    this.progressText = scene.add
      .text(20, 60, `Level 1/3 — Room 1/3`, {
        fontSize: "16px",
        fill: "#ffffff",
        fontFamily: "Courier New",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 2,
      })
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(101);

    // Controls display
    scene.add
      .text(
        640,
        60,
        "WASD/Arrows: Move  |  SPACE: Attack  |  SHIFT: Throw Bongerang  |  E: Interact  |  Q: Smoke",
        {
          fontSize: "14px",
          fill: "#ffffff",
          fontFamily: "Courier New",
          backgroundColor: "#000000",
          padding: { x: 10, y: 4 },
          alpha: 0.8,
        }
      )
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(101);

    // Interaction prompt
    this.interactionPrompt = scene.add
      .text(640, 360, "", {
        fontSize: "18px",
        fill: "#ffff00",
        fontFamily: "Courier New",
        fontStyle: "bold",
        backgroundColor: "#000000",
        padding: { x: 15, y: 8 },
        stroke: "#ffffff",
        strokeThickness: 2,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(102)
      .setVisible(false);
  }

  update() {
    // Update hearts with animation
    for (let i = 0; i < this.heartContainers.length; i++) {
      const heart = this.heartContainers[i];
      if (i < inventory.health) {
        heart.setAlpha(1);
        // Pulse filled hearts
        if (!heart.getData("pulsing")) {
          heart.setData("pulsing", true);
          this.scene.tweens.add({
            targets: heart,
            scaleX: 0.85,
            scaleY: 0.85,
            duration: 500,
            yoyo: true,
            repeat: -1,
          });
        }
      } else {
        heart.setAlpha(0.3);
        // Stop pulsing empty hearts
        if (heart.getData("pulsing")) {
          this.scene.tweens.killTweensOf(heart);
          heart.setScale(0.8);
          heart.setData("pulsing", false);
        }
      }
    }

    // Update lives
    this.livesText.setText(`LIVES: ${inventory.lives}`);

    // Update money
    this.moneyText.setText(`💰 $${inventory.money}`);

    // Update items
    const items = [];
    if (inventory.hasLighter) items.push("🔥");
    if (inventory.hasPapers) items.push("📄");
    if (inventory.hasDoobie) items.push("🌿");
    this.itemsText.setText(items.join(" "));
  }

  updateProgress(level, room) {
    if (this.progressText) {
      this.progressText.setText(`Level ${level}/3 — Room ${room + 1}/3`);
    }
  }

  animateMissionText(text) {
    if (!this.missionText) return;

    this.scene.tweens.killTweensOf(this.missionText);
    this.missionText.setText(text);
    this.missionText.setScale(2.5);
    this.missionText.setAlpha(1);

    this.scene.tweens.add({
      targets: this.missionText,
      scaleX: 1,
      scaleY: 1,
      duration: 600,
      ease: "Back.easeOut",
    });
  }

  showInteractionPrompt(text) {
    this.interactionPrompt.setText(text).setVisible(true);
  }

  hideInteractionPrompt() {
    this.interactionPrompt.setVisible(false);
  }

  showTimedPrompt(text, duration = 1500) {
    this.showInteractionPrompt(text);
    this.scene.time.delayedCall(duration, () => {
      this.hideInteractionPrompt();
    });
  }
}
