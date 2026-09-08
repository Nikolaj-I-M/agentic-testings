import type { InputState } from "../input/types.js";
import type { Entity, Level } from "../levels/types.js";

export interface GameState {
  readonly level: Level;
  readonly entity: Entity;
  readonly elapsedTime: number;
  readonly inputActive: boolean;
}

export function createInitialState(level: Level): GameState {
  return {
    level,
    entity: level.entity,
    elapsedTime: 0,
    inputActive: false,
  };
}

export type { InputState };
