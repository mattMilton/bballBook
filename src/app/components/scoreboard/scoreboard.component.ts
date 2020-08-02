import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { Output, EventEmitter } from '@angular/core';
import { TimerComponent } from '../timer/timer.component';
import { GameService } from 'src/app/services/game.service';
import { Team } from 'src/app/model/team';

@Component({
  selector: 'app-scoreboard',
  templateUrl: './scoreboard.component.html',
  styleUrls: ['./scoreboard.component.scss'],
})
export class ScoreboardComponent implements OnInit {

  @Output() periodStart = new EventEmitter();
  @Output() timeChange = new EventEmitter();
  @Output() timeOutEmitter = new EventEmitter();
  @Output() jumpBallEmitter = new EventEmitter();
  @ViewChild(TimerComponent, {static: true}) timerReference;

  constructor(public gameService: GameService) { }

  ngOnInit() {}

  periodStartParent($event) {
    this.periodStart.emit({ event: event, period: $event.period});
  }

  timeChangeParent($event) {
    this.timeChange.emit({ event: event, period: $event.period, timeLeft: $event.timeLeft});
  }

  timeOut(team: string){
    this.timeOutEmitter.emit({event: event, team: team});
  }

  jumpBall() {
    this.jumpBallEmitter.emit();
  }

  stopClock() {
    this.timerReference.pauseTimer();
  }
}
