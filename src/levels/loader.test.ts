import assert from "node:assert/strict";
import test from "node:test";
import { loadLevel } from "./loader.js";
import { starterLevel } from "./starter-level.js";

test("loads the starter level and exposes its gameplay geometry", () => {
  assert.deepEqual(starterLevel.startPosition, { x: 96, y: 560 });
  assert.equal(starterLevel.goalPosition.width, 72);
  assert.equal(starterLevel.collisionGeometry.length, 8);
  assert.ok(starterLevel.hazards.length > 0);
});

test("rejects geometry outside the declared bounds", () => {
  assert.throws(
    () =>
      loadLevel({
        id: "invalid",
        name: "Invalid",
        levelBounds: { minX: 0, minY: 0, maxX: 10, maxY: 10 },
        startPosition: { x: 1, y: 1 },
        goalPosition: { x: 1, y: 1, width: 2, height: 2 },
        platforms: [{ x: 9, y: 9, width: 2, height: 1 }],
        obstacles: [],
        hazards: [],
      }),
    /outside levelBounds/,
  );
});
