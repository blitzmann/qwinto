import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WebsocketService } from '../services/websocket.service';
import { GameService } from '../game.service';
import { Socket } from 'ngx-socket-io';
import {
  Events,
  IPlayer,
  IPlayerSheet,
  IRoom,
} from '../../../../../libs/lib/src';
import { Subject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { GameSheetComponent } from '../game-sheet/game-sheet.component';
import { DieSelectionComponent } from '../die-selection/die-selection.component';
import { PlayerListComponent } from '../player-list/player-list.component';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    GameSheetComponent,
    DieSelectionComponent,
    PlayerListComponent,
  ],
  selector: 'app-game-room',
  templateUrl: './game-room.component.html',
  styleUrls: ['./game-room.component.scss'],
})
export class GameRoomComponent implements OnInit {
  public roomCode!: string;
  public playerID!: string;
  public gameStarted$ = this.GameService.gameStarted$;
  public playerSheet$ = new Subject<IPlayerSheet>();

  constructor(
    private route: ActivatedRoute,
    private GameService: GameService,
    private socket: Socket
  ) {
    this.GameService.players$.subscribe((players) => {
      const me = players.find((x) => x.id === this.GameService.playerID);
      if (!me) return;
      this.playerSheet$.next(me?.sheet);
    });
    // this.WebsocketService.messages.subscribe((msg) => {
    //   if (msg.action === 'gameState') {
    //   }
    //   if (msg.action === 'gameStarted') {
    //     // Game started command will send whose turn it is
    //   }
    // });
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.roomCode = params['roomCode'];
      this.playerID = params['playerID'];

      this.GameService.roomCode = this.roomCode;
      this.GameService.playerID = this.playerID;

      this.socket.emit(
        Events.GAME_STATE,
        {
          roomCode: this.roomCode,
          playerID: this.playerID,
        },
        (data) => {
          debugger;
          this.GameService.gameState = data;
          this.GameService.players$.next(data.players);
        }
      );
    });
  }

  public startGame() {
    this.socket.emit(Events.START_GAME, {
      roomCode: this.GameService.roomCode,
    });
  }
}
