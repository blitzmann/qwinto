import { Component } from '@angular/core';
import { WebsocketService } from '../services/websocket.service';
import { Socket } from 'ngx-socket-io';
import { Events, IRoom } from '../../../../../libs/lib/src';
import { GameService } from '../game.service';
import { CommonModule } from '@angular/common';
import { combineLatest, map } from 'rxjs';
import { Store } from '@ngrx/store';
import {
  IAppState,
  selectCurrentTurn,
  selectGridState,
  selectIsAdmin,
  selectMyPlayer,
} from '../store/reducers';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-player-list',
  templateUrl: './player-list.component.html',
  styleUrls: ['./player-list.component.scss'],
})
export class PlayerListComponent {
  data$ = combineLatest({
    players: this.store
      .select(selectGridState)
      .pipe(map((state: IAppState) => state.roomState.players)),
    currentTurn: this.store.select(selectCurrentTurn),
    isAdmin: this.store.select(selectIsAdmin),
  });

  constructor(private store: Store, private GameService: GameService) {
    // this.WebsocketService.messages.subscribe((msg) => {
    //   if (['playerJoined', 'playerLeft'].includes(msg.action)) {
    //     this.players = msg.payload.players;
    //   }
    //   if (['gameState'].includes(msg.action)) {
    //     this.players = msg.payload.players;
    //   }
    // });
  }
}
