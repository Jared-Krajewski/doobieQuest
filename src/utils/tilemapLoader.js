/**
 * Tilemap loading utilities
 * Handles loading and configuring tilemaps for different levels
 */
import { Logger } from "./Logger.js";

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
      Logger.tilemap("Crib background loaded successfully");
    }
  } catch (e) {
    Logger.error("Crib background failed to load:", e);
  }
}

function loadStoreTilemap(scene) {
  try {
    Logger.tilemap("Attempting to load store_map...");

    const map = scene.make.tilemap({ key: "store_map" });
    Logger.debug("Map loaded:", {
      width: map.width,
      height: map.height,
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

    if (!tileset1 || !tileset2 || !tileset3) {
      throw new Error("Tilesets not found in store map");
    }

    Logger.tilemap("Creating layers...");
    scene.tilemapLayer = map.createLayer(
      "Tile Layer 1",
      [tileset1, tileset2, tileset3],
      0,
      48
    );
    scene.tilemapLayer2 = map.createLayer(
      "Tile Layer 2",
      [tileset1, tileset2, tileset3],
      0,
      16
    );

    if (scene.tilemapLayer) scene.tilemapLayer.setDepth(-10);
    if (scene.tilemapLayer2) scene.tilemapLayer2.setDepth(-9);

    Logger.tilemap("Store background loaded successfully");
  } catch (e) {
    Logger.error("Store background failed to load:", e);
  }
}
