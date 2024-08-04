import { Component } from '@angular/core';
import { GameService } from '../game.service';
import { Router } from '@angular/router';
import { Socket } from 'ngx-socket-io';
import { Events } from '../../../../../libs/lib/src';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  public playerName!: string;
  public roomCode!: string;

  constructor(
    private GameService: GameService,
    private router: Router,
    private socket: Socket
  ) {
    // this.WebsocketService.messages.subscribe((msg) => {
    //   if (msg.action === 'roomCode') {
    //     // created a room
    //     const { roomCode, playerID } = msg.payload;
    //     this.router.navigate([roomCode, playerID]);
    //   }
    //   if (msg.action === 'playerJoined') {
    //     // joined a room. The client recieves this message if they've been added tot he room, so random clients shouldn't recieve it
    //     const { player } = msg.payload;
    //     this.router.navigate([this.roomCode, player.id]);
    //   }
    // });
    this.playerName = 'Ryan';
    this.create();
  }

  public create() {
    this.socket.emit(
      Events.CREATE_ROOM,
      {
        playerName: this.playerName,
      },
      this.handleJoin.bind(this)
    );
  }
  public join() {
    this.socket.emit(
      Events.JOIN_ROOM,
      {
        roomCode: this.roomCode,
        playerName: this.playerName,
      },
      this.handleJoin.bind(this)
    );
  }

  private handleJoin(data) {
    this.router.navigate([data.roomCode, data.playerID]);
  }
}
