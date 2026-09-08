import { GameState, StateManager } from "./gameState.js";

export interface GameLoopSystems {
    readonly input?: (deltaSeconds: number) => void;
    readonly update: (deltaSeconds: number) => void;
    readonly render?: (state: GameState) => void;
    readonly reset?: () => void;
}

/**
 * Coordinates the frame systems without coupling the state manager to a
 * renderer or input implementation. Rendering remains available in every
 * state so start, pause, and terminal screens can be displayed.
 */
export class GameLoop {
    public constructor(
        public readonly stateManager: StateManager = new StateManager(),
        private readonly systems: GameLoopSystems,
    ) {}

    public tick(deltaSeconds: number): void {
        if (this.stateManager.currentState === GameState.Playing) {
            this.systems.input?.(deltaSeconds);
            this.systems.update(deltaSeconds);
        }

        this.systems.render?.(this.stateManager.currentState);
    }

    /**
     * A restart is only meaningful after failure or completion. Reset first,
     * then publish the transition so subscribers see fresh gameplay state.
     */
    public restart(): boolean {
        if (
            this.stateManager.currentState !== GameState.GameOver &&
            this.stateManager.currentState !== GameState.Completed
        ) {
            return false;
        }

        this.systems.reset?.();
        return this.stateManager.transition("restart");
    }
}
