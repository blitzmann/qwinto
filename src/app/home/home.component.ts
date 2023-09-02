import { Component } from '@angular/core';
import { WebsocketService } from '../services/websocket.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  public playerName!: string;
  public roomCode!: string;

  constructor(
    private WebsocketService: WebsocketService,
    private router: Router
  ) {
    this.WebsocketService.messages.subscribe((msg) => {
      if (msg.action === 'roomCode') {
        // created a room
        const { roomCode, playerID } = msg.payload;
        this.router.navigate([roomCode, playerID]);
      }
      if (msg.action === 'playerJoined') {
        // joined a room. The client recieves this message if they've been added tot he room, so random clients shouldn't recieve it
        const { player } = msg.payload;
        this.router.navigate([this.roomCode, player.id]);
      }
    });
  }

  public create() {
    this.WebsocketService.messages.next({
      action: 'createRoom',
      payload: { playerName: this.playerName },
    });
  }
  public join() {
    this.WebsocketService.messages.next({
      action: 'joinRoom',
      payload: { playerName: this.playerName, roomCode: this.roomCode },
    });
  }
}
