import type { LevelBounds, Rect } from "../levels/types.js";

export function clampToLevelBounds(body: Rect, bounds: LevelBounds): Rect {
  return {
    ...body,
    x: Math.min(bounds.maxX - body.width, Math.max(bounds.minX, body.x)),
    y: Math.min(bounds.maxY - body.height, Math.max(bounds.minY, body.y)),
  };
}
