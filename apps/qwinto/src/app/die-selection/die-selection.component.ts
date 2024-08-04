import { Component } from '@angular/core';
import { dieColors } from '../die/die.component';
import { interval } from 'rxjs';
import { WebsocketService } from '../services/websocket.service';
import { GameService } from '../game.service';

@Component({
  selector: 'app-die-selection',
  templateUrl: './die-selection.component.html',
  styleUrls: ['./die-selection.component.scss'],
})
export class DieSelectionComponent {
  public dice: { color: dieColors; value: number; selected: boolean }[] = [
    { color: 'orange', value: 1, selected: false },
    { color: 'yellow', value: 1, selected: false },
    { color: 'purple', value: 1, selected: false },
  ];

  private intervalID;
  public myTurn$ = this.GameService.myTurn$;
  constructor(
    private WebsocketService: WebsocketService,
    private GameService: GameService
  ) {
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
      this.WebsocketService.messages.next({
        action: 'rollDice',
        payload: { dice: selectedDice },
      });
    }, 750);
  }

  public selectDie(die) {
    // todo: prevent selection if this is not the first attempt
    die.selected = !die.selected;
  }
}
