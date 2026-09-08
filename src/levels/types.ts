export interface Vector {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface LevelBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface LevelData {
  id: string;
  name: string;
  levelBounds: LevelBounds;
  startPosition: Vector;
  goalPosition: Rect;
  platforms: Rect[];
  obstacles: Rect[];
  hazards: Rect[];
}

export interface LoadedLevel extends LevelData {
  collisionGeometry: Rect[];
}
