export interface IRoomRequest {
  playerName: string;
}

export interface IJoinRoomRequest extends IRoomRequest {
  roomCode: string;
}

export interface IRoom {
  code: string;
  players: IPlayer[];
  turn: {
    attempt: {
      num: number;
      values: IDie[] | null;
    };
    player: IPlayer | null;
  };
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

export interface IEntryRow {
  color: string;
  key: string;
  offset: number;
  entries: ({ value: number | null; bonus?: boolean } | null)[];
}

export type dieColors = 'purple' | 'yellow' | 'orange';

export interface IDie {
  color: dieColors;
  value: number;
}
