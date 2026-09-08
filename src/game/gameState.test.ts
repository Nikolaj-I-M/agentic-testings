import assert from "node:assert/strict";
import test from "node:test";
import { GameLoop } from "./gameLoop.js";
import { GameState, StateManager, type StateChange } from "./gameState.js";

test("accepts every valid state transition", () => {
    const manager = new StateManager();
    const changes: StateChange[] = [];
    manager.subscribe((change) => changes.push(change));

    assert.equal(manager.transition("startGame"), true);
    assert.equal(manager.transition("pause"), true);
    assert.equal(manager.transition("resume"), true);
    assert.equal(manager.transition("fail"), true);
    assert.equal(manager.transition("restart"), true);
    assert.equal(manager.transition("complete"), true);
    assert.equal(manager.transition("toStart"), true);

    assert.deepEqual(
        changes.map(({ previous, current, event }) => [previous, current, event]),
        [
            [GameState.Start, GameState.Playing, "startGame"],
            [GameState.Playing, GameState.Paused, "pause"],
            [GameState.Paused, GameState.Playing, "resume"],
            [GameState.Playing, GameState.GameOver, "fail"],
            [GameState.GameOver, GameState.Playing, "restart"],
            [GameState.Playing, GameState.Completed, "complete"],
            [GameState.Completed, GameState.Start, "toStart"],
        ],
    );
});

test("rejects invalid transitions without notifying listeners", () => {
    const manager = new StateManager();
    let notifications = 0;
    manager.subscribe(() => {
        notifications += 1;
    });

    assert.equal(manager.transition("complete"), false);
    assert.equal(manager.currentState, GameState.Start);
    assert.equal(notifications, 0);

    assert.equal(manager.transition("startGame"), true);
    assert.equal(manager.transition("pause"), true);
    assert.equal(manager.transition("complete"), false);
    assert.equal(manager.currentState, GameState.Paused);
    assert.equal(notifications, 2);
});

test("suspends input and update systems while paused", () => {
    const calls: string[] = [];
    const manager = new StateManager();
    const loop = new GameLoop(manager, {
        input: () => calls.push("input"),
        update: () => calls.push("update"),
        render: () => calls.push("render"),
    });

    manager.transition("startGame");
    loop.tick(1 / 60);
    manager.transition("pause");
    loop.tick(1 / 60);

    assert.deepEqual(calls, ["input", "update", "render", "render"]);
});

test("restart resets gameplay before entering a fresh playing state", () => {
    const calls: string[] = [];
    const manager = new StateManager();
    const loop = new GameLoop(manager, {
        update: () => undefined,
        reset: () => calls.push("reset"),
    });

    manager.transition("startGame");
    manager.transition("fail");
    assert.equal(loop.restart(), true);
    assert.equal(manager.currentState, GameState.Playing);
    assert.deepEqual(calls, ["reset"]);
});
