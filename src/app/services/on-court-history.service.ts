import { Injectable } from '@angular/core';
import { OnCourt } from '../model/onCourt';
import { GameService } from './game.service';
import { Team } from '../model/team';
import { Player } from '../model/player';
import { Play, PlayType } from '../model/play';
import { PlaysLogService } from './plays-log.service';

@Injectable({
  providedIn: 'root'
})
export class OnCourtHistoryService {

  history: OnCourt[] = [];
  currentlyOnCourtIndex: number;
  latestOnCourt: boolean;

  constructor(public gameService: GameService,
              public plays: PlaysLogService) { 

    console.log("in on-court-historyService constructor");
    const awayStarters = JSON.parse(localStorage.getItem('awayStarters'));
    const homeStarters = JSON.parse(localStorage.getItem('homeStarters'));
    
    if (awayStarters && homeStarters) {
      
      // these are onCourt attributes that need to be used to construct the onCourt
      // period: number;
      // timeLeft: number;
      // awayOnCourt: Player[] = [];
      // homeOnCourt: Player[] = [];
      // play: Play;
      
      // OR create history from scratch by iterating playslog searching for substitutions.
      
      // starters to be history[0]
      var onCourt: OnCourt = new OnCourt();
      onCourt.period = 1;
      onCourt.timeLeft = this.gameService.periodMinutes * 60;
      // away team
      for (let i = 0; i < awayStarters.length; i++) {
        var player: Player;
        for (let j = 0; j < gameService.awayTeam.roster.length; j++) {
          if (gameService.awayTeam.roster[j].number == awayStarters[i].number) {
            player = gameService.awayTeam.roster[j];
            onCourt.awayOnCourt.push(player);
          }
        }
      }
      // home team
      for (let i = 0; i < homeStarters.length; i++) {
        var player: Player;
        for (let j = 0; j < gameService.homeTeam.roster.length; j++) {
          if (gameService.homeTeam.roster[j].number == homeStarters[i].number) {
            player = gameService.homeTeam.roster[j];
            onCourt.homeOnCourt.push(player);
          }
        }
      }
      // then pushed to history
      this.history.push(onCourt);
      
      // then all remaining onCourts to be made onCourts and pushed to history

      // iterate all plays
      for (let i = this.plays.plays.length - 1; i >= 0; i--) {

        
        // if playtype is sub
        if (this.plays.plays[i].playType == PlayType.SUB) {
          var newOnCourt = new OnCourt();
          let last = this.history.length - 1;
          newOnCourt.play = this.plays.plays[i];
          newOnCourt.period = this.plays.plays[i].period;
          newOnCourt.timeLeft = this.plays.plays[i].minutes * 60 + this.plays.plays[i].seconds;

          if (newOnCourt.play.team == this.gameService.awayTeam) {
            // copy players from home team
            this.history[last].homeOnCourt.forEach(player => {
              newOnCourt.homeOnCourt.push(player);
            })

            // and iterate away team searching for player to be subbed out and in
            this.history[last].awayOnCourt.forEach(player => {
              if (player != newOnCourt.play.secondary) {
                newOnCourt.awayOnCourt.push(player);
              }
            })
            newOnCourt.awayOnCourt.push(newOnCourt.play.primary);
            // not sure if onCourt requires players to be sorted but...
            newOnCourt.awayOnCourt.sort((a,b) => a.number-b.number);
            
          } else {
            // copy players from away team
            this.history[last].awayOnCourt.forEach(player => {
              newOnCourt.awayOnCourt.push(player);
            })
            // and iterate home team searching for player to be subbed out and in
            this.history[last].homeOnCourt.forEach(player => {
              if (player != newOnCourt.play.secondary) {
                newOnCourt.homeOnCourt.push(player);
              }
            })
            newOnCourt.homeOnCourt.push(newOnCourt.play.primary);
            // not sure if onCourt requires players to be sorted but...
            newOnCourt.homeOnCourt.sort((a,b) => a.number-b.number);
          }
          this.history.push(newOnCourt);
        }
        
        // new onCourt 
        // copy last previous onCourt, set play to play, period to play.period, 
        // timeleft to play.timeleft, check play.team to know which team to swap out primary plater
        // for secondary player or vice versa
        
                          //     var onCourt: OnCourt = new OnCourt();
                          // onCourt.play = this.play;
                          // onCourt.period = this.play.period;
                          // onCourt.timeLeft = this.play.minutes * 60 + this.play.seconds;
                          // this.gameService.awayTeam.onCourt.forEach(player => {
                          //   onCourt.awayOnCourt.push(player);
                          // });
                          // this.gameService.homeTeam.onCourt.forEach(player => {
                          //   onCourt.homeOnCourt.push(player);
                          // });
                          // this.onCourtHistory.add(onCourt);

        // push onCourt to history
        
      }

      // after all onCourts recreated and added to history....

      // set currentlyOnCourtIndex by reading time from local storage and send period and timeleft to
      // getIndexForGameTime which returns an index 
       // set clock if time in localStorage
      var timeData = JSON.parse(localStorage.getItem('time'));
    
      if (timeData) {
        console.log("got timeData");
        var period = timeData.period;
        var timeLeft = timeData.timeLeft;
      } else {// shouldn't happen  }
       }
        // then set ....
      this.currentlyOnCourtIndex = this.getIndexForGameTime(period, timeLeft);
      this.setGameOnCourt(this.currentlyOnCourtIndex);
        
      // set latestOnCourt to true or false depending on if last onCourt record of history
      this.latestOnCourt = (this.currentlyOnCourtIndex == this.history.length - 1);
    }
  }

