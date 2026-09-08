import type { GameStateManager } from "../game-state-manager.js";

export type InputAction = "left" | "right" | "jump" | "pause";

export interface InputState {
    readonly left: boolean;
    readonly right: boolean;
    readonly jump: boolean;
    readonly pause: boolean;
}

export interface KeyboardEventTarget {
    addEventListener(
        type: "keydown" | "keyup",
        listener: (event: KeyboardEvent) => void,
    ): void;
    removeEventListener(
        type: "keydown" | "keyup",
        listener: (event: KeyboardEvent) => void,
    ): void;
}

export const KEY_BINDINGS: Readonly<Record<string, InputAction>> = {
    ArrowLeft: "left",
    KeyA: "left",
    a: "left",
    ArrowRight: "right",
    KeyD: "right",
    d: "right",
    ArrowUp: "jump",
    KeyW: "jump",
    w: "jump",
    Space: "jump",
    " ": "jump",
    KeyP: "pause",
    p: "pause",
    Escape: "pause",
};

const EMPTY_INPUT_STATE: InputState = {
    left: false,
    right: false,
    jump: false,
    pause: false,
};

function getBinding(event: KeyboardEvent): InputAction | undefined {
    const code = event.code;
    if (code !== "") {
        const action = KEY_BINDINGS[code];
        if (action !== undefined) {
            return action;
        }
    }

    const key = event.key;
    if (key === "") {
        return undefined;
    }

    const normalizedKey = key.length === 1 ? key.toLowerCase() : key;
    return KEY_BINDINGS[normalizedKey] ?? KEY_BINDINGS[key];
}

function getPhysicalKey(event: KeyboardEvent): string {
    return event.code !== "" ? event.code : event.key;
}

/**
 * Converts browser keyboard events into game actions.
 *
 * The constructor registers listeners immediately. Call destroy when the
 * game or test is torn down to remove those listeners.
 */
export class KeyboardInput {
    private readonly pressedKeys = new Set<string>();
    private readonly target: KeyboardEventTarget;
    private readonly stateManager: GameStateManager;
    private listening = false;

    constructor(
        stateManager: GameStateManager,
        target: KeyboardEventTarget = window,
    ) {
        this.stateManager = stateManager;
        this.target = target;
        this.start();
    }

    private readonly handleKeyDown = (event: KeyboardEvent): void => {
        const action = getBinding(event);
        if (action === undefined) {
            return;
        }

        event.preventDefault();
        const physicalKey = getPhysicalKey(event);
        if (this.pressedKeys.has(physicalKey)) {
            return;
        }

        this.pressedKeys.add(physicalKey);
        if (action === "pause") {
            if (this.stateManager.getState() === "playing") {
                this.stateManager.pause();
            } else if (this.stateManager.getState() === "paused") {
                this.stateManager.resume();
            }
        }
    };

    private readonly handleKeyUp = (event: KeyboardEvent): void => {
        const action = getBinding(event);
        if (action === undefined) {
            return;
        }

        event.preventDefault();
        this.pressedKeys.delete(getPhysicalKey(event));
    };

    start(): void {
        if (this.listening) {
            return;
        }

        this.target.addEventListener("keydown", this.handleKeyDown);
        this.target.addEventListener("keyup", this.handleKeyUp);
        this.listening = true;
    }

    destroy(): void {
        if (!this.listening) {
            return;
        }

        this.target.removeEventListener("keydown", this.handleKeyDown);
        this.target.removeEventListener("keyup", this.handleKeyUp);
        this.pressedKeys.clear();
        this.listening = false;
    }

    getInputState(): InputState {
        if (!this.stateManager.isPlaying()) {
            return { ...EMPTY_INPUT_STATE, pause: this.isPressed("pause") };
        }

        return {
            left: this.isPressed("left"),
            right: this.isPressed("right"),
            jump: this.isPressed("jump"),
            pause: this.isPressed("pause"),
        };
    }

    private isPressed(action: InputAction): boolean {
        for (const physicalKey of this.pressedKeys) {
            if (KEY_BINDINGS[physicalKey] === action) {
                return true;
            }
        }
        return false;
    }
}

export function createKeyboardInput(
    stateManager: GameStateManager,
    target: KeyboardEventTarget = window,
): KeyboardInput {
    return new KeyboardInput(stateManager, target);
}
