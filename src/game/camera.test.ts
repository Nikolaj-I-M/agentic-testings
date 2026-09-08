import assert from "node:assert/strict";
import test from "node:test";
import { getCameraPosition } from "./camera.js";

const bounds = { minX: 0, minY: 0, maxX: 2000, maxY: 1000 };

test("tracks the player while staying within both level edges", () => {
  assert.deepEqual(getCameraPosition({ x: 50, y: 50 }, { width: 800, height: 600 }, bounds), {
    x: 0,
    y: 0,
  });
  assert.deepEqual(getCameraPosition({ x: 1000, y: 700 }, { width: 800, height: 600 }, bounds), {
    x: 600,
    y: 400,
  });
  assert.deepEqual(getCameraPosition({ x: 1999, y: 999 }, { width: 800, height: 600 }, bounds), {
    x: 1200,
    y: 400,
  });
});
