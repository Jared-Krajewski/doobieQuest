import Phaser from "phaser";

export class SplashScene extends Phaser.Scene {
  constructor() {
    super({ key: "SplashScene" });
  }

  preload() {
    // Load the splash screen image
    this.load.image("splash", "/doobieQuest.png");
  }

  create() {
    // Set background color
    this.cameras.main.setBackgroundColor("#000000");

    // Add the splash image centered
    const splash = this.add.image(640, 360, "splash");

    // Scale the image to fit larger (95% of max size for less padding)
    const scaleX = 1280 / splash.width;
    const scaleY = 720 / splash.height;
    const scale = Math.min(scaleX, scaleY) * 1;
    splash.setScale(scale);

    // Add a background bubble for the start text
    const bubbleWidth = 550;
    const bubbleHeight = 50;
    const bubbleX = 640;
    const bubbleY = 580;
    const bubble = this.add.graphics();
    bubble.fillStyle(0xf0f0f0, 0.62);
    bubble.fillRoundedRect(
      bubbleX - bubbleWidth / 2,
      bubbleY - bubbleHeight / 2,
      bubbleWidth,
      bubbleHeight,
      30
    );
    bubble.setDepth(1);

    // Add "Press Space to Start" text
    const startText = this.add.text(
      bubbleX,
      bubbleY,
      "Press SPACE to start Doobie Quest",
      {
        fontSize: "32px",
        fontFamily: "Arial",
        color: "#222222",
        stroke: "#ffffff",
        strokeThickness: 4,
      }
    );
    startText.setOrigin(0.5);
    startText.setDepth(2);

    // Make text blink
    this.tweens.add({
      targets: startText,
      alpha: { from: 1, to: 0.3 },
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    // Handle spacebar press
    this.input.keyboard.once("keydown-SPACE", () => {
      this.startGame();
    });

    // Also allow click/tap to start
    this.input.once("pointerdown", () => {
      this.startGame();
    });
  }

  startGame() {
    // Fade out and start the game
    this.cameras.main.fadeOut(500, 0, 0, 0);

    this.cameras.main.once("camerafadeoutcomplete", () => {
      this.scene.start("BootScene");
    });
  }
}
