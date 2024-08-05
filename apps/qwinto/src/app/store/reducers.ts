import { createFeature, createReducer, on } from '@ngrx/store';
import { ClientEvents, IPlayer, IRoom } from '../../../../../libs/lib/src';
import { gridActions } from './actions';

export interface IAppState {
  roomState: IRoom;
  playerID: string | null;
  roomCode: string | null;
}

const initialState: IAppState = {
  playerID: null,
  roomCode: null,
  roomState: {
    code: '',
    settings: { rollAttempts: 0 },
    players: [],
    gameStarted: false,
    turn: {
      player: null,
      attempt: {
        num: 0,
        values: null,
      },
    },
  },
};

const gridFeature = createFeature({
  name: 'grid',
  reducer: createReducer(
    initialState,
    on(gridActions.player_joined, (state, player) => {
      return {
        ...state,
        roomState: {
          ...state.roomState,
          players: [...state.roomState.players, player],
        },
      };
    }),
    on(gridActions.game_load, (state, room) => {
      return { ...state, roomState: room };
    }),
    on(gridActions.joinResponse, (state, room) => {
      return { ...state, playerID: room.playerID, roomCode: room.roomCode };
    })
  ),
});

export const {
  name: gridFeatureKey,
  selectGridState,
  reducer: gridReducer,
} = gridFeature;