  add(onCourt: OnCourt) {
    if (this.mostRecent(onCourt)){
      this.history.push(onCourt);
      this.currentlyOnCourtIndex = this.history.length - 1;
      this.latestOnCourt = true;
    } else {
      // i believe this is where troubleshooting must begin for issue of conflicting subsequent
      // onCourt history records not removing all necessary players' subLog records

      // potentially next line, and insert function not correct
      this.currentlyOnCourtIndex = this.insert(onCourt);
      this.latestOnCourt = false;
      
      this.checkSubsequentValidity(this.currentlyOnCourtIndex);

      // inserted substitions are the only case in which both platers involved will 
      // need their subLog re-ordered.
      onCourt.play.primary.sortSubLog();
      onCourt.play.secondary.sortSubLog();

      // recheck for most recent, as above function may have deleted all subsequent records
      if (this.mostRecent(onCourt)) {
        this.latestOnCourt = true;
      }
    }

    

    // below 8 lines only debugging
    console.log(this.history);
    console.log(this.currentlyOnCourtIndex);
    this.history[this.currentlyOnCourtIndex].awayOnCourt.forEach(player => {
      console.log(player.name);
      player.subLog.forEach(sub => {
        console.log(sub.subType + " " + sub.period + " " + sub.minutes + " " + sub.seconds);
      })
    })
  }

  mostRecent(onCourt: OnCourt): boolean {
    
    if (this.history.length == 0) {
      return true;
    }
    if (onCourt.period > this.history[this.history.length - 1].period) {
      return true;
    } else if (onCourt.period == this.history[this.history.length - 1].period) {
      if (onCourt.timeLeft <= this.history[this.history.length - 1].timeLeft) {
        return true;
      }
    }
    return false;   
  }

  insert(onCourt: OnCourt): number {
    this.history.push(onCourt);
    this.history.sort((a, b) => {
      if (a.period == b.period) {
        return a.timeLeft <= b.timeLeft ? 1 : -1;
      }
      return a.period > b.period ? 1 : -1;
    })
    return this.history.indexOf(onCourt);
  }

