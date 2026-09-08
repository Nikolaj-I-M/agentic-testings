import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_PLAYER_PHYSICS,
  type Player,
  type Solid,
  updatePlayerPhysics,
} from "./playerPhysics.js";

const emptySolids: readonly Solid[] = [];

function createPlayer(overrides: Partial<Player> = {}): Player {
  return {
    position: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    size: { width: 10, height: 10 },
    grounded: false,
    ...overrides,
  };
}

test("gravity accumulates downward velocity over successive ticks", () => {
  const first = updatePlayerPhysics(createPlayer(), {}, emptySolids, 0.1);
  const second = updatePlayerPhysics(first, {}, emptySolids, 0.1);

  assert.equal(first.velocity.y, DEFAULT_PLAYER_PHYSICS.gravity * 0.1);
  assert.equal(second.velocity.y, DEFAULT_PLAYER_PHYSICS.gravity * 0.2);
  assert.ok(second.position.y > first.position.y);
});

test("landing on a platform rests on its top edge", () => {
  const platform: Solid = {
    position: { x: -20, y: 30 },
    size: { width: 100, height: 10 },
  };
  const landed = updatePlayerPhysics(
    createPlayer({
      position: { x: 10, y: 0 },
      velocity: { x: 0, y: 300 },
    }),
    {},
    [platform],
    0.1,
  );

  assert.equal(landed.position.y, platform.position.y - landed.size.height);
  assert.equal(landed.velocity.y, 0);
  assert.equal(landed.grounded, true);
});

test("horizontal movement stops at a wall boundary", () => {
  const wall: Solid = {
    position: { x: 30, y: -20 },
    size: { width: 10, height: 100 },
  };
  const moved = updatePlayerPhysics(
    createPlayer({
      position: { x: 0, y: 0 },
      grounded: true,
    }),
    { right: true },
    [wall],
    0.2,
  );

  assert.equal(moved.position.x, wall.position.x - moved.size.width);
  assert.equal(moved.velocity.x, 0);
});

test("jump is gated by grounded state", () => {
  const airborne = updatePlayerPhysics(
    createPlayer({ velocity: { x: 0, y: 20 } }),
    { jump: true },
    emptySolids,
    0,
  );
  const jumping = updatePlayerPhysics(
    createPlayer({ grounded: true }),
    { jump: true },
    emptySolids,
    0,
  );

  assert.equal(airborne.velocity.y, 20);
  assert.equal(jumping.velocity.y, -DEFAULT_PLAYER_PHYSICS.jumpVelocity);
  assert.equal(jumping.grounded, false);
});

test("walking off a platform clears grounded state", () => {
  const platform: Solid = {
    position: { x: 0, y: 10 },
    size: { width: 10, height: 10 },
  };
  const walkedOff = updatePlayerPhysics(
    createPlayer({
      position: { x: 0, y: 0 },
      grounded: true,
    }),
    { right: true },
    [platform],
    0.1,
  );

  assert.equal(walkedOff.grounded, false);
});
