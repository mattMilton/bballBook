import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { GamePage } from './game.page';
import { TimerComponent } from 'src/app/components/timer/timer.component';
import { PlaysComponent } from 'src/app/components/plays/plays.component';
import { ScoreboardComponent } from 'src/app/components/scoreboard/scoreboard.component';

const routes: Routes = [
  {
    path: '',
    component: GamePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [GamePage, TimerComponent, PlaysComponent, ScoreboardComponent]
})
export class GamePageModule {}
