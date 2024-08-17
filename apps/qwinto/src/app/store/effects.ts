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

export const rollSimulation = createEffect(
  (actions$ = inject(Actions), socket = inject(Socket)) => {
    return actions$.pipe(
      ofType(gridActions.roll_attempt),
      switchMap((action) => {
        console.log('-> Roll Attempt');
        // 1. Send WebSocket signal
        socket.emit(Events.ROLL_ATTEMPT, action.selected);

        // our main interval
        const interval$ = interval(100);

        // Timer to emit after 500ms
        const timer$ = timer(1500).pipe(tap(() => console.log('1500ms timer'))); // Emit after 500ms

        // Server event observable from the store
        const serverEvent$ = actions$.pipe(
          ofType(gridActions.player_roll),
          first() // We only care about the first occurrence of this event
        );

        let serverRollSet;

        // Combined condition observable: both 500ms and the server event have happened
        const stopCondition$ = combineLatest([timer$, serverEvent$]).pipe(
          first(), // We only care when the first occurrence happens
          tap(([_, serverEvent]) => (serverRollSet = serverEvent)) // Store the server event
        );

        return interval$.pipe(
          takeUntil(stopCondition$), // Stop when both conditions are satisfied
          map(() => {
            console.log('Interval Tick');
            return gridActions.updateDiceValues();
          }),
          //   withLatestFrom(serverEvent$), // Could not ge this to work with finalize, so the roll set is stored outside the pipe
          finalize(() => console.log('Roll Simulation Complete', serverRollSet))
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
