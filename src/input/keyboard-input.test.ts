import assert from "node:assert/strict";
import test from "node:test";
import type { GameState, GameStateManager } from "../game-state-manager.js";
import { KeyboardInput } from "./keyboard-input.js";

class TestStateManager implements GameStateManager {
    state: GameState = "playing";
    pauseCalls = 0;
    resumeCalls = 0;

    getState(): GameState {
        return this.state;
    }

    isPlaying(): boolean {
        return this.state === "playing";
    }

    pause(): void {
        this.pauseCalls += 1;
        this.state = "paused";
    }

    resume(): void {
        this.resumeCalls += 1;
        this.state = "playing";
    }
}

class TestKeyboardEvent extends Event {
    readonly code: string;
    readonly key: string;

    constructor(type: "keydown" | "keyup", code: string, key = code) {
        super(type, { cancelable: true });
        this.code = code;
        this.key = key;
    }
}

function dispatch(
    target: EventTarget,
    type: "keydown" | "keyup",
    code: string,
): TestKeyboardEvent {
    const event = new TestKeyboardEvent(type, code);
    target.dispatchEvent(event);
    return event;
}

function createInput(stateManager = new TestStateManager()) {
    const target = new EventTarget();
    const input = new KeyboardInput(
        stateManager,
        target as unknown as ConstructorParameters<typeof KeyboardInput>[1],
    );
    return { input, stateManager, target };
}

test("tracks simultaneous actions and same-action partial release", () => {
    const { input, target } = createInput();

    dispatch(target, "keydown", "ArrowLeft");
    dispatch(target, "keydown", "KeyA");
    dispatch(target, "keydown", "Space");
    assert.deepEqual(input.getInputState(), {
        left: true,
        right: false,
        jump: true,
        pause: false,
    });

    dispatch(target, "keyup", "ArrowLeft");
    assert.equal(input.getInputState().left, true);

    input.destroy();
});

test("toggles pause once per press and ignores key repeat", () => {
    const { input, stateManager, target } = createInput();

    dispatch(target, "keydown", "KeyP");
    dispatch(target, "keydown", "KeyP");
    assert.equal(stateManager.pauseCalls, 1);
    assert.equal(stateManager.resumeCalls, 0);

    dispatch(target, "keyup", "KeyP");
    dispatch(target, "keydown", "KeyP");
    assert.equal(stateManager.resumeCalls, 1);

    input.destroy();
});

test("gates movement and jump while paused", () => {
    const stateManager = new TestStateManager();
    stateManager.state = "paused";
    const { input, target } = createInput(stateManager);

    dispatch(target, "keydown", "ArrowRight");
    dispatch(target, "keydown", "ArrowUp");
    assert.deepEqual(input.getInputState(), {
        left: false,
        right: false,
        jump: false,
        pause: false,
    });

    input.destroy();
});
