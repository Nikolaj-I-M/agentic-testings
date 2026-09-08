import assert from "node:assert/strict";
import test from "node:test";
import { Game, type LevelDefinition } from "./game.js";

const level: LevelDefinition = {
  player: { position: { x: 0, y: 0 } },
  goal: { bounds: { x: 1, y: 0, width: 2, height: 1 } },
};

test("emits one levelCompleted event while the player remains in the goal", () => {
  let completionCount = 0;
  const game = new Game(level, {
    levelCompleted: (event) => {
      completionCount += 1;
      assert.equal(event.type, "levelCompleted");
    },
  });

  game.update({ right: true });
  game.update({ left: true });
  game.update({ right: true });

  assert.equal(completionCount, 1);
  assert.equal(game.getState(), "levelCompleted");
  assert.equal(game.isCompleted(), true);
  assert.deepEqual(game.getPlayer().position, { x: 1, y: 0 });
});

test("restart restores the same player and level state as a fresh game", () => {
  const freshGame = new Game(level);
  const game = new Game(level);

  game.update({ right: true });
  game.update({ jump: true });
  assert.equal(game.isCompleted(), true);

  game.restart();

  assert.deepEqual(game.getPlayer(), freshGame.getPlayer());
  assert.deepEqual(game.getLevel(), freshGame.getLevel());
  assert.equal(game.getState(), freshGame.getState());
  assert.equal(game.isCompleted(), false);
});
