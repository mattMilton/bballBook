import { Component, OnInit } from '@angular/core';
import { GameService } from 'src/app/services/game.service';
import { PlaysLogService } from 'src/app/services/plays-log.service';
import { Output, EventEmitter } from '@angular/core';
import { OnCourtHistoryService } from 'src/app/services/on-court-history.service';

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss']
})
export class TimerComponent implements OnInit {

  @Output() periodStart = new EventEmitter();
  @Output() timeChange = new EventEmitter();
  @Output() anyTimeChange = new EventEmitter();

  period: number = 1;
  periodMinutes: number;
  timeLeft: number;
  interval;
  clockRunning: boolean;

  constructor(public gameService: GameService,
      public plays: PlaysLogService,
      public onCourtHistory: OnCourtHistoryService) {

        console.log("in timer constructor");
      }
      
  ngOnInit() {
    // console.log(this.gameService.periodMinutes);
    this.periodMinutes = this.gameService.periodMinutes;
    
    // set clock if time in localStorage
    var timeData = JSON.parse(localStorage.getItem('time'));
  
    if (timeData) {
      console.log("got timeData");
      this.period = timeData.period;
      this.timeLeft = timeData.timeLeft;
    } else {
      this.timeLeft = this.periodMinutes * 60;
    }
    
    this.clockRunning = false;     
    
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
          } else {
            // end of regulation/OT scenario
            if (this.period >= this.gameService.periods) {
              
              if (this.gameService.endOfRegulation()) { // true condition means OT
                this.plays.periodEnd(this.period);
                this.period++; // period will now be greater than periods
                this.timeLeft = this.gameService.overtimeMinutes * 60;
                clearInterval(this.interval);
                this.clockRunning = false;
              } else {
                // should have something done here reporting end of last period, at 
                // very least for plays log. gameService.endOfRegulation could deal 
                // with setting a value in gameService about game being over, 
                // and that could be referenced for end game options stuff
              }
            }
          }
        }
        localStorage.setItem('time', JSON.stringify({period: this.period, timeLeft: this.timeLeft, running: this.clockRunning}));
      }, 1000);
      
      // if start of a period, emit the event, with period number to parent,
      // which will emit it to game to determine if tip-off, or if possesion arrow
      // determines possession
      if (this.timeLeft == this.periodMinutes * 60) {
        this.periodStart.emit({ event: event, period: this.period});
      }
      if (this.period > this.gameService.periods && this.timeLeft == this.gameService.overtimeMinutes * 60) {
        this.periodStart.emit({ event: event, period: this.period });
      }
      // set clock to running
      this.clockRunning = true;
    } else {
      this.clockRunning = false;
      this.pauseTimer();
    }
  }

  pauseTimer() {
    // localStorage.setItem('time', JSON.stringify({period: this.period, timeLeft: this.timeLeft, running: this.clockRunning}));
    clearInterval(this.interval);
  }

  incMinutes() {
    this.timeLeft += 60;
    if (this.period > this.gameService.periods) {
      if (this.timeLeft > this.gameService.overtimeMinutes * 60) {
        this.timeLeft = this.gameService.overtimeMinutes * 60;
      }
    } else if (this.timeLeft > this.periodMinutes * 60) {
      this.timeLeft = this.periodMinutes * 60;
    }
    this.timeChange.emit({ event: event, period: this.period, timeLeft: this.timeLeft });
    localStorage.setItem('time', JSON.stringify({period: this.period, timeLeft: this.timeLeft, running: this.clockRunning}));
  }

  decMinutes() {
    this.timeLeft -= 60;
    if (this.timeLeft < 0) {
      this.timeLeft = 0;
    }
    if (!this.onCourtHistory.latestOnCourt) {
      this.timeChange.emit({ event: event, period: this.period, timeLeft: this.timeLeft});
    } 
    localStorage.setItem('time', JSON.stringify({period: this.period, timeLeft: this.timeLeft, running: this.clockRunning}));
  }

  incSeconds() {
    if (this.period > this.gameService.periods) {
      if (this.timeLeft < this.gameService.overtimeMinutes * 60) {
        this.timeLeft++;
      } 
    } 
    else if (this.timeLeft < this.periodMinutes * 60) {
      this.timeLeft++;
    }
    this.timeChange.emit({ event: event, period: this.period, timeLeft: this.timeLeft });
    localStorage.setItem('time', JSON.stringify({period: this.period, timeLeft: this.timeLeft, running: this.clockRunning}));
  }
  
  decSeconds() {
    this.timeLeft--;
      if (!this.onCourtHistory.latestOnCourt) {
        this.timeChange.emit({ event: event, period: this.period, timeLeft: this.timeLeft});
      } 
      localStorage.setItem('time', JSON.stringify({period: this.period, timeLeft: this.timeLeft, running: this.clockRunning}));
  }
  
  incPeriod() {
    if (this.period < this.gameService.periods + this.gameService.overtimePeriods) {
      this.period++;
      // when incrementing period, we must check to see if period end and start have been logged.
      // otherwise log will not show period messages and possession arrow will not be correct.
      if (!this.plays.alreadyLoggedPeriodMessage("End", this.period - 1)) {
        this.plays.periodEnd(this.period - 1);
      }
      if (!this.plays.alreadyLoggedPeriodMessage("Start", this.period)) {
        this.periodStart.emit({ event: event, period: this.period});
      }
      if (this.period > this.gameService.periods) {
        // incremented into an overtime period. clock must be at max time of the Overtime Minutes
        if (this.timeLeft > this.gameService.overtimeMinutes * 60) {
          this.timeLeft = this.gameService.overtimeMinutes * 60;
        }
      }
    }
    if (!this.onCourtHistory.latestOnCourt) {
      this.timeChange.emit({ event: event, period: this.period, timeLeft: this.timeLeft});
    } 
    localStorage.setItem('time', JSON.stringify({period: this.period, timeLeft: this.timeLeft, running: this.clockRunning}));
  }
  
  decPeriod() {
    if (this.period > 1){
      this.period--;
    }
    this.timeChange.emit({ event: event, period: this.period, timeLeft: this.timeLeft});
    localStorage.setItem('time', JSON.stringify({period: this.period, timeLeft: this.timeLeft, running: this.clockRunning}));
  }

  getMinutes(): number {
    return Math.floor(this.timeLeft / 60);
  }

  getSeconds(): number {
    return this.timeLeft % 60;
  }

  // setClock(period: number, timeLeft: number) {
  //   this.period = period;
  //   this.timeLeft = timeLeft;
  // }
}
