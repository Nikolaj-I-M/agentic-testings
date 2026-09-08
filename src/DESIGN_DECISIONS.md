# Design Decisions

This document resolves the core gameplay questions for the first playable level
of **McSquishy: Blob on the Run**. These are initial defaults for implementation
and may be revisited if playtesting reveals usability or difficulty problems.

## 1. Lives and failure

The first level uses a **single-life attempt**. Contact with a hazard or falling
outside the playable area immediately ends the attempt and enters the game
over/failure state. The player can then restart at the beginning of the level;
there is no persistent stock of lives.

This keeps failure easy to understand and keeps the short-level experience
focused on movement and timing. It clarifies **Functional Requirements §4**
(hazard and fall failures and restart behavior) and **§6** (the game over /
failure state and restarting after failure).

## 2. Checkpoints

The first level has **no mid-level checkpoints**. Every restart begins at the
level's defined starting position. The level should remain short enough that
replaying it after a failure is reasonable.

This selects the “beginning of the level” option in **Functional Requirements
§4** and provides a concrete scope boundary for the first level.

## 3. Completion, scoring, and collectibles

The first level uses **binary pass/fail completion**. Reaching the clearly
identified goal completes the level; there is no score, countdown timer,
collectible total, combo system, or ranking. The game displays completion
feedback and allows the player to restart after completing the level.

This keeps the first level aligned with the simple, accessible design and
clarifies the completion and feedback behavior required by **Functional
Requirements §5** (and the restart behavior in **§6**).

## 4. Visual style guide

The art direction expands the description's “colourful, playful, and slightly
absurd” style without requiring final art assets:

- Use a bright, saturated palette: McSquishy in blob pink `#FF6B9A`, platforms
  in warm yellow `#FFD166`, hazards in alert red-orange `#EF476F`, background
  sky in light blue `#8ED8F8`, and foliage or safe accents in green `#70C97A`.
- Prefer rounded silhouettes, soft corners, simple readable shapes, and strong
  contrast between safe platforms and hazards.
- Give McSquishy's movement personality through exaggerated squash-and-stretch,
  a brief stretch during jumps, and a visible squash on landing or failure.
- Keep expressions and environmental details playful and mildly absurd, while
  preserving clear silhouettes so hazards and the goal remain immediately
  understandable.

This provides concrete guidance for the visual style described in
`DESCRIPTION.md` and supports the readability expected by **Functional
Requirements §3**, §4, and §5.

## 5. First-level hazards and obstacles

The first level is one short side-scrolling course with the following initial
layout budget:

- **2 spike pits**, each made visually obvious with a short approach and a
  reachable platform on the far side.
- **1 moving hazard**, such as a horizontally moving enemy or obstacle, placed
  after the first spike pit so the mechanic is introduced in sequence.
- **3 platforming gaps total**: the 2 spike pits plus 1 ordinary gap, to
  provide basic movement and jump timing without adding new systems.
- **4 static platform obstacles**, such as raised platforms, low ceilings, or
  staggered ledges, to create route and jump variation.
- **1 clearly marked end goal** after the final obstacle.

These counts are an approximate sizing target rather than a fixed map layout.
Together they provide the platforms, obstacles, hazards, starting position,
camera-following traversal, and end goal required by **Functional Requirements
§3**, while exercising the hazard, fall-failure, and restart rules in **§4**.
