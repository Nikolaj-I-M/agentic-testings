# Levels

Levels are declarative objects loaded with `loadLevel`. A level supplies `levelBounds`,
`startPosition`, `goalPosition`, and arrays of rectangular `platforms`, `obstacles`, and
`hazards`. The loader validates all coordinates and exposes solid platforms and obstacles
as `collisionGeometry`.

The starter level is exported from `starter-level.ts`. Hazard damage and goal completion
are intentionally left to their respective gameplay systems.
