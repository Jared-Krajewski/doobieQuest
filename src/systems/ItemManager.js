import { inventory } from "../inventory.js";
import { GameEffects } from "../utils/GameEffects.js";

/**
 * ItemManager - Handles item collection and effects
 */
export class ItemManager {
  constructor(scene, hudManager) {
    this.scene = scene;
    this.hudManager = hudManager;
  }

  /**
   * Handle item collection
   */
  collectItem(player, item) {
    switch (item.itemType) {
      case "money":
        this.collectMoney(item);
        break;
      case "heart":
        this.collectHeart(item);
        break;
      case "lighter":
        this.collectLighter(item);
        break;
    }
    this.hudManager.update();
  }

  /**
   * Collect money
   */
  collectMoney(item) {
    inventory.addMoney(item.value);

    // Effects
    GameEffects.createSparkle(this.scene, item.x, item.y, 0xffff00);
    GameEffects.createFloatingText(
      this.scene,
      item.x,
      item.y,
      `+$${item.value}`
    );

    item.destroy();
  }

  /**
   * Collect heart
   */
  collectHeart(item) {
    inventory.heal(item.value);
    GameEffects.createSparkle(this.scene, item.x, item.y, 0xff0000);
    item.destroy();
  }

  /**
   * Collect lighter
   */
  collectLighter(item) {
    inventory.hasLighter = true;

    // Effects
    GameEffects.createSparkle(this.scene, item.x, item.y, 0xff8800, 400);
    GameEffects.createFloatingText(
      this.scene,
      item.x,
      item.y,
      "Lighter found!",
      {
        fill: "#ff8800",
      }
    );

    item.destroy();

    if (this.scene.missionText) {
      this.scene.missionText.setText(
        "THE CRIB - Lighter found! Find the exit!"
      );
    }
  }
}
