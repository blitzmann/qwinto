import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { WebsocketService } from './services/websocket.service';

import { Socket } from 'ngx-socket-io';
import { map } from 'rxjs/operators';
import { ClientEvents, Events, IPlayer, IRoom } from '../../../../libs/lib/src';
import { Store } from '@ngrx/store';
import { gridActions } from './store/actions';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  public roomCode!: string;
  public playerID!: string;
  public rollSum!: number;
  public myTurn$ = new BehaviorSubject<boolean>(true);
  public gameStarted$ = new BehaviorSubject<boolean>(false);

  constructor(private socket: Socket, private store: Store) {
    this.socket.on(ClientEvents.PLAYER_JOINED, (data) => {
      this.store.dispatch(gridActions.player_joined(data.player));
    });
    this.socket.on(Events.PLAYER_LEFT, (data) => {
      this.store.dispatch(gridActions.player_left(data.player));
    });
    this.socket.on(ClientEvents.GAME_LOAD, (data) => {
      this.store.dispatch(gridActions.game_load(data));
    });
    this.socket.on(Events.START_GAME, (data) => {
      this.gameStarted$.next(true);
    });
  }

  sendMessage(message, payload) {
    this.socket.emit(message, payload);
  }
  getMessage() {
    // return this.socket.fromEvent('message').pipe(map((data) => data.msg));
  }
}

// export class GameService {
//   public roomCode!: string;
//   public playerID!: string;
//   public playersTurn!: boolean;
//   public rollSum!: number;

//   constructor(private WebsocketService: WebsocketService) {
//     this.WebsocketService.messages.subscribe((msg) => {
//       if (['gameStarted', 'newTurn'].includes(msg.action)) {
//         this.playersTurn = msg.payload.player.id === this.playerID;
//       }
//       if (msg.action === 'gameState') {
//         this.playersTurn = msg.payload.turn.player?.id === this.playerID;
//       }
//     });
//   }
// }
