
# Doobie Quest - Controls & Gameplay Guide

## Controls

### Keyboard
- **W A S D** or **Arrow Keys**: Move up/left/down/right
- **SPACE**: Melee attack (directional)
- **SHIFT**: Throw bong boomerang (returns after distance)

### Gamepad (Xbox Controller)
- **Left Stick**: Movement
- **A Button**: Melee attack
- **B Button**: Throw bong boomerang

**Note:** If gamepad doesn't work, use keyboard controls. Click the game window to focus.

## Game Structure

- **Three Levels:**
  1. **The Crib**: Bedroom with roamers, crabs, and obstacles. Find money and the lighter.
  2. **Corner Store**: Buy rolling papers from the clerk, avoid police, collect money, and dodge hazards.
  3. **Back Alley**: Reach the dealer with all items, avoid police and rats, and win the game.
- **Room-based progression**: Each level is divided into rooms. Use doors to advance.
- **Inventory**: Track money, lighter, papers, doobie, health, and lives.

## Enemies & Hazards

- **Roamers**: Move randomly, low HP.
- **Crabs**: Hazard in the crib.
- **Police**: Patrol in store and alley, deal high damage.
- **Clerk**: Sells papers in the store (not hostile).
- **Dealer**: Final NPC in the alley (not hostile).
- **Shooters**: Stationary turrets (in some rooms).
- **Rats/Spills**: Environmental hazards in later levels.

## Combat & Items

- **Melee attack**: Faces last moved direction.
- **Boomerang bong**: Ranged attack, returns to player.
- **Collectibles**: Money, lighter, papers, doobie, hearts.
- **Health**: 6 hearts (12 HP), 3 lives. Lose all hearts to lose a life.
- **Respawn**: Lose a life, respawn with full health.

## Visuals & Features

- **Tilemap backgrounds**: Themed for each level (crib, store, alley)
- **Obstacles**: Tables, boxes, shelves, beds, dumpsters, etc.
- **Decorations**: Background props for immersion
- **HUD**: Health, lives, inventory always visible
- **Camera**: Follows player, locked to room bounds
- **Procedural & custom sprites**: Player, enemies, NPCs, items

## Development & Troubleshooting

- **Start dev server:**
  ```bash
  bun run dev
  # Server runs at http://localhost:5173/ (or next available port)
  ```
- **Keyboard not responding?** Click the game window, refresh, or check browser console.
- **Gamepad not working?** Try USB, or use keyboard.
- **Canvas too big?** Zoom out in browser.

## Next Steps
- Add more enemy types and hazards
- Expand room-based system for all levels
- Add boss fights and new collectibles

## Troubleshooting

### Keyboard not responding?
- Try clicking on the game canvas first to focus it
- Refresh the page (Cmd+R on Mac)
- Check browser console for errors (F12)

### Canvas still too big?
- Zoom out in browser (Cmd+Minus)
- Current size is 1280x720, can be reduced further if needed

### Gamepad not working?
- Chrome has issues with Bluetooth controllers
- Try USB connection instead of Bluetooth
- Fall back to keyboard controls (WASD + SPACE + SHIFT)

## Development Server
```bash
bun run dev
# Server runs at http://localhost:5173/
```

## Next Steps
- Convert Level2 and Level3 to room-based system
- Add more enemy types
- Add boss fights
- Add more collectible items
