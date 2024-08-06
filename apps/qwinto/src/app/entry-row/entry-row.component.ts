import { Component, Input } from '@angular/core';
import { WebsocketService } from '../services/websocket.service';
import { GameService } from '../game.service';
import { CommonModule } from '@angular/common';
import { EntryComponent } from '../entry/entry.component';
import { combineLatest } from 'rxjs';
import { createSelector, Store } from '@ngrx/store';
import {
  selectCurrentRollValue,
  selectCurrentTurn,
  selectMyTurn,
  selectPlayerID,
  selectRoomState,
} from '../store/reducers';
import {
  calculateSelectableEntries,
  Events,
  IAttempt,
  IEntryRow,
  IPlayerSheet,
  TEntry,
} from '../../../../../libs/lib/src';
import { Socket } from 'ngx-socket-io';

@Component({
  standalone: true,
  imports: [CommonModule, EntryComponent],
  selector: 'app-entry-row',
  templateUrl: './entry-row.component.html',
  styleUrls: ['./entry-row.component.scss'],
})
export class EntryRowComponent {
  @Input() data;

  //
  /**
   * This is a special selector that takes the rows from the data store and modified
   * the entries to have a _selectable property, which is set based on whether or not
   * the player can set the roll to that entry.
   */
  private selectRowWithSelectable = createSelector(
    selectRoomState,
    selectPlayerID,
    selectCurrentTurn,
    (roomState, playerID, currentTurn) => {
      const mySheet = roomState.players.find((x) => x.id === playerID)?.sheet;

      const augmentedEntries = calculateSelectableEntries(
        currentTurn.attempt,
        mySheet as IPlayerSheet
      );
      return augmentedEntries.find((x) => x.key === this.data.key)?.entries;
      //?.entries.map((x) => x?._selectable);
    }
  );

  data2$ = combineLatest({
    myTurn: this.store.select(selectMyTurn),
    entries: this.store.select(this.selectRowWithSelectable),
  });

  constructor(private store: Store, private socket: Socket) {}

  public setRoll(index) {
    this.socket.emit(Events.SET_ROLL, {
      rowKey: this.data.key,
      entryIdx: index,
    });
  }
}
