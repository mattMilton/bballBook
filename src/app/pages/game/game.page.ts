import { Component, OnInit, ViewChild } from '@angular/core';
import { GameService } from 'src/app/services/game.service';
import { Team } from 'src/app/model/team';
import { Player } from 'src/app/model/player';
import { ActivatedRoute, Router } from '@angular/router';
import { TimerComponent } from 'src/app/components/timer/timer.component';
import { SubType } from 'src/app/model/substitution';
import { Play, PlayType } from 'src/app/model/play';
import { PlaysLogService } from 'src/app/services/plays-log.service';
import { ScoreboardComponent } from 'src/app/components/scoreboard/scoreboard.component';
import { OnCourtHistoryService } from 'src/app/services/on-court-history.service';
import { OnCourt } from 'src/app/model/onCourt';

@Component({
  selector: 'app-game',
  templateUrl: './game.page.html',
  styleUrls: ['./game.page.scss'],
})
export class GamePage implements OnInit {

  //@ViewChild(TimerComponent, {static: true}) timerReference;
  @ViewChild(ScoreboardComponent, {static: true}) scoreboardReference;
  period: number;
  minutes: number;
  seconds: number;
  periods: number;
  // periodMinutes: number;
  awayTeam: Team;   // only for testing and used in ngOnInit for generating teams automatically
  homeTeam: Team;
  timerReference: TimerComponent;
  
  
  

  constructor(

    
    
    public gameService: GameService,
    public router: Router,
    public plays: PlaysLogService,
    public onCourtHistory: OnCourtHistoryService,
    private route: ActivatedRoute
  ) {
    
   }

  ngOnInit() {
    
    console.log("inside game's onInit");
    // let clock = this.route.snapshot.paramMap.get('clock');
    // if (clock === 'stop') {
    //   this.scoreboardReference.stopClock();
    // }
    
    // assign scoreboard's timerReference to this page's timerReference
    this.timerReference = this.scoreboardReference.timerReference;

    // get number of periods so playsLog can access without referring to gameService
    this.periods = this.gameService.periods;
  }

  ngAfterViewInit() {

  }

  periodStart($event) {
    if (!this.plays.alreadyLoggedPeriodMessage("Start", $event.period)){

      var play = new Play();
      play.period = $event.period;
      if (play.period > this.gameService.periods) {
        play.minutes = this.gameService.overtimeMinutes;
      } else {
        play.minutes = this.gameService.periodMinutes;
      }
      play.seconds = 0;
      // if period one, or OT go to tip-off
      if ($event.period == 1 || $event.period > this.gameService.periods){
        play.priority = 0;  // needs priority over jump ball message.
        this.plays.periodStart(play);
        // create onCourt for starters and push to onCourtHistory
        // only if first period
        if ($event.period == 1) {
          // starters to an onCourtHistory record
          var onCourt: OnCourt = new OnCourt();
          onCourt.period = 1;
          onCourt.timeLeft = this.gameService.periodMinutes * 60;
          this.gameService.awayTeam.onCourt.forEach(player => {
            onCourt.awayOnCourt.push(player);
          });
          this.gameService.homeTeam.onCourt.forEach(player => {
            onCourt.homeOnCourt.push(player);
          })
          
          this.onCourtHistory.add(onCourt);
          // save starters. only bit of onCourt history needing to persist, 
          // rest will be derived from plays
          localStorage.setItem('awayStarters', JSON.stringify(onCourt.awayOnCourt));
          localStorage.setItem('homeStarters', JSON.stringify(onCourt.homeOnCourt));
        }

        this.router.navigate(['/tip-off/' + $event.period]);
      } else {
        play.playType = PlayType.PERIOD;
        play.team = this.gameService.possArrow;
        this.plays.periodStart(play);
        this.gameService.changePossArrow();
        play.otherTeam = this.gameService.possArrow; 
        console.log("start of period number " + $event.period);
      }
    }
  }

  timeChange($event) {
    this.onCourtHistory.timeChange($event.period, $event.timeLeft);
  }

  timeOut($event) {
    var validTO: boolean;
    var team: Team;

    if ($event.team == "away") {
      team = this.gameService.awayTeam;
    } else {
      team = this.gameService.homeTeam;
    }
    if (team.timeouts > 0) {
      team.timeouts--;
      validTO = true;
    }
    if (validTO) {  // create play and log
      this.updateMinutesAll();

      var play: Play = new Play();
      play.period = this.timerReference.period;
      play.minutes = this.timerReference.getMinutes();
      play.seconds = this.timerReference.getSeconds();
      play.team = team;
      play.playType = PlayType.TIMEOUT;
      
      this.plays.timeOut(play);
      this.gameService.saveGameData();

      // this.scoreboardReference.stopClock();
    }
  }

