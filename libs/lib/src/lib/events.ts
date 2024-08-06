export enum Events {
  CREATE_ROOM = 'create_room',
  JOIN_ROOM = 'join_room',
  RECONNECT = 'reconnect',
  START_GAME = 'start_game',

  PLAYER_JOINED = 'player_joined',
  PLAYER_LEFT = 'player_left',

  ROLL_ATTEMPT = 'roll_attempt',
}

export enum ClientEvents {
  PLAYER_JOINED = 'player_joined',
  PLAYER_LEFT = 'player_left',

  /**
   * When joining a game, you need the whole state. This provideds it. Others will recieve the PLAYER_JOINED event
   */
  GAME_LOAD = 'game_load',

  PLAYER_ROLL = 'player_roll',
}
