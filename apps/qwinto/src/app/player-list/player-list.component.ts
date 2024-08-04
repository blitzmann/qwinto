import { Component } from '@angular/core';
import { WebsocketService } from '../services/websocket.service';
import { Socket } from 'ngx-socket-io';
import { Events } from '../../../../../libs/lib/src';
import { GameService } from '../game.service';

@Component({
  selector: 'app-player-list',
  templateUrl: './player-list.component.html',
  styleUrls: ['./player-list.component.scss'],
})
export class PlayerListComponent {
  public players = this.GameService.players$;

  constructor(private socket: Socket, private GameService: GameService) {
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
