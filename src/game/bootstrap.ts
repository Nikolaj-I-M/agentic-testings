import { clampToLevelBounds } from "./bounds.js";
import { getCameraPosition } from "./camera.js";
import { starterLevel } from "../levels/starter-level.js";
import type { LoadedLevel, Rect, Vector } from "../levels/types.js";

const playerSize = { width: 36, height: 36 };
const gravity = 1500;
const moveSpeed = 260;
const jumpSpeed = 620;

interface InputState {
  left: boolean;
  right: boolean;
  jump: boolean;
}

const overlaps = (a: Rect, b: Rect): boolean =>
  a.x < b.x + b.width &&
  a.x + a.width > b.x &&
  a.y < b.y + b.height &&
  a.y + a.height > b.y;

export interface Game {
  start(): void;
  stop(): void;
}

export function createGame(canvas: HTMLCanvasElement, level: LoadedLevel = starterLevel): Game {
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("A 2D canvas context is required");
  }

  const input: InputState = { left: false, right: false, jump: false };
  let player: Rect = {
    x: level.startPosition.x,
    y: level.startPosition.y,
    ...playerSize,
  };
  let velocityY = 0;
  let grounded = false;
  let animationFrame = 0;
  let lastTime = 0;

  const onKey = (event: KeyboardEvent, pressed: boolean) => {
    if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") input.left = pressed;
    if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") input.right = pressed;
    if (event.key === " " || event.key === "ArrowUp" || event.key.toLowerCase() === "w") {
      input.jump = pressed;
      if (pressed) event.preventDefault();
    }
  };
  const keyDown = (event: KeyboardEvent) => onKey(event, true);
  const keyUp = (event: KeyboardEvent) => onKey(event, false);

  const reset = () => {
    player = { x: level.startPosition.x, y: level.startPosition.y, ...playerSize };
    velocityY = 0;
  };

  const update = (seconds: number) => {
    const previous = player;
    const horizontal = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    if (input.jump && grounded) {
      velocityY = -jumpSpeed;
      grounded = false;
    }
    player = { ...player, x: player.x + horizontal * moveSpeed * seconds };
    player = clampToLevelBounds(player, level.levelBounds);
    for (const solid of level.collisionGeometry) {
      if (overlaps(player, solid)) {
        player = { ...player, x: horizontal > 0 ? solid.x - player.width : solid.x + solid.width };
      }
    }

    velocityY += gravity * seconds;
    player = { ...player, y: player.y + velocityY * seconds };
    grounded = false;
    for (const solid of level.collisionGeometry) {
      if (overlaps(player, solid)) {
        if (velocityY >= 0 && previous.y + previous.height <= solid.y) {
          player = { ...player, y: solid.y - player.height };
          grounded = true;
        } else if (velocityY < 0 && previous.y >= solid.y + solid.height) {
          player = { ...player, y: solid.y + solid.height };
        }
        velocityY = 0;
      }
    }
    player = clampToLevelBounds(player, level.levelBounds);
  };

  const drawRect = (rect: Rect, camera: Vector, color: string) => {
    context.fillStyle = color;
    context.fillRect(rect.x - camera.x, rect.y - camera.y, rect.width, rect.height);
  };

  const render = () => {
    const camera = getCameraPosition(
      { x: player.x + player.width / 2, y: player.y + player.height / 2 },
      { width: canvas.width, height: canvas.height },
      level.levelBounds,
    );
    context.fillStyle = "#9edcf2";
    context.fillRect(0, 0, canvas.width, canvas.height);
    for (const platform of level.platforms) drawRect(platform, camera, "#4b8f58");
    for (const obstacle of level.obstacles) drawRect(obstacle, camera, "#6e4c3a");
    for (const hazard of level.hazards) drawRect(hazard, camera, "#d94b5b");
    drawRect(level.goalPosition, camera, "#f2c94c");
    drawRect(player, camera, "#9b51e0");
  };

  const frame = (time: number) => {
    const seconds = Math.min((time - lastTime) / 1000, 0.05);
    lastTime = time;
    update(seconds);
    render();
    animationFrame = requestAnimationFrame(frame);
  };

  return {
    start() {
      window.addEventListener("keydown", keyDown);
      window.addEventListener("keyup", keyUp);
      reset();
      lastTime = performance.now();
      animationFrame = requestAnimationFrame(frame);
    },
    stop() {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
    },
  };
}
