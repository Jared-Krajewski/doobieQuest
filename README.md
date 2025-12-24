# 🎮 DoobieQuest

A chill, arcade-style side-scrolling platformer built with Phaser 3 in stunning **1080p**.

## 🎯 Game Overview

Play as **The Seeker** navigating three expansive, horizontally-scrolling levels to collect the necessary items and cash for the ultimate quest reward.

### Levels

1. **Level 1: The Crib Chaos** (3200px wide)
   - Collect **$16** scattered around a massive messy bedroom
   - Find the **Lighter** on a high shelf at the far end
   - Navigate beds, dressers, TV stands, bookshelves, and floating platforms
   - Camera follows you through the expansive room

2. **Level 2: The Corner Store Dash** (4000px wide)
   - Use **$5** to purchase **Rolling Papers** at the checkout
   - Avoid **3 Grumpy Cashiers** patrolling different aisles (-$2 & -10HP per hit)
   - Navigate candy, drinks, snacks, bakery, and deli sections
   - Reach the papers on a high checkout counter shelf

3. **Level 3: The Alleyway Hookup** (4500px wide)
   - Reach the **Dealer** (in trench coat and fedora) with **$5+**, **Lighter**, and **Papers**
   - Avoid **3 Police Officers** patrolling the alley (-20HP per hit!)
   - Navigate fire escapes, dumpsters, brick walls, and crate stacks
   - Collect the **Doobie** from the dealer on his high perch to win!

## 🎮 Controls

- **Arrow Keys**: Move left/right
- **Up Arrow**: Jump
- **SPACE**: Restart (after winning or game over)

## 🆕 New Features

- **1080p Canvas** (1920x1080) with responsive scaling
- **Health System**: 100HP, displayed with dynamic color-changing health bar
- **Camera Follow**: Smooth camera tracking through expansive levels
- **Larger Levels**: 3-4x bigger with more detail and complexity
- **Enhanced Enemies**: Multiple patrol zones, health damage
- **Police Enemies**: New enemy type in Level 3 with 20HP damage
- **Trench Coat Dealer**: Detailed sprite with fedora and sunglasses
- **Game Over System**: Die when health reaches 0
- **Improved Player Sprite**: Detailed human character with outfit

## 🚀 Quick Start

```bash
# Install dependencies
bun install

# Run development server (1080p!)
bun run dev
```

Then open http://localhost:5173 in your browser!

## 🏗️ Tech Stack

- **Phaser 3.90** - Game engine with Arcade Physics
- **1920x1080 Resolution** - Full HD gaming
- **Camera System** - Smooth scrolling through large levels
- **Vite** - Fast dev server and bundling
- **Bun** - Fast package manager and runtime

## 📁 Project Structure

```
doobieQuest/
├── index.html              # Entry HTML
├── src/
│   ├── main.js            # Phaser config (1080p) & initialization
│   ├── inventory.js       # Global state with health system
│   └── scenes/
│       ├── BootScene.js   # Asset generation (player, police, dealer)
│       ├── Level1Scene.js # The Crib Chaos (3200px)
│       ├── Level2Scene.js # Corner Store (4000px)
│       └── Level3Scene.js # Alleyway Hookup (4500px)
└── package.json
```

## 🎨 Features

- **Dynamic Health System**: Color-changing health bar (green → yellow → red)
- **Camera Follow**: Smooth tracking through large scrolling levels
- **Multiple Enemy Types**: Cashiers and Police with different damage values
- **Detailed Sprites**: Human-like player, police officers, trench coat dealer
- **Global Inventory**: Money, health, items tracked across all scenes
- **HUD Display**: Real-time inventory + health updates (fixed to camera)
- **Procedural Graphics**: All sprites generated at runtime
- **Win/Lose Conditions**: Collect items + survive to complete quest

## 🔧 Development

The game uses runtime-generated placeholder graphics. To add custom sprites:

1. Replace texture generation in `BootScene.js` with `this.load.image()` calls
2. Use **Tiled Map Editor** for level design (export as JSON)
3. Load tilemaps with `this.make.tilemap()` in each scene

## 📝 Game Design Notes

- **Resolution**: 1920x1080 with FIT scaling
- **Physics**: Gravity 800, player speed 200px/s, jump velocity -500
- **Health**: 100 max, cashiers -10HP, police -20HP
- **Level Sizes**: L1: 3200px, L2: 4000px, L3: 4500px
- **Camera**: Smooth follow with 0.1 lerp factor
- **Collectibles**: Simple overlap detection
- **Enemy AI**: Patrol with min/max boundaries
- **Scene Flow**: BootScene → Level1 → Level2 → Level3 → Win

## 🎉 Credits

Built with Phaser 3, a chill vibe, and the power of 1080p gaming.
