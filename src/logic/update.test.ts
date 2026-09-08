import assert from "node:assert/strict";
import test from "node:test";
import { placeholderLevel } from "../levels/placeholder.js";
import { createInitialState } from "./types.js";
import { update } from "./update.js";

test("update advances elapsed time without mutating the entity", () => {
  const initial = createInitialState(placeholderLevel);

  const next = update(initial, { ArrowRight: true }, 0.25);

  assert.equal(next.elapsedTime, 0.25);
  assert.equal(next.inputActive, true);
  assert.deepEqual(next.entity, placeholderLevel.entity);
  assert.notEqual(next, initial);
  assert.equal(initial.elapsedTime, 0);
});

test("update ignores invalid delta times", () => {
  const initial = createInitialState(placeholderLevel);

  assert.equal(update(initial, {}, -1).elapsedTime, 0);
  assert.equal(update(initial, {}, Number.NaN).elapsedTime, 0);
});
