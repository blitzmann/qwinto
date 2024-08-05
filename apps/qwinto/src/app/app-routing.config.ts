import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GameRoomComponent } from './game-room/game-room.component';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
  {
    path: ':roomCode/:playerID',
    component: GameRoomComponent,
  },
  { path: 'home', component: HomeComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' }, // Redirect to /home by default
  { path: '**', redirectTo: '/home' }, // Redirect to the home route if the URL doesn't match any defined routes.
];
