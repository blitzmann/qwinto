import { Component, OnInit } from '@angular/core';
import {
  ActivatedRoute,
  NavigationEnd,
  NavigationStart,
  Router,
} from '@angular/router';
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
import { Store } from '@ngrx/store';
import { gridActions } from '../store/actions';

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

  isInAppNavigation: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private GameService: GameService,
    private socket: Socket,
    private router: Router,
    private store: Store
  ) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.isInAppNavigation = event.id !== 1;
      }
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.roomCode = params['roomCode'];
      this.playerID = params['playerID'];

      this.store.dispatch(
        // todo: rename this, or rather revisit since the whole join / reconnect should be revisited
        gridActions.joinResponse({
          roomCode: this.roomCode,
          playerID: this.playerID,
        })
      );

      if (this.isInAppNavigation) {
        return;
      }

      // todo: we need to have some sort of token to verify the authenticity of the player ID, otherwise we'll just have a "join" command.
      this.socket.emit(Events.RECONNECT, {
        roomCode: this.roomCode,
        playerID: this.playerID,
      });

      this.GameService.roomCode = this.roomCode;
      this.GameService.playerID = this.playerID;
    });
  }

  public startGame() {
    this.socket.emit(Events.START_GAME, {
      roomCode: this.GameService.roomCode,
    });
  }
}
