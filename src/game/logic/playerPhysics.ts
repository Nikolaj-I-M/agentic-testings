/**
 * Pure player simulation data and update logic.
 *
 * `position` is the player's top-left corner. The exposed position, velocity,
 * and grounded state can be consumed independently by rendering, hazards, and
 * level-completion logic.
 */
export interface Vector2 {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Solid {
  position: Vector2;
  size: Size;
}

export interface Player {
  position: Vector2;
  velocity: Vector2;
  size: Size;
  grounded: boolean;
}

export interface PlayerInput {
  left?: boolean;
  right?: boolean;
  jump?: boolean;
}

export interface PlayerPhysicsConfig {
  gravity: number;
  jumpVelocity: number;
  moveSpeed: number;
  terminalVelocity: number;
}

export const DEFAULT_PLAYER_PHYSICS: Readonly<PlayerPhysicsConfig> = {
  gravity: 1800,
  jumpVelocity: 620,
  moveSpeed: 240,
  terminalVelocity: 1200,
};

const CONTACT_EPSILON = 1e-7;

function overlapsOnAxis(
  firstStart: number,
  firstSize: number,
  secondStart: number,
  secondSize: number,
): boolean {
  return (
    firstStart < secondStart + secondSize &&
    firstStart + firstSize > secondStart
  );
}

function overlaps(player: Player, solid: Solid): boolean {
  return (
    overlapsOnAxis(
      player.position.x,
      player.size.width,
      solid.position.x,
      solid.size.width,
    ) &&
    overlapsOnAxis(
      player.position.y,
      player.size.height,
      solid.position.y,
      solid.size.height,
    )
  );
}

function crossesHorizontalBoundary(
  previous: Player,
  next: Player,
  solid: Solid,
): boolean {
  const previousRight = previous.position.x + previous.size.width;
  const nextRight = next.position.x + next.size.width;
  return (
    (previousRight <= solid.position.x && nextRight > solid.position.x) ||
    (previous.position.x >= solid.position.x + solid.size.width &&
      next.position.x < solid.position.x + solid.size.width)
  );
}

function crossesVerticalBoundary(
  previous: Player,
  next: Player,
  solid: Solid,
): boolean {
  const previousBottom = previous.position.y + previous.size.height;
  const nextBottom = next.position.y + next.size.height;
  return (
    (previousBottom <= solid.position.y && nextBottom > solid.position.y) ||
    (previous.position.y >= solid.position.y + solid.size.height &&
      next.position.y < solid.position.y + solid.size.height)
  );
}

function resolveHorizontalCollision(player: Player, solid: Solid): void {
  const playerRight = player.position.x + player.size.width;
  const solidRight = solid.position.x + solid.size.width;
  const pushLeft = playerRight - solid.position.x;
  const pushRight = solidRight - player.position.x;

  if (player.velocity.x > 0 || (player.velocity.x === 0 && pushLeft <= pushRight)) {
    player.position.x = solid.position.x - player.size.width;
  } else {
    player.position.x = solidRight;
  }
  player.velocity.x = 0;
}

function resolveVerticalCollision(player: Player, solid: Solid): void {
  const playerBottom = player.position.y + player.size.height;
  const solidBottom = solid.position.y + solid.size.height;
  const pushUp = playerBottom - solid.position.y;
  const pushDown = solidBottom - player.position.y;

  if (player.velocity.y > 0 || (player.velocity.y === 0 && pushUp <= pushDown)) {
    player.position.y = solid.position.y - player.size.height;
    player.grounded = true;
  } else {
    player.position.y = solidBottom;
  }
  player.velocity.y = 0;
}

function hasSupport(player: Player, solid: Solid): boolean {
  const playerBottom = player.position.y + player.size.height;
  return (
    Math.abs(playerBottom - solid.position.y) <= CONTACT_EPSILON &&
    overlapsOnAxis(
      player.position.x,
      player.size.width,
      solid.position.x,
      solid.size.width,
    )
  );
}

/**
 * Advances one player physics step without mutating the supplied player,
 * input, or solids.
 */
export function updatePlayerPhysics(
  player: Player,
  input: PlayerInput,
  solids: readonly Solid[],
  deltaTime: number,
  config: PlayerPhysicsConfig = DEFAULT_PLAYER_PHYSICS,
): Player {
  const next: Player = {
    position: { ...player.position },
    velocity: { ...player.velocity },
    size: { ...player.size },
    grounded: false,
  };
  const dt = Math.max(0, deltaTime);
  const previousPosition = { ...next.position };

  if (input.left === true && input.right !== true) {
    next.velocity.x = -config.moveSpeed;
  } else if (input.right === true && input.left !== true) {
    next.velocity.x = config.moveSpeed;
  } else {
    next.velocity.x = 0;
  }

  if (input.jump === true && player.grounded) {
    next.velocity.y = -config.jumpVelocity;
  }
  next.velocity.y = Math.min(
    next.velocity.y + config.gravity * dt,
    config.terminalVelocity,
  );

  next.position.x += next.velocity.x * dt;
  next.position.y += next.velocity.y * dt;

  const previous = { ...next, position: previousPosition };
  for (const solid of solids) {
    if (
      overlaps(next, solid) ||
      (crossesHorizontalBoundary(previous, next, solid) &&
        overlapsOnAxis(
          next.position.y,
          next.size.height,
          solid.position.y,
          solid.size.height,
        ))
    ) {
      resolveHorizontalCollision(next, solid);
    }
  }
  for (const solid of solids) {
    if (
      overlaps(next, solid) ||
      (crossesVerticalBoundary(previous, next, solid) &&
        overlapsOnAxis(
          next.position.x,
          next.size.width,
          solid.position.x,
          solid.size.width,
        ))
    ) {
      resolveVerticalCollision(next, solid);
    }
  }
  if (!next.grounded && next.velocity.y >= 0) {
    next.grounded = solids.some((solid) => hasSupport(next, solid));
    if (next.grounded) {
      next.velocity.y = 0;
    }
  }

  return next;
}
