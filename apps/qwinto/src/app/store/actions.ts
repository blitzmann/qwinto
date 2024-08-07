import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { ClientEvents, Events } from '../../../../../libs/lib/src/lib/events';
import { IAttempt, IPlayer, IRoom, ITurn } from '../../../../../libs/lib/src';

export const gridActions = createActionGroup({
  source: 'grid',
  events: {
    'Get Empty Action': emptyProps(),
    [ClientEvents.PLAYER_JOINED]: props<IPlayer>(),
    [ClientEvents.PLAYER_LEFT]: props<{ player: IPlayer }>(),
    [ClientEvents.GAME_LOAD]: props<IRoom>(),
    [Events.START_GAME]: props<ITurn>(),
    [ClientEvents.PLAYER_ROLL]: props<IAttempt>(),
    'Join Response': props<{ playerID: string; roomCode: string }>(),
  },
});
