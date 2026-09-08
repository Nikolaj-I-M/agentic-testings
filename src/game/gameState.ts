/**
 * The five states required by the game:
 *
 * start --startGame--> playing <--> paused
 *                         |  \          |
 *                     fail|   \complete| (resume)
 *                         v    v        |
 *                      gameOver       completed
 *
 * gameOver and completed can restart into playing or return to start.
 */
export enum GameState {
    Start = "start",
    Playing = "playing",
    Paused = "paused",
    GameOver = "gameOver",
    Completed = "completed",
}

export type StateTransition =
    | "startGame"
    | "pause"
    | "resume"
    | "fail"
    | "complete"
    | "restart"
    | "toStart";

export interface StateChange {
    readonly previous: GameState;
    readonly current: GameState;
    readonly event: StateTransition;
}

export type StateChangeListener = (change: StateChange) => void;

type Transition = readonly [StateTransition, GameState];

const transitions: Readonly<Record<GameState, readonly Transition[]>> = {
    [GameState.Start]: [["startGame", GameState.Playing]],
    [GameState.Playing]: [
        ["pause", GameState.Paused],
        ["fail", GameState.GameOver],
        ["complete", GameState.Completed],
    ],
    [GameState.Paused]: [["resume", GameState.Playing]],
    [GameState.GameOver]: [
        ["restart", GameState.Playing],
        ["toStart", GameState.Start],
    ],
    [GameState.Completed]: [
        ["restart", GameState.Playing],
        ["toStart", GameState.Start],
    ],
};

/**
 * Owns the game-state machine and notifies gameplay, input, and UI consumers.
 * Invalid events are rejected without changing state or notifying listeners.
 */
export class StateManager {
    private readonly listeners = new Set<StateChangeListener>();
    private state: GameState;

    public constructor(initialState: GameState = GameState.Start) {
        this.state = initialState;
    }

    public get currentState(): GameState {
        return this.state;
    }

    public subscribe(listener: StateChangeListener): () => void {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }

    public transition(event: StateTransition): boolean {
        const nextState = transitions[this.state].find(
            ([allowedEvent]) => allowedEvent === event,
        )?.[1];

        if (nextState === undefined) {
            return false;
        }

        const change: StateChange = {
            previous: this.state,
            current: nextState,
            event,
        };
        this.state = nextState;

        for (const listener of this.listeners) {
            listener(change);
        }

        return true;
    }
}
