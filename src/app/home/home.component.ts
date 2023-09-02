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
      if (msg.action !== 'roomCode') {
        return;
      }
      const { roomCode, playerID } = msg.payload;
      this.router.navigate([roomCode, playerID]);
    });
  }

  public create() {
    this.WebsocketService.messages.next({
      action: 'createRoom',
      payload: { playerName: this.playerName },
    });
  }
  public join() {}
}
