export type GameState =
    | "start-screen"
    | "playing"
    | "paused"
    | "game-over"
    | "level-completed";

export interface GameStateManager {
    getState(): GameState;
    isPlaying(): boolean;
    pause(): void;
    resume(): void;
}

/**
 * Minimal state manager used by input and ready to be replaced by the
 * full game-state implementation.
 */
export class DefaultGameStateManager implements GameStateManager {
    private state: GameState = "start-screen";

    getState(): GameState {
        return this.state;
    }

    isPlaying(): boolean {
        return this.state === "playing";
    }

    pause(): void {
        if (this.state === "playing") {
            this.state = "paused";
        }
    }

    resume(): void {
        if (this.state === "paused") {
            this.state = "playing";
        }
    }

    setState(state: GameState): void {
        this.state = state;
    }
}
