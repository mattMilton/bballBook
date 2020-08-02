import { Component, OnInit } from '@angular/core';
import { GameService } from 'src/app/services/game.service';
import { PlaysLogService } from 'src/app/services/plays-log.service';
import { Output, EventEmitter } from '@angular/core';
import { OnCourtHistoryService } from 'src/app/services/on-court-history.service';


@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss'],
})
export class TimerComponent implements OnInit {

  @Output() periodStart = new EventEmitter();
  @Output() timeChange = new EventEmitter();

  period: number = 1;
  periodMinutes: number;
  timeLeft: number = this.periodMinutes * 60;
  interval;
  clockRunning: boolean;

  constructor(public gameService: GameService,
      public plays: PlaysLogService,
      public onCourtHistory: OnCourtHistoryService) { }

  ngOnInit() {
    // console.log(this.gameService.periodMinutes);
    this.periodMinutes = this.gameService.periodMinutes;
    this.timeLeft = this.periodMinutes * 60;
    // console.log(this.periodMinutes);
    this.clockRunning = false;     // to be dealt with, when first hitting start,
    // clock sets period and time, then needs to be hit again to run clock,
    // when adding this, bool in conditional operations, another press was needed.
  }

  startTimer() {
    if (!this.clockRunning){  // start the clock, 

      this.interval = setInterval(() => {
        if (this.timeLeft > 0) {
          this.timeLeft--;
          if (!this.onCourtHistory.latestOnCourt) {
            this.timeChange.emit({ event: event, period: this.period, timeLeft: this.timeLeft});
          }
        } else {
          if (this.period < this.gameService.periods) {
            if (this.period > 0){
              this.plays.periodEnd(this.period);
            }
            this.period++;
            this.timeLeft = this.periodMinutes * 60;
            clearInterval(this.interval);
            this.clockRunning = false;
          }
        }
      }, 1000);
      
      // if start of a period, emit the event, with period number to parent,
      // which will emit it to game to determine if tip-off, or if possesion arrow
      // determines possession
      if (this.timeLeft == this.periodMinutes * 60) {
        this.periodStart.emit({ event: event, period: this.period});
      }
      // set clock to running
      this.clockRunning = true;
    } else {
      this.pauseTimer();
      this.clockRunning = false;
    }
  }

  pauseTimer() {
    clearInterval(this.interval);
  }

  incMinutes() {
    this.timeLeft += 60;
    if (this.timeLeft > this.periodMinutes * 60) {
      this.timeLeft = this.periodMinutes * 60;
    }
    this.timeChange.emit({ event: event, period: this.period, timeLeft: this.timeLeft });
  }

  decMinutes() {
    this.timeLeft -= 60;
    if (!this.onCourtHistory.latestOnCourt) {
      this.timeChange.emit({ event: event, period: this.period, timeLeft: this.timeLeft});
    }
  }

  incSeconds() {
    if (this.timeLeft < this.periodMinutes * 60) {
      this.timeLeft++;
    }
    this.timeChange.emit({ event: event, period: this.period, timeLeft: this.timeLeft });
  }
  
  decSeconds() {
    this.timeLeft--;
      if (!this.onCourtHistory.latestOnCourt) {
        this.timeChange.emit({ event: event, period: this.period, timeLeft: this.timeLeft});
      }
  }
  
  incPeriod() {
    if (this.period < this.gameService.periods) {
      this.period++;
    }
    if (!this.onCourtHistory.latestOnCourt) {
      this.timeChange.emit({ event: event, period: this.period, timeLeft: this.timeLeft});
    }
  }
  
  decPeriod() {
    if (this.period > 1){
      this.period--;
    }
    this.timeChange.emit({ event: event, period: this.period, timeLeft: this.timeLeft});
  }

  getMinutes(): number {
    return Math.floor(this.timeLeft / 60);
  }

  getSeconds(): number {
    return this.timeLeft % 60;
  }
}
