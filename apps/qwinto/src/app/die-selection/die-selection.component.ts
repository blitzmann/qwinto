import { Component } from '@angular/core';
import { combineLatest, interval } from 'rxjs';
import { WebsocketService } from '../services/websocket.service';
import { GameService } from '../game.service';
import { Socket } from 'ngx-socket-io';
import { Events, IDie } from '../../../../../libs/lib/src';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DieComponent } from '../die/die.component';
import { createSelector, Store } from '@ngrx/store';
import {
  selectCurrentRollValue,
  selectCurrentTurn,
  selectGameSettings,
  selectMyTurn,
} from '../store/reducers';
import { gridActions } from '../store/actions';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, DieComponent],
  selector: 'app-die-selection',
  templateUrl: './die-selection.component.html',
  styleUrls: ['./die-selection.component.scss'],
})
export class DieSelectionComponent {
  data$ = combineLatest({
    myTurn: this.store.select(selectMyTurn),
    currentTurn: this.store.select(selectCurrentTurn),
    currentRollValue: this.store.select(selectCurrentRollValue),
    gameSettings: this.store.select(selectGameSettings),
    canSelect: this.store.select(
      createSelector(selectMyTurn, selectCurrentTurn, (myTurn, currentTurn) => {
        return myTurn && currentTurn.attempt.num === 0;
      })
    ),
  });

  public $myTurn = this.store.selectSignal(selectMyTurn);

  constructor(private socket: Socket, private store: Store) {}

  public rollSelected() {
    this.store.dispatch(gridActions.roll_attempt());
  }

  public acceptRoll() {
    this.socket.emit(Events.ACCEPT_ROLL);
  }

  public selectDie(die: IDie) {
    // todo: prevent selection if this is not the first attempt
    console.log('Die Selected', die);
    this.store.dispatch(
      gridActions.dice_selected({ color: die.color, selected: !die.selected })
    );
  }
}
