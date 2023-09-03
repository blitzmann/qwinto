import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { WebsocketService } from './services/websocket.service';
import { FormsModule } from '@angular/forms';
import { GameRoomComponent } from './game-room/game-room.component';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { HomeComponent } from './home/home.component';
import { PlayerListComponent } from './player-list/player-list.component';
import { DieComponent } from './die/die.component';
import { EntryComponent } from './entry/entry.component';
import { EntryRowComponent } from './entry-row/entry-row.component';
import { GameSheetComponent } from './game-sheet/game-sheet.component';
import { DieSelectionComponent } from './die-selection/die-selection.component';

@NgModule({
  declarations: [
    AppComponent,
    GameRoomComponent,
    HomeComponent,
    PlayerListComponent,
    DieComponent,
    EntryComponent,
    EntryRowComponent,
    GameSheetComponent,
    DieSelectionComponent,
  ],
  imports: [BrowserModule, AppRoutingModule, FormsModule],
  providers: [
    WebsocketService,
    { provide: LocationStrategy, useClass: HashLocationStrategy },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
