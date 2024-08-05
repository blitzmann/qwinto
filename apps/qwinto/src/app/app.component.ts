import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest } from 'rxjs';
import { selectGridState } from './store/reducers';
import { CommonModule } from '@angular/common';
import { gridActions } from './store/actions';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
import { GameService } from './game.service';

@Component({
  standalone: true,
  imports: [RouterModule, CommonModule, NgxJsonViewerModule],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  data$ = combineLatest({
    gameState: this.store.select(selectGridState),
  });

  public constructor(private store: Store, private GameService: GameService) {
    // this.store.dispatch(gridActions.player_joined({}));
  }
}
