import Phaser from "phaser";
import { SplashScene } from "./scenes/SplashScene.js";
import { BootScene } from "./scenes/BootScene.js";
import { Level1Scene } from "./scenes/Level1Scene.js";
import { Level2Scene } from "./scenes/Level2Scene.js";
import { Level3Scene } from "./scenes/Level3Scene.js";

const config = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  parent: "game-container",
  backgroundColor: "#1a1a1a",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 }, // No gravity for top-down
      debug: false,
    },
  },
  scene: [SplashScene, BootScene, Level1Scene, Level2Scene, Level3Scene],
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  input: {
    gamepad: true,
  },
};

const game = new Phaser.Game(config);
