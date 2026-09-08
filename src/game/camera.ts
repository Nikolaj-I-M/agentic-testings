import type { LevelBounds, Vector } from "../levels/types.js";

export interface Viewport {
  width: number;
  height: number;
}

export function getCameraPosition(
  player: Vector,
  viewport: Viewport,
  bounds: LevelBounds,
): Vector {
  const maxX = Math.max(bounds.minX, bounds.maxX - viewport.width);
  const maxY = Math.max(bounds.minY, bounds.maxY - viewport.height);
  return {
    x: Math.min(maxX, Math.max(bounds.minX, player.x - viewport.width / 2)),
    y: Math.min(maxY, Math.max(bounds.minY, player.y - viewport.height / 2)),
  };
}