  // method is called by game.page.ts when event is emitted, the event is only emitted
  // on backword movements of the clock, and forward movements when this.latestOnCourt is false
  // task is to continually check for times when substitutions have been made
  timeChange(period: number, timeLeft: number) {
    console.log("in timeChange() in onCourtHistoryService");
    let indexForGameTime = this.getIndexForGameTime(period, timeLeft);
    console.log ("index for game time: " + indexForGameTime + " current on court index: " + this.currentlyOnCourtIndex);
    if (indexForGameTime == this.currentlyOnCourtIndex) {
      return;   // break from function as proper players are on court for current game time
    } else {
      // set currentlyOnCourtIndex to indexForGameTime
      this.currentlyOnCourtIndex = indexForGameTime;
      
      // set each player from onCourt record to onCourt in gameService
      this.setGameOnCourt(indexForGameTime);
      
      // set latestOnCourt to true or false depending on if last onCourt record of history
      this.latestOnCourt = (this.currentlyOnCourtIndex == this.history.length - 1);
    }
  }

  getIndexForGameTime(period: number, timeLeft: number): number {
    for (let i = this.history.length - 1; i >= 0; i--) {
      // below should always return latest onCourt record prior to game time, 
      // and the last of multiple at the same time 
      if (period > this.history[i].period || 
          period == this.history[i].period && timeLeft <= this.history[i].timeLeft) {
        return i;
      }
    }
    // in case of improper clock manipulation
    return 0;
  }

  setGameOnCourt(onCourtIndex: number) {
    var record: OnCourt = this.history[onCourtIndex];
    console.log(record);
    var temp: Player[] = [];

    // away team
    for (var i = this.gameService.awayTeam.onCourt.length - 1; i >= 0; i--){
      if (record.awayOnCourt.indexOf(this.gameService.awayTeam.onCourt[i]) == -1){
        temp.push(this.gameService.awayTeam.onCourt[i]);
        this.gameService.awayTeam.onCourt.splice(i, 1);
      }
    }

    record.awayOnCourt.forEach((player, i) => {
      if (this.gameService.awayTeam.onCourt.indexOf(player) == -1){
        this.gameService.awayTeam.onCourt.push(player);

        const benchIndex = this.gameService.awayTeam.onBench.indexOf(player, 0);
        if (benchIndex > -1){
          this.gameService.awayTeam.onBench.splice(benchIndex, 1);
        }
      }
    });

    temp.forEach(player => {
      this.gameService.awayTeam.onBench.push(player);
    });
    
    this.gameService.awayTeam.onCourt.sort((a, b) => a.number - b.number);
    this.gameService.awayTeam.onBench.sort((a, b) => a.number - b.number);

    // home team
    temp = [];

    for (var i = this.gameService.homeTeam.onCourt.length - 1; i >= 0; i--){
      if (record.homeOnCourt.indexOf(this.gameService.homeTeam.onCourt[i]) == -1){
        temp.push(this.gameService.homeTeam.onCourt[i]);
        this.gameService.homeTeam.onCourt.splice(i, 1);
      }
    }

    record.homeOnCourt.forEach((player, i) => {
      if (this.gameService.homeTeam.onCourt.indexOf(player) == -1){
        this.gameService.homeTeam.onCourt.push(player);

        const benchIndex = this.gameService.homeTeam.onBench.indexOf(player, 0);
        if (benchIndex > -1){
          this.gameService.homeTeam.onBench.splice(benchIndex, 1);
        }
      }
    });

    temp.forEach(player => {
      this.gameService.homeTeam.onBench.push(player);
    });
   
    this.gameService.homeTeam.onCourt.sort((a, b) => a.number - b.number);
    this.gameService.homeTeam.onBench.sort((a, b) => a.number - b.number);
  }

