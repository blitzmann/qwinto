import { Component } from '@angular/core';
import { combineLatest, interval } from 'rxjs';
import { WebsocketService } from '../services/websocket.service';
import { GameService } from '../game.service';
import { Socket } from 'ngx-socket-io';
import { Events, IDie } from '../../../../../libs/lib/src';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DieComponent } from '../die/die.component';
import { Store } from '@ngrx/store';
import {
  selectCurrentRollValue,
  selectCurrentTurn,
  selectGameSettings,
  selectMyTurn,
} from '../store/reducers';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, DieComponent],
  selector: 'app-die-selection',
  templateUrl: './die-selection.component.html',
  styleUrls: ['./die-selection.component.scss'],
})
export class DieSelectionComponent {
  public dice: Array<IDie & { selected: boolean }> = [
    { color: 'orange', value: 1, selected: false },
    { color: 'yellow', value: 1, selected: false },
    { color: 'purple', value: 1, selected: false },
  ];

  data$ = combineLatest({
    myTurn: this.store.select(selectMyTurn),
    currentTurn: this.store.select(selectCurrentTurn),
    currentRollValue: this.store.select(selectCurrentRollValue),
    gameSettings: this.store.select(selectGameSettings),
  });

  public $myTurn = this.store.selectSignal(selectMyTurn);

  private intervalID;
  constructor(private socket: Socket, private store: Store) {
    // this.WebsocketService.messages.subscribe((msg) => {
    //   if (msg.action === 'rollDiceResponse') {
    //     clearInterval(this.intervalID);
    //     this.intervalID = null;
    //     for (let die of msg.payload.dice) {
    //       let myDie = this.dice.find((x) => x.color === die.color);
    //       if (myDie) {
    //         myDie.value = die.value;
    //       }
    //     }
    //   }
    // });
  }

  private simulateDiceRole(selectedDice) {
    for (let die of selectedDice) {
      die.value = Math.floor(Math.random() * 6) + 1;
    }
  }

  public rollSelected() {
    if (this.intervalID) {
      return;
    }

    const selectedDice = this.dice.filter((x) => x.selected);

    // Start the interval with a constant rate (e.g., every 100 milliseconds)
    this.intervalID = setInterval(() => {
      this.simulateDiceRole(selectedDice);
    }, 100);

    setTimeout(() => {
      clearInterval(this.intervalID);
      this.intervalID = null;
      this.socket.emit(Events.ROLL_ATTEMPT, selectedDice, (data) => {
        // todo: check to make sure samecolors come back. If not, throw an error
        for (let die of data) {
          let myDie = this.dice.find((x) => x.color === die.color);
          if (myDie) {
            myDie.value = die.value;
          }
        }
      });
    }, 750);
  }

  public selectDie(die) {
    // todo: prevent selection if this is not the first attempt
    die.selected = !die.selected;
  }
}
