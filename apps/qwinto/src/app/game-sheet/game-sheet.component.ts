import { Component, Input } from '@angular/core';
import { WebsocketService } from '../services/websocket.service';
import { GameService } from '../game.service';
import { EntryRowComponent } from '../entry-row/entry-row.component';

type Entry = { value: number; bonus?: boolean; _selectable?: boolean };

@Component({
  selector: 'app-game-sheet',
  templateUrl: './game-sheet.component.html',
  styleUrls: ['./game-sheet.component.scss'],
})
export class GameSheetComponent {
  @Input() playerSheet = {
    rows: [
      {
        color: 'orangered',
        key: 'orange',
        offset: 2,
        entries: [
          { value: null },
          { value: null, bonus: true },
          { value: 5 },
          null,
          { value: null },
          { value: 10, bonus: true },
          { value: null },
          { value: null },
          { value: null },
          { value: null },
        ],
      },
      {
        color: '#d1c714',
        key: 'yellow',
        offset: 1,
        entries: [
          { value: null },
          { value: null },
          { value: 4 },
          { value: null },
          { value: null },
          null,
          { value: null },
          { value: null, bonus: true },
          { value: null },
          { value: null },
        ],
      },
      {
        color: '#2e3796',
        key: 'purple',
        offset: 0,
        entries: [
          { value: null },
          { value: null },
          { value: null, bonus: true },
          { value: null },
          null,
          { value: null },
          { value: null },
          { value: null },
          { value: null },
          { value: null, bonus: true },
        ],
      },
    ],
  };

  public rollSum = -1;
  constructor(
    private WebsocketService: WebsocketService,
    private GameService: GameService
  ) {
    this.WebsocketService.messages.subscribe((msg) => {
      if (
        msg.action === 'rollDiceResponse' &&
        msg.payload.playerID === this.GameService.playerID
      ) {
        for (let dieRoll of msg.payload.dice) {
          const row = this.playerSheet.rows.find(
            (x) => x.key === dieRoll.color
          );
          if (row) {
            // determine which entries it can go on
            this.rollSum = msg.payload.rollSum;
            this.GameService.rollSum = this.rollSum;
            this.markEntriesAsSelectable(
              row,
              this.rollSum,
              this.playerSheet.rows
            );
          }
        }
      }
    });
  }

  markEntriesAsSelectable(row, checkNumber, allRows) {
    const arr = row.entries.filter(Boolean);
    // mark all as non selectable.
    arr.forEach((element) => {
      element._selectable = false;
    });

    // first, get a list of entry values
    let values = new Set<number>(arr.map((x) => x.value).filter(Boolean));
    if (values.has(checkNumber)) {
      // we know already that it can't be in this row, return
      return;
    }

    // get the max of all lower numbers
    let MaxLower = Math.max(...[...values].filter((x) => x < checkNumber));
    let MinUpper = Math.min(...[...values].filter((x) => x > checkNumber));
    const startingIdx =
      MaxLower === -Infinity
        ? 0
        : arr.indexOf(arr.find((x) => x.value === MaxLower)) + 1;
    const endingIdx =
      MinUpper === Infinity
        ? arr.length
        : arr.indexOf(arr.find((x) => x.value === MinUpper));
    // all before this are _selectable = false
    for (let i = startingIdx; i < endingIdx; i++) {
      // for each one of these, we need to make sure the column clears

      const normalizedIndex = i + row.offset;
      const colCheck = new Set(
        allRows.map((x) => x.entries[normalizedIndex - x.offset]?.value || -1)
      );
      arr[i]._selectable = !colCheck.has(this.rollSum);
    }
  }
}