  jumpBall($event) {
    this.updateMinutesAll();
    
    // no new page, just create play and log
    var play: Play = new Play();
    play.period = this.timerReference.period;
    play.minutes = this.timerReference.getMinutes();
    play.seconds = this.timerReference.getSeconds();
    play.team = this.gameService.possArrow;
    play.playType = PlayType.JUMP;
    this.gameService.changePossArrow();
    play.otherTeam = this.gameService.possArrow;
    
    this.plays.jumpBall(play);
    this.gameService.saveGameData();

    // this.scoreboardReference.stopClock();
  }

  deletePlay($event) {
    //use $event.play for play attributes
    var play: Play = $event.play;
    const playIndex: number = $event.index;
    console.log(playIndex);

    // play has already been deleted from playsLog, need to correct all stats and any other gameService
    // attributes
    switch (play.playType) {
      case PlayType.FOUL:
        if (play.period > this.periods) {
          play.team.fouls[this.periods - 1]--;
        } else {
          play.team.fouls[play.period - 1]--;
        }
        play.primary.fouls--;
        this.plays.rewriteFoulMessages(play, playIndex);
        break;
      case PlayType.JUMP:
        this.gameService.changePossArrow();
        this.plays.rewritePossessions(play, playIndex, "deleted");
          break;
      case PlayType.MADE_2:
        play.primary.points -= 2;
        play.primary.fgMakes--;
        play.primary.fgAttempts--;
        play.team.points -= 2;
        if (play.secondary){
          play.secondary.assists--; 
        }
          break;
      case PlayType.MADE_3:
        play.primary.points -= 3;
        play.primary.fgMakes--;
        play.primary.fgAttempts--;
        play.primary.thrPtMakes--;
        play.primary.thrPtAttempts--;
        play.team.points -= 3;
        if (play.secondary){
          play.secondary.assists--; 
        }
          break;
      case PlayType.MISSED_2:
        play.primary.fgAttempts--;
        if (play.secondary) {
          play.secondary.blocks--;
        }
        if (play.tertiary) {
          if (play.tertiaryType === "Defensive Rebound") {
            play.tertiary.defRebounds--;
          } else {
            play.tertiary.offRebounds--;
          }
        }
          break;
      case PlayType.MISSED_3:
        play.primary.thrPtAttempts--;
        play.primary.fgAttempts--;
        if (play.secondary) {
          play.secondary.blocks--;
        }
        if (play.tertiary) {
          if (play.tertiaryType === "Defensive Rebound") {
            play.tertiary.defRebounds--;
          } else {
            play.tertiary.offRebounds--;
          }
        }
          break;
      case PlayType.TO:
        play.primary.turnovers--;
        if (play.secondary) {
          play.secondary.steals--;
        }
          break;
      case PlayType.TECH:
        if (play.primary) {
          play.primary.technicalFouls--;
        } else {
          play.team.benchTechnicals--;
        }
        break;
      case PlayType.MADE_FT:
        play.primary.ftAttempts--;
        play.primary.ftMakes--;
        play.primary.points--;
        play.team.points--;
        break;
      case PlayType.MISSED_FT:
        play.primary.ftAttempts--;
        if (play.secondary) {
          if (play.secondaryType === "Defensive Rebound") {
            play.secondary.defRebounds--;
          } else {
            play.secondary.offRebounds--;
          }
        }
        break;
      case PlayType.OFFENSIVE_FOUL:
        play.primary.turnovers--;
        play.primary.fouls--;
        break;
      case PlayType.SUB:
        this.onCourtHistory.delete(play);
        // below is to force deleted sub to update players on court
        let timeLeft = this.timerReference.getMinutes() * 60 + this.timerReference.getSeconds(); 
        this.onCourtHistory.timeChange(this.timerReference.period, timeLeft);
        break;
      case PlayType.TIMEOUT:
        play.team.timeouts++;
        // call below only needed if we decide to include in the message the number of the timeout
        //this.plays.rewriteTimeouts(play, playIndex, "deleted");
        break;
      default:
          console.log("No such day exists!");
          break;

    }
    this.plays.savePlays();
    this.gameService.saveGameData();

  }

