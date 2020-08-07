import { Injectable } from '@angular/core';
import { Team } from '../model/team';
import { Loc } from '../model/loc';
import { TeamFouls } from '../model/teamFouls';
import { Player } from '../model/player';
import { PlaysLogService } from './plays-log.service';
import { OnCourtHistoryService } from './on-court-history.service';
import { OnCourt } from '../model/onCourt';
import { Game } from '../model/game';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  periods: number;
  periodMinutes: number = 1;
  bonus: number;
  penalty: number;
  teamFouls: TeamFouls;
  maxPersonalFouls: number = 5;
  technicals: number = 1;
  awayTeam: Team;
  homeTeam: Team;
  possArrow: Team;
  
  
  
  constructor(private plays: PlaysLogService) { 

    console.log("in gameService constructor");
    
    var gameData = JSON.parse(localStorage.getItem('gameData'));

    // primitive types should assign properly
    this.periods = gameData.periods;
    this.periodMinutes = gameData.periodMinutes;
    this.bonus = gameData.bonus;
    this.penalty = gameData.penalty;
    this.maxPersonalFouls = gameData.maxPersonalFouls;
    this.technicals = gameData.technicals;
    // enum type should still work
    this.teamFouls = gameData.teamFouls;
    // objects that need to be rebuilt--teams, and players and arrays of players inside teams
    // read in each player (onCourt first) create new Player add to onCourt and roster, then onBench
    // add to onBench and roster. 
    // first create new Team
    this.awayTeam =  new Team(gameData.awayTeam.name);
    this.homeTeam = gameData.homeTeam as Team;
    // possArrow need just refer to one of the created teams
    this.possArrow = gameData.possArrow as Team;

    console.log(this.awayTeam.name);
    console.log(gameData.awayTeam.roster[0]);
  }
  
  saveGameData() {

    var gameData = {
      periods: this.periods,
      periodMinutes: this.periodMinutes,
      bonus: this.bonus,
      penalty: this.penalty,
      teamFouls: this.teamFouls,
      maxPersonalFouls: this.maxPersonalFouls,
      technicals: this.technicals,
      awayTeam: this.awayTeam,
      homeTeam: this.homeTeam,
      possArrow: this.possArrow
      
    }
    localStorage.setItem('gameData', JSON.stringify(gameData));
  }
 
  saveTeam(team: Team, aOrH: Loc) {
    const nTeam = new Team(team.name);
    nTeam.roster = team.roster;
    if (aOrH === Loc.AWAY) {
      this.awayTeam = nTeam;
    } else {
      this.homeTeam = nTeam;
    }
    console.log(this.awayTeam);
    console.log(this.homeTeam);
    this.saveGameData();
  }

  setPeriods(periods: number, periodMinutes: number) {
    this.periods = periods;
    this.periodMinutes = periodMinutes;
  }

  setTeamFouls(bonus: number, penalty: number) {
    this.bonus = bonus;
    this.penalty = penalty;
    
    // validation is done in game-setup, but will potentially do here as well
    if (this.bonus > 0 && this.penalty > 0) {
      this.teamFouls = TeamFouls.BOTH;
    } else if (this.bonus > 0) {
      this.teamFouls = TeamFouls.BONUS;
    }
  }

  // currently doing this operation in the madeFG page....might move to here
  // same probably goes for all other stats.
  addPoints(pts: number, scorer: Player, team: Team) {
    
  }

  changePossArrow(){
    if (this.possArrow == this.awayTeam) {
      this.possArrow = this.homeTeam;
    } else {
      this.possArrow = this.awayTeam;
    }
  }

}
