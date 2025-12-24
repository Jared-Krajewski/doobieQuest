/**
 * Tilemap loading utilities
 * Handles loading and configuring tileaps for different levels
 */

export function loadLevelTilemap(scene, level) {
  // Clear existing tilemap layers
  if (scene.tilemapLayer) {
    scene.tilemapLayer.destroy();
    scene.tilemapLayer = null;
  }
  if (scene.tilemapLayer2) {
    scene.tilemapLayer2.destroy();
    scene.tilemapLayer2 = null;
  }

  // Load tilemap backgrounds
  if (level === 1) {
    loadCribTilemap(scene);
  } else if (level === 2) {
    loadStoreTilemap(scene);
  }
}

function loadCribTilemap(scene) {
  try {
    const map = scene.make.tilemap({ key: "crib_map" });
    const tilesetName = map.tilesets?.[0]?.name || "Interiors_tilesets";
    const tileset = map.addTilesetImage(tilesetName, "interiors_tileset");

    if (!tileset) {
      throw new Error(`Tileset not found in map (expected: ${tilesetName})`);
    }

    scene.tilemapLayer = map.createLayer("Tile Layer 1", tileset, 0, 0);

    if (scene.tilemapLayer) {
      scene.tilemapLayer.setDepth(-10);
      console.log("[Tilemap] Crib background loaded successfully");
    }
  } catch (e) {
    console.error("[Tilemap] Crib background failed to load:", e);
  }
}

function loadStoreTilemap(scene) {
  try {
    console.log("[Tilemap] Attempting to load store_map...");

    // Check if textures exist
    console.log("[Tilemap] Checking textures exist:");
    console.log(
      "- interiors_tileset:",
      scene.textures.exists("interiors_tileset")
    );
    console.log("- building_tiles:", scene.textures.exists("building_tiles"));
    console.log("- store_map cache:", scene.cache.tilemap.exists("store_map"));

    const map = scene.make.tilemap({ key: "store_map" });
    console.log("[Tilemap] Map loaded:", map);
    console.log("[Tilemap] Map properties:", {
      width: map.width,
      height: map.height,
      tileWidth: map.tileWidth,
      tileHeight: map.tileHeight,
    });

    // Load tilesets using the embedded names from the TMJ file
    const tileset1 = map.addTilesetImage(
      "Interiors_tilesets",
      "interiors_tileset"
    );
    const tileset2 = map.addTilesetImage(
      "Building_Tiles 32x32",
      "building_tiles"
    );
    const tileset3 = map.addTilesetImage(
      "furniture_and_props",
      "furniture_and_props"
    );

    console.log("[Tilemap] Tileset 1:", tileset1);
    console.log("[Tilemap] Tileset 2:", tileset2);
    console.log("[Tilemap] Tileset 3:", tileset3);

    if (!tileset1 || !tileset2 || !tileset3) {
      console.error("[Tilemap] Failed to load tilesets:", {
        tileset1,
        tileset2,
        tileset3,
      });
      throw new Error("Tilesets not found in store map");
    }

    console.log("[Tilemap] Creating layers...");
    scene.tilemapLayer = map.createLayer(
      "Tile Layer 1",
      [tileset1, tileset2, tileset3],
      0,
      48 // Shift down a bit
    );
    scene.tilemapLayer2 = map.createLayer(
      "Tile Layer 2",
      [tileset1, tileset2, tileset3],
      0,
      16 // Shift down a bit
    );

    console.log("[Tilemap] Layer 1:", scene.tilemapLayer);
    console.log("[Tilemap] Layer 2:", scene.tilemapLayer2);

    if (scene.tilemapLayer) {
      scene.tilemapLayer.setDepth(-10);
      console.log("[Tilemap] Layer 1 depth set to -10");
    }
    if (scene.tilemapLayer2) {
      scene.tilemapLayer2.setDepth(-9);
      console.log("[Tilemap] Layer 2 depth set to -9");
    }

    console.log("[Tilemap] Store background loaded successfully");
  } catch (e) {
    console.error("[Tilemap] Store background failed to load:", e);
    console.error("[Tilemap] Error stack:", e.stack);
  }
}
