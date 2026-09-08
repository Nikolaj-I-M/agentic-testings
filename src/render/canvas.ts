import type { GameState } from "../logic/types.js";

export function createRenderer(canvas: HTMLCanvasElement): (state: GameState) => void {
  const context = canvas.getContext("2d");
  if (context === null) {
    throw new Error("The game canvas does not support a 2D rendering context.");
  }

  return (state: GameState): void => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = state.entity.color;
    context.fillRect(
      state.entity.x,
      state.entity.y,
      state.entity.width,
      state.entity.height,
    );
  };
}
