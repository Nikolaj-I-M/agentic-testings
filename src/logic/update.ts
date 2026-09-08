import type { InputState } from "../input/types.js";
import type { GameState } from "./types.js";

export function update(
  state: GameState,
  input: InputState,
  deltaTime: number,
): GameState {
  const elapsedTime = Number.isFinite(deltaTime) && deltaTime > 0
    ? state.elapsedTime + deltaTime
    : state.elapsedTime;

  return {
    ...state,
    elapsedTime,
    inputActive: Object.values(input).some(Boolean),
  };
}
