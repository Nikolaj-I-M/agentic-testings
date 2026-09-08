export interface Entity {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly color: string;
}

export interface Level {
  readonly width: number;
  readonly height: number;
  readonly entity: Entity;
}
