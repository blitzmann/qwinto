import { Component } from '@angular/core';
import { WebsocketService } from '../services/websocket.service';

@Component({
  selector: 'app-player-list',
  templateUrl: './player-list.component.html',
  styleUrls: ['./player-list.component.scss'],
})
export class PlayerListComponent {
  public players: any[] = [];

  constructor(private WebsocketService: WebsocketService) {
    this.WebsocketService.messages.subscribe((msg) => {
      if (['playerJoined', 'playerLeft'].includes(msg.action)) {
        this.players = msg.payload.players;
      }
      if (['gameState'].includes(msg.action)) {
        this.players = msg.payload.players;
      }
    });
  }
}