  togglePlay($event) {
    // $event.play for play attributes

    // at the moment vvv 
    // only being used for tip-off plays. potential that this could change.

    // so with it only being used for tip-off vvvv
    // change the tip of play team. 
    // then change team for all subsequent jumpballs until another tip-off
    // this will be correct for possession arrow in regulation not overriding
    // into OT, and for NBA or other tip-off every jump types, this iteration
    // will be cut short of unnecessary ,,, but maybe boolean to keep all unnecessary
    var play: Play = $event.play;
    const playIndex: number = $event.index;

    
    if (this.plays.rewritePossessions(play, playIndex, "tip toggled")) {
      this.gameService.changePossArrow();
    };

    this.plays.savePlays();
    this.gameService.saveGameData();


  }

  madeFG(points: number) {
    this.period = this.timerReference.period;
    this.minutes = this.timerReference.getMinutes();
    this.seconds = this.timerReference.getSeconds();
    console.log(this.period + " " + this.minutes + " " + this.seconds);
    this.updateMinutesAll();
    this.router.navigate(['/made-fg/' + points + '/' + this.period + '/' + this.minutes + '/' + this.seconds]);
  }

  missedFG(type: number) {
    this.period = this.timerReference.period;
    this.minutes = this.timerReference.getMinutes();
    this.seconds = this.timerReference.getSeconds();
    this.updateMinutesAll();
    this.router.navigate(['/missed-fg/' + type + '/' + this.period + '/' + this.minutes + '/' + this.seconds]);
  }

  turnover() {
    this.period = this.timerReference.period;
    this.minutes = this.timerReference.getMinutes();
    this.seconds = this.timerReference.getSeconds();
    this.updateMinutesAll();
    this.router.navigate(['/turnover/' + this.period + '/' + this.minutes + '/' + this.seconds]);
  }

  foul() {
    this.period = this.timerReference.period;
    this.minutes = this.timerReference.getMinutes();
    this.seconds = this.timerReference.getSeconds();
    this.updateMinutesAll();
    // this.scoreboardReference.stopClock();      // after run-time implementation
    this.router.navigate(['/foul/' + this.period + '/' + this.minutes + '/' + this.seconds]);
  }

  technical() {
    this.period = this.timerReference.period;
    this.minutes = this.timerReference.getMinutes();
    this.seconds = this.timerReference.getSeconds();
    this.updateMinutesAll();
    // this.scoreboardReference.stopClock();  // after run-time
    this.router.navigate(['/technical/' + this.period + '/' + this.minutes + '/' + this.seconds]);
  }

  // jumpBall() {
  //   this.period = this.timerReference.period;
  //   this.minutes = this.timerReference.getMinutes();
  //   this.seconds = this.timerReference.getSeconds();
  //   this.updateMinutesAll();
    
  //   // no new page, just create play and log
  //   var play: Play = new Play();
  //   play.period = this.timerReference.period;
  //   play.minutes = this.timerReference.getMinutes();
  //   play.seconds = this.timerReference.getSeconds();
  //   play.team = this.gameService.possArrow;
  //   this.gameService.changePossArrow();
    
  //   this.plays.jumpBall(play);
  // }

  sub(team: string, player: Player, dir: string){
    this.period = this.timerReference.period;
    this.minutes = this.timerReference.getMinutes();
    this.seconds = this.timerReference.getSeconds();
    this.updateMinutesAll();
    console.log(team + " " + player.number + " " + this.period);
    this.router.navigate(['/substitute/' + team + "/" + player.number + "/" + dir + "/" + this.period + "/"
                + this.minutes + "/" + this.seconds]);
  }

  addPlayer(team: string) {
    this.router.navigate(['/add-player/' + team]);
  }

  updateMinutesAll() {
    this.gameService.awayTeam.onCourt.forEach(player => {
        console.log("player update minutes: " + player.name);
        player.updateMinutes(this.timerReference.period, this.timerReference.getMinutes(), 
          this.timerReference.getSeconds(), this.gameService.periodMinutes, 
          this.gameService.periods, this.gameService.overtimeMinutes);
    });
    this.gameService.homeTeam.onCourt.forEach(player => {
      player.updateMinutes(this.timerReference.period, this.timerReference.getMinutes(), 
        this.timerReference.getSeconds(), this.gameService.periodMinutes,
        this.gameService.periods, this.gameService.overtimeMinutes);
    });

  }

  gameSettings() {
    this.router.navigate(['/game-setup']);
  }
  
  help() {
    this.router.navigate(['/help']);
  }
}
