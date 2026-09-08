import type { InputState } from "./input/types.js";
import type { GameState } from "./logic/types.js";
import { update } from "./logic/update.js";

export interface FrameScheduler {
  request(callback: FrameRequestCallback): number;
  cancel(handle: number): void;
}

export interface LoopDependencies {
  readonly scheduler: FrameScheduler;
  readonly getInputState: () => InputState;
  readonly render: (state: GameState) => void;
}

export function createGameLoop(
  initialState: GameState,
  dependencies: LoopDependencies,
): { start: () => void; stop: () => void } {
  let state = initialState;
  let frameHandle: number | undefined;
  let previousTimestamp: number | undefined;

  const frame = (timestamp: number): void => {
    const deltaTime = previousTimestamp === undefined
      ? 0
      : (timestamp - previousTimestamp) / 1000;
    previousTimestamp = timestamp;
    state = update(state, dependencies.getInputState(), deltaTime);
    dependencies.render(state);
    frameHandle = dependencies.scheduler.request(frame);
  };

  return {
    start: (): void => {
      if (frameHandle === undefined) {
        previousTimestamp = undefined;
        frameHandle = dependencies.scheduler.request(frame);
      }
    },
    stop: (): void => {
      if (frameHandle !== undefined) {
        dependencies.scheduler.cancel(frameHandle);
        frameHandle = undefined;
      }
    },
  };
}
