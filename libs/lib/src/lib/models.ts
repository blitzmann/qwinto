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
  attempt: IAttempt;
  player: IPlayer | null;
}

export interface IRoom {
  code: string;
  players: IPlayer[];
  turn: ITurn;
  settings: {
    rollAttempts: number;
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
}

export interface IPlayerSheet {
  rows: IEntryRow[];
  failed: ({ value: number | null; bonus?: boolean } | null)[];
}
export type TEntry = { value: number | null; bonus?: boolean } | null;

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
}
