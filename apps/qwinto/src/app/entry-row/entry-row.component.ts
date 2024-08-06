import { Component, Input } from '@angular/core';
import { WebsocketService } from '../services/websocket.service';
import { GameService } from '../game.service';
import { CommonModule } from '@angular/common';
import { EntryComponent } from '../entry/entry.component';
import { combineLatest } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectMyTurn } from '../store/reducers';
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

  data$ = combineLatest({
    myTurn: this.store.select(selectMyTurn),
  });

  constructor(private store: Store) {
    // this.WebsocketService.messages.subscribe((msg) => {
    //   if (msg.action === 'rollSetAccepted') {
    //     if (this.data.key === msg.payload.rowKey) {
    //       this.data.entries[msg.payload.entryIdx].value = msg.payload.rollSum;
    //     }
    //   }
    // });
  }

  public setRoll(entry) {
    // if (!this.data$.value) return;
  }
}
