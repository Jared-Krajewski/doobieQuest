# Doobie Quest - Controls & Changes

## Latest Updates

### Canvas & Room Size
- **Canvas reduced**: 1920x1080 → 1280x720 (more manageable viewing)
- **Rooms adjusted**: 800x600 → 640x480 (fits better in smaller canvas)
- **Camera**: Locked to room bounds with HUD overlay

### Keyboard Controls (PRIMARY)
- **W A S D**: Move up/left/down/right
- **Arrow Keys**: Alternative movement (secondary)
- **SPACE**: Melee attack (directional, faces player)
- **SHIFT**: Throw bong boomerang (returns after distance)

### Gamepad Controls (Xbox Controller)
- **Left Stick**: Movement
- **A Button**: Melee attack
- **B Button**: Throw bong boomerang

**Note**: Chrome may not detect Bluetooth Xbox controllers properly. If gamepad doesn't work, use keyboard controls (WASD).

## Game Features

### Room System
- **Multi-room dungeon**: Navigate through connected rooms via doors
- **Room 1 (0,0)**: Starting entrance hall with 2 roamers
- **Room 2 (1,0)**: Combat room with roamers + 3 shooter turrets
- **Room 3 (2,0)**: Boss/treasure room with police enemies + 4 shooter turrets + big money pile

### Combat
- **Directional melee**: Attack faces the direction you last moved
- **Boomerang bong**: Throws in direction, spins, damages enemies, returns to you
- **Enemy types**:
  - **Roamers**: Move randomly, 2-3 HP
  - **Police**: Tougher roamers, 5 HP
  - **Shooters**: Stationary turrets that fire projectiles at you every 2 seconds, 4-5 HP

### Health & Lives
- **6 hearts total** (shown in HUD as heart containers)
- **3 lives** (shown in HUD as "Lives: X")
- **Heart drops**: Enemies drop hearts when defeated
- **Respawn**: Lose a life when all hearts depleted, respawn with full hearts

### Visual Improvements
- **Checkerboard floors**: Alternating dark/light tiles
- **More obstacles**: Tables, pillars, wall barriers for tactical combat
- **Decorative elements**: Background details in rooms
- **Enemy variety**: Different sprites for roamer, police, shooter types

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