  delete(play: Play) {
    var index;
    // play in playsLog is already deleted

    // delete onCourtRecord in this.history
    for (let i = 0; i < this.history.length; i++){
      console.log("record number: " + i + " history length: " + this.history.length);
      if (this.history[i].play == play) {
        console.log("matches play, should be deleted");
        index = i;
        this.history.splice(i, 1);
        break;
      }
    }
    // remove subLog entries for both players
    play.primary.removeSubLogEntry(play);
    play.secondary.removeSubLogEntry(play);

    console.log(play.primary.subLog);
    console.log(play.secondary.subLog);

    
    this.checkSubsequentValidity(index);

    // below logic is only needed to set game on court if/when it isn't told to do so otherwise
    // this would only be the case if latest on course is true
    // therefore a check for latest on course truthiness should tell if statements are to be made
    // and if they are to be made, must make sure currently oncourt index has been necessarily decremented
    // either already in this method, or before using it to set game on court in final statement

    // however, no event will be emmitted when clock is not running, even if latest on course is false, 
    // so maybe game.page.ts deletePlay method can do all of this (before or after calling this service)
    // but then is that correct??
    // let indexForGameTime = this.getIndexForGameTime(period, timeLeft);

    // // set currentlyOnCourtIndex to indexForGameTime
    // this.currentlyOnCourtIndex = indexForGameTime;

    // // set latestOnCourt to true or false depending on if last onCourt record of history
    // this.latestOnCourt = (this.currentlyOnCourtIndex == this.history.length - 1);

    // // set each player from onCourt record to onCourt in gameService
    // this.setGameOnCourt(indexForGameTime);
  }

  // must iterate through subsequent onCourts and check for validity by using the play attribute
      // of the onCourt, the play.primary and play.secondary must meet conditions
      // if they do not, play and onCourt should be deleted. 
      // cannot sub in a player that was already in ( need to check previous onCourt), or sub out a player that
      // was already on bench.
  checkSubsequentValidity(startIndex: number) {
    // iterate from startIndex to end of history
    console.log("*****************Checking subsequent***************");
    for(let i = startIndex; i < this.history.length; ) {
      console.log("index number: " + i);
      var toCourtValid;
      var toBenchValid;
      // player subing in should not be found in previous onCourt record of either team
      toCourtValid = this.history[i - 1].awayOnCourt.indexOf(this.history[i].play.primary) == -1 
                    && this.history[i - 1].homeOnCourt.indexOf(this.history[i].play.primary) == -1;
      // player subing out should be found in previous onCourt record for one of the teams
      toBenchValid = this.history[i - 1].awayOnCourt.indexOf(this.history[i].play.secondary) != -1 
                    || this.history[i - 1].homeOnCourt.indexOf(this.history[i].play.secondary) != -1;
      // onCourt record substitution is valid, assure integrity and go to next index
      if (toCourtValid && toBenchValid){
        // although checked record may be valid in that it does not violate players
        // being subbed in and out versus previous onCourt record, the record may
        // contain incorrect players from previous deleted records
        
        // onCourt being validated must be same as previous except not including play.secondary
        // and must include play.primary
               
        // remove all players from current record
        this.history[i].awayOnCourt.length = 0;
        this.history[i].homeOnCourt.length = 0;

        // iterate through players of previous record, place them in current, unless it is
        // player being subbed out
        this.history[i - 1].awayOnCourt.forEach(player => {
          if (player != this.history[i].play.secondary){
            this.history[i].awayOnCourt.push(player);
          }
        })
        this.history[i - 1].homeOnCourt.forEach(player => {
          if (player != this.history[i].play.secondary){
            this.history[i].homeOnCourt.push(player);
          }
        })

        // place play.primary in record
        if (this.history[i].play.team == this.gameService.awayTeam){
          this.history[i].awayOnCourt.push(this.history[i].play.primary);
        } else {
          this.history[i].homeOnCourt.push(this.history[i].play.primary);
        }

        // sort both teams' onCourts
        this.history[i].awayOnCourt.sort((a, b) => a.number - b.number);
        this.history[i].homeOnCourt.sort((a, b) => a.number - b.number);
        
        console.log("Record found to be valid");

        i++;
      }
      // onCourt record is invalid, remove record, no need to increment index, and length is decreased
      else {

        console.log("Record found to be invalid");

        // remove each players subLog entry
        this.history[i].play.primary.removeSubLogEntry(this.history[i].play);
        this.history[i].play.secondary.removeSubLogEntry(this.history[i].play);
  
        // remove play from plays
        const playIndex = this.plays.plays.indexOf(this.history[i].play);
        this.plays.plays.splice(playIndex, 1);
  
        // remove record from this.history
        this.history.splice(i, 1);

      }
    }
  }
}
