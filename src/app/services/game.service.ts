import { Injectable } from '@angular/core';
import { Team } from '../model/team';
import { Loc } from '../model/loc';
import { TeamFouls } from '../model/teamFouls';
import { Player } from '../model/player';
import { PlaysLogService } from './plays-log.service';
import { OnCourtHistoryService } from './on-court-history.service';
import { OnCourt } from '../model/onCourt';
import { Game } from '../model/game';
import { Play } from '../model/play';

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
  awayTeam: Team = new Team("Away Team");
  homeTeam: Team = new Team("Home Team");
  possArrow: Team;
  overtimePeriods: number = 0;
  overtimeMinutes: number = 5;
  
  
  
  constructor(private plays: PlaysLogService) { 

    console.log("in gameService constructor");
    
    var gameData = JSON.parse(localStorage.getItem('gameData'));

    if (gameData) {

      // primitive types should assign properly
      this.periods = gameData.periods;
      this.periodMinutes = gameData.periodMinutes;
      this.bonus = gameData.bonus;
      this.penalty = gameData.penalty;
      this.maxPersonalFouls = gameData.maxPersonalFouls;
      this.technicals = gameData.technicals;
      this.overtimePeriods = gameData.overtimePeriods;
      this.overtimeMinutes = gameData.overtimeMinutes;
      // enum type should still work
      this.teamFouls = gameData.teamFouls;
      // objects that need to be rebuilt--teams, and players and arrays of players inside teams
      // read in each player (onCourt first) create new Player add to onCourt and roster, then onBench
      // add to onBench and roster. 
      // first create new Team
      this.awayTeam =  new Team(gameData.awayTeam.name);
      this.awayTeam.buildFromPlainObject(gameData.awayTeam);
  
      this.homeTeam = new Team(gameData.homeTeam.name);
      this.homeTeam.buildFromPlainObject(gameData.homeTeam);

      // set possession arrow 
      if (gameData.possArrow) {
        if (gameData.possArrow.name == this.awayTeam.name) {
          this.possArrow = this.awayTeam;
          console.log("assigned possArrow to awayTeam");
        } 
        if (gameData.possArrow.name == this.homeTeam.name) {
          this.possArrow = this.homeTeam;
          console.log("assigned possArrow to homeTeam");
        }
      }
  
      // i believe all team and player objects have been properly rebuilt 
      // need to rebuild entire play log next

      // also while iterating plays, plays needs to check for period and tip messages
      if (this.plays.playsData) {

        for (let i = 0; i < this.plays.playsData.length; i++) {
          let playData = this.plays.playsData[i];
          console.log("play message: " + playData.message);
          // make new play
          let play: Play = new Play();
          
          // set all primitive types from playData in newly created object
          play.setPrimData(playData);
          
          // Determine and set references to all objects in play
          // first teams
          if (playData.team) {
            if (playData.team.name == this.awayTeam.name) {
              play.team = this.awayTeam;
              play.otherTeam = this.homeTeam;
            } else {
              play.team = this.homeTeam;
              play.otherTeam = this.awayTeam;
            }
          }
          
          // then players
          if (play.team) {
            for (let p = 0; p < play.team.roster.length; p++){
              if (playData.primary && playData.primary.number == play.team.roster[p].number) {
                play.primary = play.team.roster[p];
              } else {
                if (playData.secondary && playData.secondary.number == play.team.roster[p].number) {
                  play.secondary = play.team.roster[p];
                } else {
                  if (playData.tertiary && playData.tertiary.number == play.team.roster[p].number) {
                    play.tertiary = play.team.roster[p];
                  }
                }
              }
            }
          }
          
          // push to plays.plays
          this.plays.plays.push(play);
        }

        // and give playsLogService number of periods
        this.plays.setPeriods(this.periods);
      }
      
    }

    

    // then entire onCourtHistory's history needs rebuilding. not sure where to do this. would
    // be preferred to do here, but need to make sure referring to onCourtHistory service from 
    // this service doesn't brake things.
    // I think it would brake, since ochs refers to this. cant have them refer to each other.
    // instead, do all in onCHS, which should not construct until after this does. 
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
      possArrow: this.possArrow,
      overtimePeriods: this.overtimePeriods,
      overtimeMinutes: this.overtimeMinutes
      
    }
    localStorage.setItem('gameData', JSON.stringify(gameData));
  }
 
  saveTeam(team: Team, aOrH: Loc) {
    // const nTeam = new Team(team.name);
    // nTeam.roster = team.roster;
    // if (aOrH === Loc.AWAY) {
    //   this.awayTeam = nTeam;
    // } else {
    //   this.homeTeam = nTeam;
    // }
    // console.log(this.awayTeam);
    // console.log(this.homeTeam);
    this.saveGameData();
  }

  setPeriods(periods: number, periodMinutes: number) {
    this.periods = periods;
    this.periodMinutes = periodMinutes;
    this.plays.setPeriods(periods);
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

  endOfRegulation(): boolean{
    console.log("end of regulation");
    if (this.awayTeam.points == this.homeTeam.points) {
      this.overtimePeriods++;
      return true;
    } else { return false;}
  }
}
