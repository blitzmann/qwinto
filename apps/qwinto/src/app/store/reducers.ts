import { createFeature, createReducer, createSelector, on } from '@ngrx/store';
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
    }),
    on(gridActions.start_game, (state, turn) => {
      debugger;
      return {
        ...state,
        roomState: { ...state.roomState, gameStarted: true, turn },
      };
    }),
    on(gridActions.player_roll, (state, attempt) => {
      debugger;
      return {
        ...state,
        roomState: {
          ...state.roomState,
          turn: { ...state.roomState.turn, attempt },
        },
      };
    })
  ),
});

export const selectCurrentTurn = createSelector(
  gridFeature.selectRoomState,
  (roomState) => {
    return roomState.turn;
  }
);
export const selectGameSettings = createSelector(
  gridFeature.selectRoomState,
  (roomState) => {
    return roomState.settings;
  }
);

export const selectCurrentRollValue = createSelector(
  selectCurrentTurn,
  (turn) => {
    return {
      total:
        turn.attempt.values
          ?.map((x) => x.value)
          .reduce((acc, x) => acc + x, 0) || 0,
      values: turn.attempt.values?.map((x) => x.value),
    };
  }
);
export const selectMyTurn = createSelector(
  gridFeature.selectRoomState,
  gridFeature.selectPlayerID,
  (roomState, playerID) => {
    return roomState.turn.player?.id === playerID;
  }
);

export const selectIsAdmin = createSelector(
  gridFeature.selectRoomState,
  gridFeature.selectPlayerID,
  (roomState, playerID) => {
    return roomState.players.find((x) => x.id === playerID)?.isAdmin || false;
  }
);

export const {
  name: gridFeatureKey,
  selectGridState,
  selectRoomState,
  selectRoomCode,
  selectPlayerID,
  reducer: gridReducer,
} = gridFeature;
