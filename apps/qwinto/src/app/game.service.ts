import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { WebsocketService } from './services/websocket.service';

import { Socket } from 'ngx-socket-io';
import { map } from 'rxjs/operators';
import { Events, IPlayer, IRoom } from '../../../../libs/lib/src';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  public roomCode!: string;
  public playerID!: string;
  public rollSum!: number;
  public gameState!: IRoom;
  public players$ = new Subject<IPlayer[]>();
  public myTurn$ = new BehaviorSubject<boolean>(true);
  public gameStarted$ = new BehaviorSubject<boolean>(false);

  constructor(private socket: Socket) {
    this.socket.on(Events.PLAYER_JOINED, (data) => {
      this.players$.next(data.players);
    });
    this.socket.on(Events.PLAYER_LEFT, (data) => {
      this.players$.next(data.players);
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
