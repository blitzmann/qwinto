import { createFeature, createReducer, createSelector, on } from '@ngrx/store';
import {
  ClientEvents,
  IDie,
  IPlayer,
  IRoom,
} from '../../../../../libs/lib/src';
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
    settings: { rollAttempts: 0, simulation: { interval: 0, minWait: 0 } },
    players: [],
    gameStarted: false,
    turn: {
      finalized: false,
      player: null,
      attempt: {
        num: 0,
        values: null,
      },
      diceState: [
        { color: 'orange', value: 1, selected: false },
        { color: 'yellow', value: 1, selected: false },
        { color: 'purple', value: 1, selected: false },
      ],
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
    }),
    on(gridActions.next_turn, (state, data) => {
      const players = [
        ...state.roomState.players.map((x) => ({ ...x, turnOver: false })),
      ];

      return {
        ...state,
        roomState: {
          ...state.roomState,
          turn: data.turn, // sets the new player as well as resets attempts
          players,
        },
      };
    }),
    on(gridActions.roll_finalized, (state) => {
      return {
        ...state,
        roomState: {
          ...state.roomState,
          turn: { ...state.roomState.turn, finalized: true },
        },
      };
    }),
    on(gridActions.player_set_entry, (state, player) => {
      debugger;
      const players = [...state.roomState.players];
      // replace the player object in `players` with the new one from data
      const playerIndex = players.findIndex((x) => x.id === player.id);
      players[playerIndex] = player;

      return {
        ...state,
        roomState: {
          ...state.roomState,
          players, // includes new info about the previous player's sheet
        },
      };
    }),
    on(gridActions.recieve_die_selected, (state, die) => {
      // debugger;
      // const players = [...state.roomState.players];
      // // replace the player object in `players` with the new one from data
      // const playerIndex = players.findIndex((x) => x.id === player.id);
      // players[playerIndex] = player;

      return {
        ...state,
        roomState: {
          ...state.roomState,
          turn: {
            ...state.roomState.turn,
            diceState: state.roomState.turn.diceState.map((x) =>
              x.color === die.color ? { ...x, selected: die.selected } : x
            ),
          },
        },
      };
    }),
    on(gridActions.updateDiceValues, (state, dice) => {
      console.log('-> Update Dice Values', dice);
      return {
        ...state,
        roomState: {
          ...state.roomState,
          turn: {
            ...state.roomState.turn,
            diceState: state.roomState.turn.diceState.map((x) => {
              const die = dice.selected.find((d) => d.color === x.color);
              return die ? die : x;
            }),
          },
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

export const selectMyPlayer = createSelector(
  gridFeature.selectRoomState,
  gridFeature.selectPlayerID,
  (roomState, playerID) => {
    return roomState.players.find((x) => x.id === playerID) as IPlayer;
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
