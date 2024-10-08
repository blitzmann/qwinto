export interface IRoomRequest {
  playerName: string;
}

export interface IJoinRoomRequest extends IRoomRequest {
  roomCode: string;
}
export interface IAttempt {
  num: number;
  values: IDie[] | null;
}

export interface ITurn {
  finalized: boolean;
  attempt: IAttempt;
  player: IPlayer | null;
  /** State of the dice on the table */
  diceState: Array<IDie>;
}

export interface IRoom {
  code: string;
  players: IPlayer[];
  turn: ITurn;
  settings: {
    rollAttempts: number;
    simulation: { interval: number; minWait: number };
  };
  gameStarted: boolean;
}

export interface IPlayer {
  id: string;
  socketID: string;
  name: string;
  roomCode: string;
  isIdle: boolean;
  isAdmin: boolean;
  joined: Date;
  sheet: IPlayerSheet;
  turnOver: boolean;
}

export interface IPlayerSheet {
  rows: IEntryRow[];
  failed: TEntry[];
}
export type TEntry = { value: number | null; bonus?: boolean } | null;
export type TEditableEntry = (TEntry & { _selectable: boolean }) | null;

export interface IEntryRow {
  color: string;
  key: dieColors;
  offset: number;
  entries: TEntry[];
}

export type dieColors = 'purple' | 'yellow' | 'orange';

export interface IDie {
  color: dieColors;
  value: number;
  selected: boolean;
}
