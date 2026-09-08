export type GameState = "playing" | "levelCompleted";

export interface Vector2 {
  x: number;
  y: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PlayerStart {
  position: Vector2;
  size?: {
    width: number;
    height: number;
  };
}

export interface PlayerDefinition {
  position: Vector2;
  size: {
    width: number;
    height: number;
  };
  velocity: Vector2;
}

export interface Goal {
  bounds: BoundingBox;
}

export interface Platform {
  bounds: BoundingBox;
}

export interface LevelDefinition {
  player: PlayerStart;
  goal: Goal;
  platforms?: Platform[];
}

export interface InputState {
  left?: boolean;
  right?: boolean;
  jump?: boolean;
}

export interface LevelCompletedEvent {
  readonly type: "levelCompleted";
  readonly player: Readonly<PlayerDefinition>;
}

export interface GameEvents {
  levelCompleted?: (event: LevelCompletedEvent) => void;
}

export function boxesOverlap(first: BoundingBox, second: BoundingBox): boolean {
  return (
    first.x < second.x + second.width &&
    first.x + first.width > second.x &&
    first.y < second.y + second.height &&
    first.y + first.height > second.y
  );
}

function cloneVector(vector: Vector2): Vector2 {
  return { x: vector.x, y: vector.y };
}

function cloneBounds(bounds: BoundingBox): BoundingBox {
  return { ...bounds };
}

function cloneLevel(level: LevelDefinition): LevelDefinition {
  return {
    player: { position: cloneVector(level.player.position) },
    goal: { bounds: cloneBounds(level.goal.bounds) },
    ...(level.platforms === undefined
      ? {}
      : { platforms: level.platforms.map((platform) => ({ bounds: cloneBounds(platform.bounds) })) }),
  };
}

function createPlayer(level: LevelDefinition): PlayerDefinition {
  return {
    position: cloneVector(level.player.position),
    size: { ...(level.player.size ?? { width: 1, height: 1 }) },
    velocity: { x: 0, y: 0 },
  };
}

/**
 * Owns one level run and is deliberately independent from rendering and UI.
 */
export class Game {
  private readonly initialLevel: LevelDefinition;
  private level: LevelDefinition;
  private readonly events: GameEvents;
  private completed = false;
  private state: GameState = "playing";
  private player: PlayerDefinition;

  public constructor(level: LevelDefinition, events: GameEvents = {}) {
    this.initialLevel = cloneLevel(level);
    this.level = cloneLevel(level);
    this.player = createPlayer(this.level);
    this.events = events;
  }

  public getState(): GameState {
    return this.state;
  }

  public getPlayer(): Readonly<PlayerDefinition> {
    return {
      position: cloneVector(this.player.position),
      size: { ...this.player.size },
      velocity: cloneVector(this.player.velocity),
    };
  }

  public getLevel(): LevelDefinition {
    return cloneLevel(this.level);
  }

  public isCompleted(): boolean {
    return this.completed;
  }

  public update(input: InputState = {}): void {
    if (this.completed) {
      return;
    }

    this.applyInput(input);
    this.resolvePlatformCollisions();
    this.checkGoal();
  }

  /**
   * Starts a fresh run without replacing the Game instance or its subscribers.
   */
  public restart(): void {
    this.level = cloneLevel(this.initialLevel);
    this.player = createPlayer(this.level);
    this.completed = false;
    this.state = "playing";
  }

  private applyInput(input: InputState): void {
    const direction = Number(Boolean(input.right)) - Number(Boolean(input.left));
    this.player.velocity.x = direction;
    this.player.position.x += this.player.velocity.x;
    if (input.jump) {
      this.player.velocity.y = -1;
    }
    this.player.position.y += this.player.velocity.y;
  }

  private resolvePlatformCollisions(): void {
    for (const platform of this.level.platforms ?? []) {
      const playerBounds = this.playerBounds();
      if (
        this.player.velocity.y >= 0 &&
        playerBounds.x < platform.bounds.x + platform.bounds.width &&
        playerBounds.x + playerBounds.width > platform.bounds.x &&
        playerBounds.y + playerBounds.height > platform.bounds.y &&
        playerBounds.y < platform.bounds.y
      ) {
        this.player.position.y = platform.bounds.y - this.player.size.height;
        this.player.velocity.y = 0;
      }
    }
  }

  private checkGoal(): void {
    if (boxesOverlap(this.playerBounds(), this.level.goal.bounds)) {
      this.completed = true;
      this.state = "levelCompleted";
      this.events.levelCompleted?.({
        type: "levelCompleted",
        player: this.getPlayer(),
      });
    }
  }

  private playerBounds(): BoundingBox {
    return {
      x: this.player.position.x,
      y: this.player.position.y,
      width: this.player.size.width,
      height: this.player.size.height,
    };
  }
}

export interface LevelCompletionController {
  onLevelCompleted(event: LevelCompletedEvent): void;
  restart(): void;
}
