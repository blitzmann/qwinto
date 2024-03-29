import { Component, Input } from '@angular/core';
import { WebsocketService } from '../services/websocket.service';
import { GameService } from '../game.service';
@Component({
  selector: 'app-entry-row',
  templateUrl: './entry-row.component.html',
  styleUrls: ['./entry-row.component.scss'],
})
export class EntryRowComponent {
  @Input() data;
  public get playersTurn() {
    return this.GameService.playersTurn;
  }

  public rollSum = -1;

  constructor(
    private WebsocketService: WebsocketService,
    private GameService: GameService
  ) {
    this.WebsocketService.messages.subscribe((msg) => {
      if (msg.action === 'rollSetAccepted') {
        if (this.data.key === msg.payload.rowKey) {
          this.data.entries[msg.payload.entryIdx].value = msg.payload.rollSum;
        }
      }
    });
  }

  public setRoll(entry) {
    if (!this.playersTurn) return;

    this.WebsocketService.messages.next({
      action: 'rollSet',
      payload: {
        rowKey: this.data.key,
        entryIdx: this.data.entries.indexOf(entry),
      },
    });
  }
}
