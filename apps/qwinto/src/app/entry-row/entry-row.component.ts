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
  IAttempt,
  IEntryRow,
  IPlayerSheet,
  TEntry,
} from '../../../../../libs/lib/src';

type TEditableEntry = (TEntry & { _selectable: boolean }) | null;

@Component({
  standalone: true,
  imports: [CommonModule, EntryComponent],
  selector: 'app-entry-row',
  templateUrl: './entry-row.component.html',
  styleUrls: ['./entry-row.component.scss'],
})
export class EntryRowComponent {
  @Input() data;

  // todo: move this to a utility library as we can use it in server as well
  calculateSelectableEntries = (
    attempt: IAttempt,
    sheet: IPlayerSheet
  ): { key: string; entries: TEditableEntry[] }[] => {
    const selectedColors = attempt.values?.map((x) => x.color);
    const sum = attempt.values?.reduce((acc, x) => acc + x.value, 0) as number;
    const ret: { key: string; entries: TEditableEntry[] }[] = [];
    for (let row of sheet.rows) {
      const newEntries = row.entries.map((x) =>
        x === null ? null : { ...x, _selectable: false }
      );
      ret.push({ key: row.key, entries: newEntries });

      if (!selectedColors?.includes(row.key)) {
        // dice isn't selected, cannot assign entry in this row
        continue;
      }

      const values = new Set<number>(
        newEntries.map((x) => x?.value).filter(Boolean) as number[]
      );
      // check if any entries in this row have the same number
      if (values.has(sum)) {
        // number already exists in this row, cannot assign
        continue;
      }

      // get the max of all lower numbers
      let MaxLower = Math.max(...[...values].filter((x) => x < sum));
      let MinUpper = Math.min(...[...values].filter((x) => x > sum));

      const startingIdx =
        MaxLower === -Infinity
          ? 0
          : newEntries.indexOf(
              newEntries.find((x) => x?.value === MaxLower) as TEditableEntry
            ) + 1;
      const endingIdx =
        MinUpper === Infinity
          ? newEntries.length
          : newEntries.indexOf(
              newEntries.find((x) => x?.value === MinUpper) as TEditableEntry
            );

      // all before this are _selectable = false
      for (let i = startingIdx; i < endingIdx; i++) {
        // for each one of these, we need to make sure the column clears

        const normalizedIndex = i + row.offset;
        const colCheck = new Set(
          sheet.rows.map(
            (x) => x.entries[normalizedIndex - x.offset]?.value || -1
          )
        );

        const entry = newEntries[i];
        if (entry) {
          entry._selectable = !colCheck.has(sum);
        }
      }
    }

    return ret;
  };

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

      const augmentedEntries = this.calculateSelectableEntries(
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

  constructor(private store: Store) {}

  public setRoll(entry) {
    // if (!this.data$.value) return;
  }
}
