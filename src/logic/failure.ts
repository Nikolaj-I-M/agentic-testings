export interface Rectangle {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface Player extends Rectangle {}

export interface Hazard extends Rectangle {
  readonly id: string;
}

export interface LevelBounds {
  readonly left: number;
  readonly right: number;
  readonly lower: number;
}

export interface LevelResetState {
  readonly playerStart: Rectangle;
  readonly checkpoint?: Rectangle;
  readonly resetEntities?: () => void;
}

export type FailureReason = "hazard" | "out-of-bounds";

export interface PlayerFailedEvent {
  readonly reason: FailureReason;
  readonly hazardId?: string;
  readonly player: Rectangle;
}

export type PlayerFailedListener = (event: PlayerFailedEvent) => void;

export interface FailureControllerOptions {
  readonly bounds: LevelBounds;
  readonly resetState: LevelResetState;
  readonly hazards: readonly Hazard[];
  readonly onPlayerFailed?: PlayerFailedListener;
  readonly onGameStateFailure?: PlayerFailedListener;
  readonly onFailureFeedback?: PlayerFailedListener;
}

export interface FailureController {
  update(player: Player): Player | undefined;
  restart(): Player;
}

function overlaps(first: Rectangle, second: Rectangle): boolean {
  return first.x < second.x + second.width
    && first.x + first.width > second.x
    && first.y < second.y + second.height
    && first.y + first.height > second.y;
}

function isOutOfBounds(player: Rectangle, bounds: LevelBounds): boolean {
  return player.y > bounds.lower
    || player.x + player.width < bounds.left
    || player.x > bounds.right;
}

function copyRectangle(rectangle: Rectangle): Rectangle {
  return { ...rectangle };
}

export function createFailureController(
  options: FailureControllerOptions,
): FailureController {
  let failureHandled = false;
  let player = copyRectangle(options.resetState.playerStart);

  const restart = (clearFailureLatch = true): Player => {
    const checkpoint = options.resetState.checkpoint;
    const spawn = checkpoint ?? options.resetState.playerStart;
    player = copyRectangle(spawn);
    options.resetState.resetEntities?.();
    if (clearFailureLatch) {
      failureHandled = false;
    }
    return copyRectangle(player);
  };

  const update = (nextPlayer: Player): Player | undefined => {
    player = copyRectangle(nextPlayer);
    if (failureHandled) {
      return undefined;
    }

    const hazard = options.hazards.find((candidate) => overlaps(player, candidate));
    const reason: FailureReason | undefined = hazard !== undefined
      ? "hazard"
      : isOutOfBounds(player, options.bounds)
        ? "out-of-bounds"
        : undefined;

    if (reason === undefined) {
      return undefined;
    }

    failureHandled = true;
    const event: PlayerFailedEvent = {
      reason,
      ...(hazard === undefined ? {} : { hazardId: hazard.id }),
      player: copyRectangle(player),
    };
    options.onPlayerFailed?.(event);
    options.onGameStateFailure?.(event);
    options.onFailureFeedback?.(event);
    return restart(false);
  };

  return { update, restart };
}
