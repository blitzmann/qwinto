import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WebsocketService } from '../services/websocket.service';

@Component({
  selector: 'app-game-room',
  templateUrl: './game-room.component.html',
  styleUrls: ['./game-room.component.scss'],
})
export class GameRoomComponent implements OnInit {
  public roomCode!: string;
  public playerID!: string;

  constructor(
    private route: ActivatedRoute,
    private WebsocketService: WebsocketService
  ) {
    this.WebsocketService.messages.subscribe((msg) => {
      if (msg.action === 'gameState') {
      }
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.roomCode = params['roomCode'];
      this.playerID = params['playerID'];

      this.WebsocketService.messages.next({
        action: 'gameState',
        payload: {
          roomCode: this.roomCode,
          playerID: this.playerID,
        },
      });
    });
  }
}
