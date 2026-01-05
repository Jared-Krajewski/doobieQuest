import { inventory } from "../inventory.js";

/**
 * NPCManager - Handles NPC interactions and transactions
 */
export class NPCManager {
  constructor(scene, hudManager) {
    this.scene = scene;
    this.hudManager = hudManager;
    this.nearbyNPC = null;
  }

  /**
   * Update NPC proximity check
   */
  update(player) {
    if (!this.nearbyNPC || !this.scene.npcs) return;

    const dist = Phaser.Math.Distance.Between(
      player.x,
      player.y,
      this.nearbyNPC.x,
      this.nearbyNPC.y
    );

    if (dist > 60) {
      this.nearbyNPC = null;
      this.hudManager.hideInteractionPrompt();
    }
  }

  /**
   * Handle player near NPC
   */
  handleNearNPC(player, npc) {
    if (npc.npcType === "clerk" && !inventory.hasPapers) {
      this.nearbyNPC = npc;
      const cost = 20;
      this.hudManager.showInteractionPrompt(
        `Press E to buy papers ($${cost})\nYou have $${inventory.money}`
      );
    } else if (npc.npcType === "dealer" && !inventory.hasDoobie) {
      this.nearbyNPC = npc;
      const cost = 50;
      this.hudManager.showInteractionPrompt(
        `Press E to buy weed ($${cost})\nYou have $${inventory.money}`
      );
    }
  }

  /**
   * Try to interact with nearby NPC
   */
  tryInteract() {
    if (!this.nearbyNPC) return;

    if (this.nearbyNPC.npcType === "clerk") {
      this.buyPapers();
    } else if (this.nearbyNPC.npcType === "dealer") {
      this.buyWeed();
    }
  }

  /**
   * Buy papers from clerk
   */
  buyPapers() {
    const cost = 20;
    if (inventory.money >= cost) {
      inventory.money -= cost;
      inventory.hasPapers = true;
      this.hudManager.showTimedPrompt("Papers purchased!");
      this.hudManager.update();

      if (this.scene.missionText) {
        this.scene.missionText.setText("THE CRIB - Find the exit!");
      }
    } else {
      this.hudManager.showTimedPrompt(`Not enough money! Need $${cost}`);
    }
  }

  /**
   * Buy weed from dealer
   */
  buyWeed() {
    const cost = 50;
    if (inventory.money >= cost) {
      inventory.money -= cost;
      inventory.hasDoobie = true;
      this.hudManager.showTimedPrompt("Weed purchased!");
      this.hudManager.update();

      if (this.scene.missionText) {
        this.scene.missionText.setText(
          "BACK ALLEY - Press Q to roll a doobie, smoke and WIN!"
        );
      }
    } else {
      this.hudManager.showTimedPrompt(`Not enough money! Need $${cost}`);
    }
  }
}
