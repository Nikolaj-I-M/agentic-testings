import type { InputState } from "./types.js";

const keys = new Set<string>();

export function createKeyboardInput(target: Window = window): () => void {
  const handleKeyDown = (event: KeyboardEvent): void => {
    keys.add(event.key);
  };
  const handleKeyUp = (event: KeyboardEvent): void => {
    keys.delete(event.key);
  };

  target.addEventListener("keydown", handleKeyDown);
  target.addEventListener("keyup", handleKeyUp);

  return () => {
    target.removeEventListener("keydown", handleKeyDown);
    target.removeEventListener("keyup", handleKeyUp);
  };
}

export function getInputState(): InputState {
  const snapshot: Record<string, boolean> = {};
  for (const key of keys) {
    snapshot[key] = true;
  }
  return Object.freeze(snapshot);
}
