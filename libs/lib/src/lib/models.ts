export interface ICreateRoomRequest {
  playerName: string;
}

export interface IJoinRoomRequest extends ICreateRoomRequest {
  roomCode: string;
}

export interface IRoom {
  code: string;
  players: IPlayer[];
  turn: any;
  settings: any;
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
}

export interface IEntryRow {
  color: string;
  key: string;
  offset: number;
  entries: ({ value: number | null; bonus?: boolean } | null)[];
}
