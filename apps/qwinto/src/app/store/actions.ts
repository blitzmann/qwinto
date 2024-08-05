import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { ClientEvents } from '../../../../../libs/lib/src/lib/events';
import { IPlayer, IRoom } from '../../../../../libs/lib/src';

export const gridActions = createActionGroup({
  source: 'grid',
  events: {
    'Get Empty Action': emptyProps(),
    [ClientEvents.PLAYER_JOINED]: props<IPlayer>(),
    [ClientEvents.PLAYER_LEFT]: props<{ player: IPlayer }>(),
    [ClientEvents.GAME_LOAD]: props<IRoom>(),
    'Join Response': props<{ playerID: string; roomCode: string }>(),
  },
});
