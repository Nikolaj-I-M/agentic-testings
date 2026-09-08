import { defineConfig } from "vitest/config";

export default defineConfig({
  base: "./",
  server: {
    host: "localhost",
  },
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
  },
});
