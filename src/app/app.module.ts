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

@NgModule({
  declarations: [
    AppComponent,
    GameRoomComponent,
    HomeComponent,
    PlayerListComponent,
    DieComponent,
  ],
  imports: [BrowserModule, AppRoutingModule, FormsModule],
  providers: [
    WebsocketService,
    { provide: LocationStrategy, useClass: HashLocationStrategy },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
