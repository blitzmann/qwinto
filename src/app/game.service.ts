import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { WebsocketService } from './services/websocket.service';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  public roomCode!: string;
  public playerID!: string;
  public playersTurn!: boolean;
  public rollSum!: number;

  constructor(private WebsocketService: WebsocketService) {
    this.WebsocketService.messages.subscribe((msg) => {
      if (['gameStarted', 'newTurn'].includes(msg.action)) {
        this.playersTurn = msg.payload.player.id === this.playerID;
      }
      if (msg.action === 'gameState') {
        this.playersTurn = msg.payload.turn.player?.id === this.playerID;
      }
    });
  }
}
