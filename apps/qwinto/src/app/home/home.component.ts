import { Component } from '@angular/core';
import { GameService } from '../game.service';
import { Router } from '@angular/router';
import { Socket } from 'ngx-socket-io';
import { Events } from '../../../../../libs/lib/src';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  public playerName!: string;
  public roomCode!: string;

  constructor(private router: Router, private socket: Socket) {
    // this.playerName = 'Ryan';
    // this.create();
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
