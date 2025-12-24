import Phaser from "phaser";

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" });
  }

  preload() {
    // Player (external sprite sheets placed in project root)
    // Frame size inferred from file dimensions: all sheets are 128px tall => 128x128 frames.
    this.load.spritesheet("player", "/Idle.png", {
      frameWidth: 128,
      frameHeight: 128,
    });

    // Enemy sprites
    // dog.png is 128x320; 8 rows × 4 cols = 32 frames at 34x38 each (128/4≈32, but using 34; 320/8=40, using 38)
    this.load.spritesheet("dog", "/dog.png", {
      frameWidth: 32,
      frameHeight: 40,
    });
    // police.png is 208x256; 8 rows × 4 cols = 32 frames at 52x32 each
    this.load.spritesheet("police", "/police.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
    // bong.png for projectile sprite
    this.load.image("bong_sprite", "/bong.png");

    // Tilemap for crib background
    this.load.tilemapTiledJSON("crib_map", "/maps/crib.tmj");
    // crib.tmj references an external tileset: "Interiors_tilesets.tsj".
    // Phaser needs that TSJ available in the JSON cache under the same key.
    this.load.json("Interiors_tilesets.tsj", "/maps/Interiors_tilesets.tsj");
    // Tileset image location
    this.load.image("interiors_tileset", "/maps/Interiors_tilesets.png");
    this.load.image("building_tiles", "/maps/Building_Tiles 32x32.png");
    this.load.image("furniture_and_props", "/maps/furniture_and_props.png");
    this.load.image("dealer", "/maps/dealer.png");

    // Tilemap for store background - using simplified embedded tilesets
    this.load.tilemapTiledJSON("store_map", "/maps/store_simple.tmj");
    console.log("[BootScene] Loading store tilemap assets...");

    this.load.spritesheet("player_walk", "/Walk.png", {
      frameWidth: 128,
      frameHeight: 128,
    });
    this.load.spritesheet("player_run", "/Run.png", {
      frameWidth: 128,
      frameHeight: 128,
    });
    this.load.spritesheet("player_hurt", "/Hurt.png", {
      frameWidth: 128,
      frameHeight: 128,
    });
    this.load.spritesheet("player_dead", "/Dead.png", {
      frameWidth: 128,
      frameHeight: 128,
    });
    this.load.spritesheet("player_attack_1", "/Attack_1.png", {
      frameWidth: 128,
      frameHeight: 128,
    });
    this.load.spritesheet("player_attack_2", "/Attack_2.png", {
      frameWidth: 128,
      frameHeight: 128,
    });
    this.load.spritesheet("player_jump", "/Jump.png", {
      frameWidth: 128,
      frameHeight: 128,
    });
    // Spill hazard image
    this.load.image("spill", "/spill.png");

    // Box obstacle
    this.load.image("box", "/box.png");

    // Crab attack sprite (replaces cockroach)
    this.load.spritesheet("crab", "/crab_attack.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
  }

  createCollectibles() {
    // Money ($) - spinning coin
    let g = this.add.graphics();
    g.fillStyle(0xffd700, 1);
    g.fillCircle(16, 16, 10);
    g.fillStyle(0xffff00, 1);
    g.fillCircle(16, 16, 7);
    g.fillStyle(0x000000, 1);
    g.lineStyle(3, 0x000000);
    g.beginPath();
    g.moveTo(16, 8);
    g.lineTo(16, 24);
    g.strokePath();
    g.generateTexture("money", 32, 32);
    g.destroy();

    // Lighter - orange/red
    g = this.add.graphics();
    g.fillStyle(0xff6600, 1);
    g.fillRoundedRect(10, 8, 12, 16, 2);
    g.fillStyle(0xff0000, 1);
    g.fillRect(13, 6, 6, 4);
    g.fillStyle(0xffff00, 1);
    g.fillCircle(16, 6, 2);
    g.generateTexture("lighter", 32, 32);
    g.destroy();

    // Papers - white sheets
    g = this.add.graphics();
    g.fillStyle(0xffffff, 1);
    g.fillRect(8, 10, 16, 12);
    g.lineStyle(2, 0x000000);
    g.strokeRect(8, 10, 16, 12);
    g.lineStyle(1, 0xcccccc);
    g.lineBetween(10, 14, 22, 14);
    g.lineBetween(10, 17, 22, 17);
    g.lineBetween(10, 20, 22, 20);
    g.generateTexture("papers", 32, 32);
    g.destroy();

    // Doobie - the ultimate prize
    g = this.add.graphics();
    g.fillStyle(0x8b4513, 1);
    g.fillRect(6, 14, 20, 4);
    g.fillStyle(0x556b2f, 1);
    g.fillRect(8, 15, 16, 2);
    g.fillStyle(0xff4500, 1);
    g.fillCircle(26, 16, 2);
    g.fillStyle(0xff6347, 1);
    g.fillCircle(26, 14, 1.5);
    g.generateTexture("doobie", 32, 32);
    g.destroy();

    // Bong weapon - glass bong
    g = this.add.graphics();
    // Base (water chamber)
    g.fillStyle(0x87ceeb, 0.6);
    g.fillCircle(16, 24, 8);
    g.lineStyle(2, 0x4682b4);
    g.strokeCircle(16, 24, 8);
    // Neck
    g.fillStyle(0xb0e0e6, 0.6);
    g.fillRect(13, 8, 6, 18);
    g.lineStyle(2, 0x4682b4);
    g.strokeRect(13, 8, 6, 18);
    // Bowl (green)
    g.fillStyle(0x556b2f, 1);
    g.fillCircle(20, 18, 4);
    g.lineStyle(1, 0x2f4f2f);
    g.strokeCircle(20, 18, 4);
    // Mouthpiece
    g.fillStyle(0xb0e0e6, 0.6);
    g.fillRect(13, 4, 6, 6);
    g.lineStyle(2, 0x4682b4);
    g.strokeRect(13, 4, 6, 6);
    g.generateTexture("bong", 32, 32);
    g.destroy();

    // Attack visual - swing effect
    g = this.add.graphics();
    g.lineStyle(4, 0xffffff, 0.8);
    g.beginPath();
    g.arc(16, 16, 12, 0, Math.PI / 2);
    g.strokePath();
    g.generateTexture("attack_effect", 32, 32);
    g.destroy();

    // Heart - health pickup (Zelda-style)
    g = this.add.graphics();
    g.fillStyle(0xff0000, 1);
    // Heart shape
    g.fillCircle(12, 14, 5);
    g.fillCircle(20, 14, 5);
    g.beginPath();
    g.moveTo(7, 14);
    g.lineTo(16, 26);
    g.lineTo(25, 14);
    g.closePath();
    g.fillPath();
    g.lineStyle(2, 0x8b0000);
    g.strokeCircle(12, 14, 5);
    g.strokeCircle(20, 14, 5);
    g.generateTexture("heart", 32, 32);
    g.destroy();

    // Projectile - enemy bullet
    g = this.add.graphics();
    g.fillStyle(0xff4500, 1);
    g.fillCircle(8, 8, 6);
    g.fillStyle(0xff6347, 1);
    g.fillCircle(8, 8, 4);
    g.generateTexture("projectile", 16, 16);
    g.destroy();

    // Bong projectile (boomerang style)
    g = this.add.graphics();
    g.fillStyle(0x4682b4, 1);
    g.fillCircle(12, 12, 8);
    g.fillStyle(0x87ceeb, 1);
    g.fillCircle(12, 12, 6);
    g.lineStyle(2, 0x4682b4);
    g.strokeCircle(12, 12, 7);
    g.generateTexture("bong_projectile", 24, 24);
    g.destroy();
  }

  createTiles() {
    // Floor - dark wood (bedroom)
    let g = this.add.graphics();
    g.fillStyle(0x654321, 1);
    g.fillRect(0, 0, 32, 32);
    g.lineStyle(1, 0x4a2511);
    for (let i = 0; i < 32; i += 8) {
      g.lineBetween(i, 0, i, 32);
    }
    g.generateTexture("floor_wood", 32, 32);
    g.destroy();

    // Floor - tile (store)
    g = this.add.graphics();
    g.fillStyle(0xf0f0f0, 1);
    g.fillRect(0, 0, 32, 32);
    g.lineStyle(2, 0xcccccc);
    g.strokeRect(0, 0, 32, 32);
    g.generateTexture("floor_tile", 32, 32);
    g.destroy();

    // Floor - stone/concrete (alley)
    g = this.add.graphics();
    g.fillStyle(0x696969, 1);
    g.fillRect(0, 0, 32, 32);
    g.fillStyle(0x808080, 0.3);
    for (let i = 0; i < 5; i++) {
      const x = Math.random() * 32;
      const y = Math.random() * 32;
      g.fillCircle(x, y, 2);
    }
    g.generateTexture("floor_stone", 32, 32);
    g.destroy();

    // Cockroach replaced by crab sprite - removed procedural generation

    // HAZARDS - Rat (Alley hazard)
    g = this.add.graphics();
    g.fillStyle(0x696969, 1);
    g.fillEllipse(16, 16, 20, 12);
    // Head
    g.fillStyle(0x808080, 1);
    g.fillCircle(10, 14, 6);
    // Eyes (red)
    g.fillStyle(0xff0000, 1);
    g.fillCircle(8, 13, 2);
    g.fillCircle(12, 13, 2);
    // Ears
    g.fillStyle(0xffc0cb, 1);
    g.fillCircle(6, 10, 3);
    g.fillCircle(14, 10, 3);
    // Tail
    g.lineStyle(2, 0x696969);
    g.beginPath();
    g.arc(22, 16, 8, -Math.PI / 4, Math.PI / 4);
    g.strokePath();
    g.generateTexture("rat", 32, 32);
    g.destroy();

    // Garbage and water hazards replaced by spill sprite - removed procedural generation

    // Pit hazard
    g = this.add.graphics();
    g.fillStyle(0x000000, 1);
    g.fillEllipse(16, 16, 26, 20);
    g.fillStyle(0x1a1a1a, 1);
    g.fillEllipse(16, 14, 20, 16);
    g.generateTexture("pit", 32, 32);
    g.destroy();

    // Wall - bedroom (brown)
    g = this.add.graphics();
    g.fillStyle(0x8b4513, 1);
    g.fillRect(0, 0, 32, 32);
    g.fillStyle(0xa0522d, 1);
    g.fillRect(2, 2, 28, 28);
    g.lineStyle(1, 0x654321);
    g.strokeRect(0, 0, 32, 32);
    g.generateTexture("wall_wood", 32, 32);
    g.destroy();

    // Wall - store shelves
    g = this.add.graphics();
    g.fillStyle(0xdeb887, 1);
    g.fillRect(0, 0, 32, 32);
    g.fillStyle(0xf5deb3, 1);
    g.fillRect(0, 0, 32, 8);
    g.fillRect(0, 24, 32, 8);
    g.lineStyle(2, 0x8b7355);
    g.strokeRect(0, 0, 32, 32);
    g.lineBetween(0, 8, 32, 8);
    g.lineBetween(0, 24, 32, 24);
    g.generateTexture("wall_shelf", 32, 32);
    g.destroy();

    // Wall - brick (alley)
    g = this.add.graphics();
    g.fillStyle(0x8b0000, 1);
    g.fillRect(0, 0, 32, 32);
    g.lineStyle(1, 0x654321);
    for (let y = 0; y < 32; y += 8) {
      for (let x = 0; x < 32; x += 16) {
        const offset = (y / 8) % 2 === 0 ? 0 : 8;
        g.strokeRect(x + offset, y, 16, 8);
      }
    }
    g.generateTexture("wall_brick", 32, 32);
    g.destroy();

    // Furniture - bed
    g = this.add.graphics();
    g.fillStyle(0x8b0000, 1);
    g.fillRect(0, 8, 32, 24);
    g.fillStyle(0xffffff, 1);
    g.fillRect(2, 10, 28, 20);
    g.fillStyle(0xdcdcdc, 1);
    g.fillRect(4, 12, 24, 16);
    g.generateTexture("bed", 32, 32);
    g.destroy();

    // Furniture - table
    g = this.add.graphics();
    g.fillStyle(0x8b4513, 1);
    g.fillRect(4, 4, 24, 24);
    g.fillStyle(0xa0522d, 1);
    g.fillRect(6, 6, 20, 20);
    g.generateTexture("table", 32, 32);
    g.destroy();

    // Store items - colorful boxes
    g = this.add.graphics();
    const colors = [0xff69b4, 0x00ced1, 0xffd700, 0xff4500];
    for (let i = 0; i < 4; i++) {
      g.fillStyle(colors[i], 1);
      g.fillRect((i % 2) * 16, Math.floor(i / 2) * 16, 14, 14);
    }
    g.lineStyle(1, 0x000000);
    g.strokeRect(0, 0, 32, 32);
    g.generateTexture("products", 32, 32);
    g.destroy();

    // Trash/dumpster
    g = this.add.graphics();
    g.fillStyle(0x2f4f4f, 1);
    g.fillRect(2, 4, 28, 24);
    g.fillStyle(0x556b2f, 1);
    g.fillRect(4, 6, 24, 20);
    g.lineStyle(2, 0x1c1c1c);
    g.strokeRect(2, 4, 28, 24);
    g.generateTexture("dumpster", 32, 32);
    g.destroy();
  }

  createEnemySprites() {
    // Generic roaming enemy - bug/rat creature
    let g = this.add.graphics();
    g.fillStyle(0x8b008b, 1);
    g.fillCircle(16, 16, 10);
    // Eyes (red and menacing)
    g.fillStyle(0xff0000, 1);
    g.fillCircle(12, 14, 3);
    g.fillCircle(20, 14, 3);
    // Antennae/ears
    g.lineStyle(2, 0x4b0082);
    g.lineBetween(12, 8, 8, 4);
    g.lineBetween(20, 8, 24, 4);
    g.fillStyle(0x4b0082, 1);
    g.fillCircle(8, 4, 2);
    g.fillCircle(24, 4, 2);
    // Body segments
    g.fillStyle(0x9932cc, 1);
    g.fillCircle(16, 22, 6);
    g.fillCircle(16, 26, 4);
    g.generateTexture("roamer", 32, 32);
    g.destroy();

    // Cashier - top-down angry face
    g = this.add.graphics();
    g.fillStyle(0xff6347, 1);
    g.fillCircle(16, 16, 12);
    // Visor/hat
    g.fillStyle(0x000000, 1);
    g.fillRect(6, 8, 20, 4);
    // Eyes (angry)
    g.fillStyle(0x000000, 1);
    g.fillRect(10, 15, 4, 2);
    g.fillRect(18, 15, 4, 2);
    // Mouth (frown)
    g.lineStyle(2, 0x000000);
    g.beginPath();
    g.arc(16, 22, 4, 0.2, Math.PI - 0.2, true);
    g.strokePath();
    // Body (uniform)
    g.fillStyle(0xdaa520, 1);
    g.fillRect(8, 24, 16, 6);
    g.generateTexture("cashier", 32, 32);
    g.destroy();

    // Police - top-down officer with gun (only if not provided by external sprites)
    if (!this.textures.exists("police")) {
      g = this.add.graphics();
      // Hat
      g.fillStyle(0x000080, 1);
      g.fillCircle(16, 14, 10);
      g.fillStyle(0x0000cd, 1);
      g.fillCircle(16, 14, 8);
      // Badge on hat
      g.fillStyle(0xffd700, 1);
      g.fillCircle(16, 12, 3);
      // Face
      g.fillStyle(0xffcc99, 1);
      g.fillCircle(16, 18, 6);
      // Eyes
      g.fillStyle(0x000000, 1);
      g.fillCircle(13, 18, 1.5);
      g.fillCircle(19, 18, 1.5);
      // Body (uniform)
      g.fillStyle(0x0000cd, 1);
      g.fillRect(8, 24, 16, 6);
      // Badge on chest
      g.fillStyle(0xffd700, 1);
      g.fillCircle(16, 26, 2);
      // Gun in hand
      g.fillStyle(0x1c1c1c, 1);
      g.fillRect(24, 24, 6, 3); // Gun barrel
      g.fillRect(24, 23, 2, 5); // Handle
      g.generateTexture("police", 32, 32);
      g.destroy();
    }
  }

  create() {
    // Create top-down Zelda-style graphics (must happen before texture filtering/animation)
    this.createCollectibles();
    this.createTiles();
    this.createEnemySprites();

    // Ensure crisp pixel art for loaded sprites
    const filter = Phaser.Textures.FilterMode.NEAREST;
    [
      "player",
      "player_walk",
      "player_run",
      "player_hurt",
      "player_dead",
      "player_attack_1",
      "player_attack_2",
      "player_jump",
      "dog",
      "police",
    ].forEach((key) => {
      const tex = this.textures.get(key);
      if (tex) tex.setFilter(filter);
    });

    // Animations
    if (!this.anims.exists("dog_walk")) {
      // Row 7 (frames 24-27) = walk right on 8x4 grid (32x40 frames)
      this.anims.create({
        key: "dog_walk",
        frames: this.anims.generateFrameNumbers("dog", {
          start: 24,
          end: 27,
        }),
        frameRate: 10,
        repeat: -1,
      });
    }

    if (!this.anims.exists("dog_walk_left")) {
      // Row 8 (frames 28-31) = walk left
      this.anims.create({
        key: "dog_walk_left",
        frames: this.anims.generateFrameNumbers("dog", {
          start: 28,
          end: 31,
        }),
        frameRate: 10,
        repeat: -1,
      });
    }

    // Police animations (8 rows × 4 cols grid, 52×32 frames)
    if (!this.anims.exists("police_walk")) {
      // Row 1 (frames 0-3) = walking animation
      this.anims.create({
        key: "police_walk",
        frames: this.anims.generateFrameNumbers("police", {
          start: 6,
          end: 10,
        }),
        frameRate: 4,
        repeat: -1,
      });
    }

    if (!this.anims.exists("police_shoot")) {
      // Row 4 (frames 12-13) = shooting animation (2 frames)
      this.anims.create({
        key: "police_shoot",
        frames: this.anims.generateFrameNumbers("police", {
          start: 12,
          end: 13,
        }),
        frameRate: 10,
        repeat: 0,
      });
    }

    if (!this.anims.exists("police_dead")) {
      // Row 8 frame 28 = death sprite (single frame, but we'll use it as animation)
      this.anims.create({
        key: "police_dead",
        frames: [{ key: "police", frame: 28 }],
        frameRate: 1,
        repeat: 0,
      });
    }
    if (!this.anims.exists("player_idle")) {
      this.anims.create({
        key: "player_idle",
        frames: this.anims.generateFrameNumbers("player", {
          start: 0,
          end: 6,
        }),
        frameRate: 8,
        repeat: -1,
      });
    }

    if (!this.anims.exists("player_walk")) {
      this.anims.create({
        key: "player_walk",
        frames: this.anims.generateFrameNumbers("player_walk", {
          start: 0,
          end: 7,
        }),
        frameRate: 10,
        repeat: -1,
      });
    }

    if (!this.anims.exists("player_hurt")) {
      this.anims.create({
        key: "player_hurt",
        frames: this.anims.generateFrameNumbers("player_hurt", {
          start: 0,
          end: 2,
        }),
        frameRate: 12,
        repeat: 0,
      });
    }

    if (!this.anims.exists("player_dead")) {
      this.anims.create({
        key: "player_dead",
        frames: this.anims.generateFrameNumbers("player_dead", {
          start: 0,
          end: 3,
        }),
        frameRate: 8,
        repeat: 0,
      });
    }

    if (!this.anims.exists("player_attack_1")) {
      this.anims.create({
        key: "player_attack_1",
        frames: this.anims.generateFrameNumbers("player_attack_1", {
          start: 0,
          end: 9,
        }),
        frameRate: 14,
        repeat: 0,
      });
    }

    if (!this.anims.exists("player_attack_2")) {
      this.anims.create({
        key: "player_attack_2",
        frames: this.anims.generateFrameNumbers("player_attack_2", {
          start: 0,
          end: 3,
        }),
        frameRate: 14,
        repeat: 0,
      });
    }

    if (!this.anims.exists("player_jump")) {
      this.anims.create({
        key: "player_jump",
        frames: this.anims.generateFrameNumbers("player_jump", {
          start: 0,
          end: 11,
        }),
        frameRate: 14,
        repeat: 0,
      });
    }

    // Crab attack animation (5 frames: 0-4)
    if (!this.anims.exists("crab_attack")) {
      this.anims.create({
        key: "crab_attack",
        frames: this.anims.generateFrameNumbers("crab", {
          start: 0,
          end: 4,
        }),
        frameRate: 10,
        repeat: -1,
      });
    }

    // Start the first level
    this.scene.start("Level1Scene");
  }
}
