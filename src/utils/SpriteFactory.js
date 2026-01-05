/**
 * SpriteFactory
 *
 * Utility class to simplify procedural sprite generation in BootScene.
 * Reduces repetitive graphics creation code.
 */
export class SpriteFactory {
  constructor(scene) {
    this.scene = scene;
  }

  /**
   * Create a new graphics object
   */
  createGraphics() {
    return this.scene.add.graphics();
  }

  /**
   * Generate a texture from graphics and destroy the graphics object
   */
  generateTexture(graphics, name, width, height) {
    graphics.generateTexture(name, width, height);
    graphics.destroy();
  }

  /**
   * Create a simple filled circle sprite
   */
  createCircleSprite(name, size, color, innerColor = null, innerRadius = 0) {
    const g = this.createGraphics();
    const radius = size / 2;
    const center = radius;

    g.fillStyle(color, 1);
    g.fillCircle(center, center, radius);

    if (innerColor && innerRadius > 0) {
      g.fillStyle(innerColor, 1);
      g.fillCircle(center, center, innerRadius);
    }

    this.generateTexture(g, name, size, size);
  }

  /**
   * Create a simple rectangle sprite
   */
  createRectSprite(
    name,
    width,
    height,
    color,
    strokeColor = null,
    strokeWidth = 0
  ) {
    const g = this.createGraphics();

    g.fillStyle(color, 1);
    g.fillRect(0, 0, width, height);

    if (strokeColor && strokeWidth > 0) {
      g.lineStyle(strokeWidth, strokeColor);
      g.strokeRect(0, 0, width, height);
    }

    this.generateTexture(g, name, width, height);
  }

  /**
   * Create a sprite with multiple layers (for complex sprites)
   */
  createLayeredSprite(name, size, layers) {
    const g = this.createGraphics();

    layers.forEach((layer) => {
      if (layer.type === "circle") {
        g.fillStyle(layer.color, layer.alpha || 1);
        g.fillCircle(layer.x, layer.y, layer.radius);
      } else if (layer.type === "rect") {
        g.fillStyle(layer.color, layer.alpha || 1);
        g.fillRect(layer.x, layer.y, layer.width, layer.height);
      } else if (layer.type === "line") {
        g.lineStyle(layer.width || 1, layer.color);
        g.lineBetween(layer.x1, layer.y1, layer.x2, layer.y2);
      } else if (layer.type === "stroke-rect") {
        g.lineStyle(layer.width || 1, layer.color);
        g.strokeRect(layer.x, layer.y, layer.rectWidth, layer.rectHeight);
      }
    });

    this.generateTexture(g, name, size, size);
  }
}
