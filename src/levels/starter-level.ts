import { loadLevel } from "./loader.js";

export const starterLevel = loadLevel({
  id: "meadow-run",
  name: "The Wobbly Meadow",
  levelBounds: { minX: 0, minY: 0, maxX: 3200, maxY: 720 },
  startPosition: { x: 96, y: 560 },
  goalPosition: { x: 3000, y: 432, width: 72, height: 128 },
  platforms: [
    { x: 0, y: 640, width: 720, height: 80 },
    { x: 800, y: 640, width: 520, height: 80 },
    { x: 1430, y: 560, width: 360, height: 40 },
    { x: 1900, y: 640, width: 620, height: 80 },
    { x: 2640, y: 560, width: 560, height: 160 },
  ],
  obstacles: [
    { x: 560, y: 576, width: 48, height: 64 },
    { x: 1080, y: 576, width: 64, height: 64 },
    { x: 2140, y: 576, width: 56, height: 64 },
  ],
  hazards: [
    { x: 720, y: 680, width: 80, height: 40 },
    { x: 1320, y: 680, width: 110, height: 40 },
    { x: 1790, y: 680, width: 110, height: 40 },
  ],
});
