import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

test("logic modules do not depend on rendering or browser globals", () => {
  const logicDirectory = path.dirname(fileURLToPath(import.meta.url));
  const sourceFiles = fs.readdirSync(logicDirectory).filter((file) => file.endsWith(".ts") && !file.endsWith(".test.ts"));

  for (const file of sourceFiles) {
    const source = fs.readFileSync(path.join(logicDirectory, file), "utf8");
    assert.doesNotMatch(source, /from ["'][^"']*render\//);
    assert.doesNotMatch(source, /\b(window|document|HTMLElement|HTMLCanvasElement)\b/);
  }
});
