import { createKeyboardInput, getInputState } from "./input/keyboard.js";
import { createInitialState } from "./logic/types.js";
import { createGameLoop, type FrameScheduler } from "./loop.js";
import { placeholderLevel } from "./levels/placeholder.js";
import { createRenderer } from "./render/canvas.js";

const canvas = document.querySelector<HTMLCanvasElement>("#game-canvas");
if (canvas === null) {
  throw new Error("Expected #game-canvas to exist.");
}

const removeKeyboardListeners = createKeyboardInput();
const renderer = createRenderer(canvas);
const scheduler: FrameScheduler = {
  request: (callback) => window.requestAnimationFrame(callback),
  cancel: (handle) => window.cancelAnimationFrame(handle),
};
const loop = createGameLoop(createInitialState(placeholderLevel), {
  scheduler,
  getInputState,
  render: renderer,
});

loop.start();
window.addEventListener("beforeunload", removeKeyboardListeners, { once: true });
