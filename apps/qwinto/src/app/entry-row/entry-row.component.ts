import { Component, Input } from '@angular/core';
import { WebsocketService } from '../services/websocket.service';
import { GameService } from '../game.service';
import { CommonModule } from '@angular/common';
import { EntryComponent } from '../entry/entry.component';
@Component({
  standalone: true,
  imports: [CommonModule, EntryComponent],
  selector: 'app-entry-row',
  templateUrl: './entry-row.component.html',
  styleUrls: ['./entry-row.component.scss'],
})
export class EntryRowComponent {
  @Input() data;

  public rollSum = -1;
  public myTurn$ = this.GameService.myTurn$;

  constructor(private GameService: GameService) {
    // this.WebsocketService.messages.subscribe((msg) => {
    //   if (msg.action === 'rollSetAccepted') {
    //     if (this.data.key === msg.payload.rowKey) {
    //       this.data.entries[msg.payload.entryIdx].value = msg.payload.rollSum;
    //     }
    //   }
    // });
  }

  public setRoll(entry) {
    if (!this.GameService.myTurn$.value) return;
  }
}
