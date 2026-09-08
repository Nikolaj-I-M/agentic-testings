import type { LevelData, LoadedLevel, Rect, Vector } from "./types.js";

const isNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const readVector = (value: unknown, name: string): Vector => {
  if (
    typeof value !== "object" ||
    value === null ||
    !isNumber((value as { x?: unknown }).x) ||
    !isNumber((value as { y?: unknown }).y)
  ) {
    throw new Error(`${name} must contain finite x and y numbers`);
  }
  return { x: (value as { x: number }).x, y: (value as { y: number }).y };
};

const readRect = (value: unknown, name: string): Rect => {
  if (typeof value !== "object" || value === null) {
    throw new Error(`${name} must be a rectangle`);
  }
  const rect = value as Partial<Rect>;
  if (
    !isNumber(rect.x) ||
    !isNumber(rect.y) ||
    !isNumber(rect.width) ||
    !isNumber(rect.height) ||
    rect.width <= 0 ||
    rect.height <= 0
  ) {
    throw new Error(`${name} must have finite x/y and positive width/height`);
  }
  return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
};

const readRects = (value: unknown, name: string): Rect[] => {
  if (!Array.isArray(value)) {
    throw new Error(`${name} must be an array`);
  }
  return value.map((rect, index) => readRect(rect, `${name}[${index}]`));
};

export function loadLevel(input: unknown): LoadedLevel {
  if (typeof input !== "object" || input === null) {
    throw new Error("Level must be an object");
  }
  const value = input as Partial<LevelData>;
  if (typeof value.id !== "string" || value.id.length === 0) {
    throw new Error("Level id must be a non-empty string");
  }
  if (typeof value.name !== "string" || value.name.length === 0) {
    throw new Error("Level name must be a non-empty string");
  }
  const bounds = value.levelBounds;
  if (
    typeof bounds !== "object" ||
    bounds === null ||
    !isNumber(bounds.minX) ||
    !isNumber(bounds.minY) ||
    !isNumber(bounds.maxX) ||
    !isNumber(bounds.maxY) ||
    bounds.maxX <= bounds.minX ||
    bounds.maxY <= bounds.minY
  ) {
    throw new Error("levelBounds must define finite, ordered min and max coordinates");
  }

  const levelBounds = {
    minX: bounds.minX,
    minY: bounds.minY,
    maxX: bounds.maxX,
    maxY: bounds.maxY,
  };
  const startPosition = readVector(value.startPosition, "startPosition");
  const goalPosition = readRect(value.goalPosition, "goalPosition");
  const platforms = readRects(value.platforms, "platforms");
  const obstacles = readRects(value.obstacles, "obstacles");
  const hazards = readRects(value.hazards, "hazards");

  const allRects = [goalPosition, ...platforms, ...obstacles, ...hazards];
  for (const [index, rect] of allRects.entries()) {
    if (
      rect.x < levelBounds.minX ||
      rect.y < levelBounds.minY ||
      rect.x + rect.width > levelBounds.maxX ||
      rect.y + rect.height > levelBounds.maxY
    ) {
      throw new Error(`Level geometry at index ${index} lies outside levelBounds`);
    }
  }
  if (
    startPosition.x < levelBounds.minX ||
    startPosition.y < levelBounds.minY ||
    startPosition.x > levelBounds.maxX ||
    startPosition.y > levelBounds.maxY
  ) {
    throw new Error("startPosition must lie inside levelBounds");
  }

  return {
    id: value.id,
    name: value.name,
    levelBounds,
    startPosition,
    goalPosition,
    platforms,
    obstacles,
    hazards,
    collisionGeometry: [...platforms, ...obstacles],
  };
}
