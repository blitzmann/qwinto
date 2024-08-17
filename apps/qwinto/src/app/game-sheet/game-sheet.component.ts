import { Component, Input } from '@angular/core';
import { WebsocketService } from '../services/websocket.service';
import { GameService } from '../game.service';
import { EntryRowComponent } from '../entry-row/entry-row.component';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Store } from '@ngrx/store';
import { IAppState, selectGridState } from '../store/reducers';
import { IPlayer, IRoom } from '../../../../../libs/lib/src';
import { FailedRowComponent } from '../failed-row/failed-row.component';

type Entry = { value: number; bonus?: boolean; _selectable?: boolean };

@Component({
  standalone: true,
  imports: [CommonModule, EntryRowComponent, FailedRowComponent],
  selector: 'app-game-sheet',
  templateUrl: './game-sheet.component.html',
  styleUrls: ['./game-sheet.component.scss'],
})
export class GameSheetComponent {
  public rollSum = -1;

  data$ = combineLatest({
    playerSheet: this.store
      .select(selectGridState)
      .pipe(
        map(
          (state: IAppState) =>
            (<IPlayer>(
              state.roomState.players.find(
                (player) => player.id === state.playerID
              )
            ))?.sheet
        )
      ),
  });

  constructor(private store: Store, private GameService: GameService) {
    // this.GameService.players$.subscribe((players) => {
    //   const me = players.find((x) => x.id === this.GameService.playerID);
    //   if (!me) return; // todo: error
    //   this.playerSheet = me.sheet;
    // });
    // this.WebsocketService.messages.subscribe((msg) => {
    //   if (
    //     msg.action === 'rollDiceResponse' &&
    //     msg.payload.playerID === this.GameService.playerID
    //   ) {
    //     for (let dieRoll of msg.payload.dice) {
    //       const row = this.playerSheet.rows.find(
    //         (x) => x.key === dieRoll.color
    //       );
    //       if (row) {
    //         // determine which entries it can go on
    //         this.rollSum = msg.payload.rollSum;
    //         this.GameService.rollSum = this.rollSum;
    //         this.markEntriesAsSelectable(
    //           row,
    //           this.rollSum,
    //           this.playerSheet.rows
    //         );
    //       }
    //     }
    //   }
    // });
  }
}
