import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {
  catchError,
  combineLatest,
  finalize,
  first,
  from,
  interval,
  map,
  mergeMap,
  noop,
  of,
  race,
  switchMap,
  takeUntil,
  tap,
  timer,
  withLatestFrom,
} from 'rxjs';
import { gridActions } from './actions';
import { Socket } from 'ngx-socket-io';
import { ClientEvents, Events } from '../../../../../libs/lib/src';
import {
  selectCurrentTurn,
  selectGameSettings,
  selectMyTurn,
} from './reducers';
import { Store } from '@ngrx/store';

export const simulateRoll = createEffect(
  (
    actions$ = inject(Actions),
    store = inject(Store),
    socket = inject(Socket)
  ) => {
    return actions$.pipe(
      ofType(gridActions.roll_attempt),
      withLatestFrom(
        store.select(selectCurrentTurn),
        store.select(selectMyTurn)
      ),
      switchMap(([action, turn, myTurn]) => {
        console.log('-> Roll Attempt');
        // 1. Send WebSocket signal
        socket.emit(
          Events.ROLL_ATTEMPT,
          turn.diceState.filter((d) => d.selected)
        );
        return of(gridActions.simulateRoll({ remoteStarted: false }));
      })
    );
  },
  { functional: true }
);

export const player_roll_remote_simulation = createEffect(
  (
    actions$ = inject(Actions),
    store = inject(Store),
    socket = inject(Socket)
  ) => {
    return actions$.pipe(
      ofType(gridActions.player_roll),
      withLatestFrom(store.select(selectMyTurn)),
      switchMap(([action, myTurn]) => {
        console.log('-> Player Roll (simulate effect)', action, myTurn);
        return !myTurn
          ? of(
              gridActions.simulateRoll({ remoteStarted: true, attempt: action })
            )
          : of(gridActions.noop());
      })
    );
  },
  { functional: true }
);

export const rollSimulation = createEffect(
  (
    actions$ = inject(Actions),
    store = inject(Store),
    socket = inject(Socket)
  ) => {
    return actions$.pipe(
      ofType(gridActions.simulateRoll),
      withLatestFrom(
        store.select(selectCurrentTurn),
        store.select(selectGameSettings)
      ),
      switchMap(([action, turn, settings]) => {
        debugger;
        console.log('simulate roll', action, turn);
        // need to run the bottom code regardless of if the current window started the roll, or if it's a signal from
        // our main interval
        const interval$ = interval(settings.simulation.interval);
        // Timer to emit after 500ms
        const timer$ = timer(settings.simulation.minWait);

        // Server event observable from the store
        const serverEvent$ = action.remoteStarted
          ? of(action.attempt)
          : actions$.pipe(
              //   tap((a) => console.log('Server Event', a)),
              ofType(gridActions.player_roll),
              first() // We only care about the first occurrence of this event
            );

        let serverRollSet;

        // Combined condition observable: both 500ms and the server event have happened
        const stopCondition$ = combineLatest([timer$, serverEvent$]).pipe(
          first(), // We only care when the first occurrence happens
          //   tap(([_, serverEvent]) => console.log('Stop Condition', serverEvent)),
          tap(([_, serverEvent]) => (serverRollSet = serverEvent)) // Store the server event
        );

        return interval$.pipe(
          takeUntil(stopCondition$), // Stop when both conditions are satisfied
          map(() => {
            console.log('Interval Tick');
            const newDice = turn.diceState
              .filter((d) => d.selected)
              .map((d) => ({ ...d, value: Math.floor(Math.random() * 6) + 1 }));
            return gridActions.updateDiceValues({ selected: newDice });
          }),
          //   withLatestFrom(serverEvent$), // Could not ge this to work with finalize, so the roll set is stored outside the pipe
          finalize(() => {
            console.log('Finalize', serverRollSet);
            store.dispatch(
              gridActions.updateDiceValues({
                selected: serverRollSet.values,
                final: true,
              })
            );
          })
        );
      })
    );
  },
  { functional: true }
);

export const dieSelected = createEffect(
  (actions$ = inject(Actions), socket = inject(Socket)) => {
    return actions$.pipe(
      ofType(gridActions.dice_selected),
      switchMap((die) => {
        console.log('-> Die Selected', die);
        socket.emit(ClientEvents.DICE_SELECTED, die);
        return of(gridActions.recieve_die_selected(die));
      })
    );
  },
  { functional: true }
);
