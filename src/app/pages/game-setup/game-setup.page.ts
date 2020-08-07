import { Component, OnInit } from '@angular/core';
import { Team } from 'src/app/model/team';
import { Router } from '@angular/router';
import { GameService } from 'src/app/services/game.service';
import { Player } from 'src/app/model/player';
import { SubType } from 'src/app/model/substitution';
import { OnCourt } from 'src/app/model/onCourt';
import { OnCourtHistoryService } from 'src/app/services/on-court-history.service';


@Component({
  selector: 'app-game-setup',
  templateUrl: './game-setup.page.html',
  styleUrls: ['./game-setup.page.scss'],
})
export class GameSetupPage implements OnInit {

  periodMins: number = 6;
  numPeriods: number = 4;
  foulsToBonus: number = 5;
  foulsToPenalty: number = 0;
  maxPersonalFouls: number = 5;
  technicalFoulShots: number = 1;
  timeouts: number = 5;
  awayTeam: Team = new Team("Away");
  homeTeam: Team = new Team("Home");
  message: String = "";

  constructor(public router: Router,
              public game: GameService,
              public onCourtHistory: OnCourtHistoryService) {
  }

  ngOnInit() {
  }

  fakePopulateTeams() {
    this.awayTeam = new Team("Anoka");

    for (var i = 0; i < 7; i++) {
      let nameArray = ["Audrey", "Brynna", "Bella", "Kennedy", "Emma", "Khloe", "Nora" ];
      var player: Player = new Player((i + 2) * 3);
      player.name = nameArray[i];
      this.awayTeam.roster.push(player); 
      
      // add to starting roster til full then to bench
      if (this.awayTeam.onCourt.length < 5) {
        this.awayTeam.onCourt.push(player);
        this.awayTeam.onCourt.sort((a,b) => a.number-b.number);
      } else {
        this.awayTeam.onBench.push(player);
        this.awayTeam.onBench.sort((a,b) => a.number-b.number);
      }
    }

    this.game.awayTeam = this.awayTeam;

    this.homeTeam = new Team("Blaine");
    
    for (var i = 0; i < 7; i++) {
      let nameArray = ["Johnson", "Peterson", "Anderson", "Boognish", "Wilson", "Spalding", "Penn" ];
      var player: Player = new Player((i * 2 + 1) * 3);
      player.name = nameArray[i];
      this.homeTeam.roster.push(player); 
      
      // add to starting roster til full then to bench
      if (this.homeTeam.onCourt.length < 5) {
        this.homeTeam.onCourt.push(player);
        this.homeTeam.onCourt.sort((a,b) => a.number-b.number);
      } else {
        this.homeTeam.onBench.push(player);
        this.homeTeam.onBench.sort((a,b) => a.number-b.number);
      }
    }
    
    this.game.homeTeam = this.homeTeam;
  }

  // will be moving validation to its own method
  startGame() {
    let valid: boolean = true;
    this.message = "";
    if (isNaN(this.periodMins) || this.periodMins <= 0) {
      this.message += "Period Minutes must be a positive number. ";
      valid = false;
    } 
    if (isNaN(this.numPeriods) || this.numPeriods <= 0){
      this.message += "Number of Periods must be a positive number.  ";
      valid = false;
    } 
    if ((isNaN(this.foulsToBonus) || this.foulsToBonus <= 0) && 
          (isNaN(this.foulsToPenalty) || this.foulsToPenalty <= 0)){
      this.message += "You must have a positive number for either bonus or penalty team fouls.  ";
      valid = false;
    } else if (this.foulsToBonus > 0 && this.foulsToPenalty > 0 && this.foulsToBonus >= this.foulsToPenalty){
      this.message += "If you are using both bonus and penalty, bunus must be less than penalty.  ";
      valid = false;
    }
    if (!this.game.awayTeam.name) { 
      this.message += "Away Team must be named.  ";
      valid = false;
    }
    if (!this.game.homeTeam.name) {
      this.message += "Home Team must be named.  ";
      valid = false;
    }
    if (!this.game.awayTeam || this.game.awayTeam.roster.length < 5) {
      this.message += "Away Team must be a valid team with at least 5 players.  ";
      valid = false;
    }
    if (!this.game.homeTeam || this.game.homeTeam.roster.length < 5) {
      this.message += "Home Team must be a valid team with at least 5 players.  ";
      valid = false;
    }

    if (valid) {
      
      this.game.setPeriods(this.numPeriods, this.periodMins);
      this.game.setTeamFouls(this.foulsToBonus, this.foulsToPenalty);
      for ( var i = 0; i < this.numPeriods; i++){
        this.game.awayTeam.fouls.push(0);
        this.game.homeTeam.fouls.push(0);
      }
      this.game.maxPersonalFouls = this.maxPersonalFouls;
      this.game.technicals = this.technicalFoulShots;

      this.game.awayTeam.timeouts = this.timeouts;
      this.game.homeTeam.timeouts = this.timeouts;  
      
      // a subLog entry for each starter
      this.game.awayTeam.onCourt.forEach(starter => {
        starter.subLog.push({ subType: SubType.SUB_IN, period: 1, minutes: this.game.periodMinutes,
                              seconds: 0 });
  
      });
  
      this.game.homeTeam.onCourt.forEach(starter => {
        starter.subLog.push({ subType: SubType.SUB_IN, period: 1, minutes: this.game.periodMinutes,
                              seconds: 0 });
  
      });

      // starters to an onCourtHistory record
      var onCourt: OnCourt = new OnCourt();
      onCourt.period = 1;
      onCourt.timeLeft = this.game.periodMinutes * 60;
      this.game.awayTeam.onCourt.forEach(player => {
        onCourt.awayOnCourt.push(player);
      });
      this.game.homeTeam.onCourt.forEach(player => {
        onCourt.homeOnCourt.push(player);
      })
      // since new game, reset/remove onCourt history from local storage
      this.onCourtHistory.deleteHistory();
      this.onCourtHistory.add(onCourt);

      this.game.saveGameData();          
      this.router.navigate(['/game'])
    }
  }

  editTeam(awayOrHome: number) {
    this.router.navigate(['/team-edit/' + awayOrHome])
  }

}

