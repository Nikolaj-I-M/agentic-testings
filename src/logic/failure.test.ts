import assert from "node:assert/strict";
import test from "node:test";
import {
  createFailureController,
  type PlayerFailedEvent,
} from "./failure.js";

const bounds = { left: 0, right: 500, lower: 400 };
const start = { x: 20, y: 20, width: 20, height: 20 };

test("overlapping a hazard emits one failure event and restarts the player", () => {
  const events: PlayerFailedEvent[] = [];
  let resetCount = 0;
  const controller = createFailureController({
    bounds,
    resetState: { playerStart: start, resetEntities: () => resetCount++ },
    hazards: [{ id: "spikes", x: 30, y: 20, width: 20, height: 20 }],
    onPlayerFailed: (event) => events.push(event),
  });

  const restarted = controller.update({ x: 35, y: 20, width: 20, height: 20 });
  controller.update({ x: 35, y: 20, width: 20, height: 20 });

  assert.deepEqual(restarted, start);
  assert.equal(resetCount, 1);
  assert.equal(events.length, 1);
  assert.equal(events[0]?.reason, "hazard");
  assert.equal(events[0]?.hazardId, "spikes");

  controller.restart();
  controller.update({ x: 35, y: 20, width: 20, height: 20 });
  assert.equal(events.length, 2);
});

test("falling below the level lower bound emits an out-of-bounds failure", () => {
  const events: PlayerFailedEvent[] = [];
  const controller = createFailureController({
    bounds,
    resetState: { playerStart: start },
    hazards: [],
    onPlayerFailed: (event) => events.push(event),
  });

  const restarted = controller.update({ x: 100, y: 401, width: 20, height: 20 });

  assert.deepEqual(restarted, start);
  assert.deepEqual(events.map(({ reason }) => reason), ["out-of-bounds"]);
});

test("restart uses a checkpoint and resets level entities when one is configured", () => {
  let resetCount = 0;
  const controller = createFailureController({
    bounds,
    resetState: {
      playerStart: start,
      checkpoint: { x: 250, y: 60, width: 20, height: 20 },
      resetEntities: () => resetCount++,
    },
    hazards: [],
  });

  assert.deepEqual(controller.restart(), {
    x: 250,
    y: 60,
    width: 20,
    height: 20,
  });
  assert.equal(resetCount, 1);
});

test("failure notifies the game-state manager and UI feedback hooks", () => {
  const notifications: string[] = [];
  const controller = createFailureController({
    bounds,
    resetState: { playerStart: start },
    hazards: [{ id: "pit", x: 0, y: 100, width: 50, height: 50 }],
    onGameStateFailure: ({ reason }) => notifications.push(`state:${reason}`),
    onFailureFeedback: ({ reason }) => notifications.push(`ui:${reason}`),
  });

  controller.update({ x: 10, y: 110, width: 20, height: 20 });

  assert.deepEqual(notifications, ["state:hazard", "ui:hazard"]);
});
