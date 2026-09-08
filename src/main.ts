import { createGame } from "./game/bootstrap.js";

const canvas = document.querySelector<HTMLCanvasElement>("#game");
if (!canvas) {
  throw new Error("The game canvas was not found");
}

canvas.width = 960;
canvas.height = 540;
createGame(canvas).start();
