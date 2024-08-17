import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { ClientEvents, Events } from '../../../../../libs/lib/src/lib/events';
import {
  IAttempt,
  IDie,
  IPlayer,
  IRoom,
  ITurn,
} from '../../../../../libs/lib/src';

export const gridActions = createActionGroup({
  source: 'grid',
  events: {
    [ClientEvents.PLAYER_JOINED]: props<IPlayer>(),
    [ClientEvents.PLAYER_LEFT]: props<{ player: IPlayer }>(),
    [ClientEvents.GAME_LOAD]: props<IRoom>(),
    [Events.START_GAME]: props<ITurn>(),
    [ClientEvents.PLAYER_ROLL]: props<IAttempt>(),
    [ClientEvents.NEXT_TURN]: props<{ turn: ITurn; previousPlayer: IPlayer }>(),
    [ClientEvents.ROLL_FINALIZED]: emptyProps(),
    [ClientEvents.PLAYER_SET_ENTRY]: props<IPlayer>(),
    [Events.ROLL_ATTEMPT]: props<{ selected: Array<IDie> }>(),
    'update dice values': props<any>(),

    [Events.RECIEVE_DIE_SELECTED]: props<Pick<IDie, 'color' | 'selected'>>(),
    [ClientEvents.DICE_SELECTED]: props<Pick<IDie, 'color' | 'selected'>>(),
    'Join Response': props<{ playerID: string; roomCode: string }>(),

    noop: emptyProps(),
  },
});
