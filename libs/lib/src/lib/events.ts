export enum Events {
  CREATE_ROOM = 'create_room',
  JOIN_ROOM = 'join_room',
  RECONNECT = 'reconnect',
  START_GAME = 'start_game',

  PLAYER_JOINED = 'player_joined',
  PLAYER_LEFT = 'player_left',

  ROLL_ATTEMPT = 'roll_attempt',
  SET_ROLL = 'set_roll',
  ACCEPT_ROLL = 'accept_roll',

  RECIEVE_DIE_SELECTED = 'recieve_die_selected',
}

export enum ClientEvents {
  PLAYER_JOINED = 'player_joined',
  PLAYER_LEFT = 'player_left',

  /**
   * When joining a game, you need the whole state. This provideds it. Others will recieve the PLAYER_JOINED event
   */
  GAME_LOAD = 'game_load',

  PLAYER_ROLL = 'player_roll',
  NEXT_TURN = 'next_turn',
  ROLL_FINALIZED = 'roll_finalized',
  PLAYER_SET_ENTRY = 'player_set_entry',
  DICE_SELECTED = 'dice_selected',
}
