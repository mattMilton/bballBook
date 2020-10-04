import { Injectable } from '@angular/core';
import { Play, PlayType } from '../model/play';
import { Team } from '../model/team';
import { Variable } from '@angular/compiler/src/render3/r3_ast';

@Injectable({
  providedIn: 'root'
})
export class PlaysLogService {

  plays: Play[] = [];
  playsData: any[] = [];
  startsLogged: number = 0;
  endsLogged: number = 0;
  tipOffsLogged: number = 0;
  periods: number;

  constructor() {
    console.log("in plays-logService constructor");

    this.playsData = JSON.parse(localStorage.getItem('playsData'));
    
    var periodLogData = JSON.parse(localStorage.getItem('periodLogData'));

    if (periodLogData) {
      this.startsLogged = periodLogData.startsLogged;
      this.endsLogged = periodLogData.endsLogged;
      this.tipOffsLogged = periodLogData.tipOffsLogged;
    }
   }

  setPeriods(periods: number) {
    this.periods = periods;
  }

  savePlays() {
    localStorage.setItem('playsData', JSON.stringify(this.plays));
    localStorage.setItem('periodLogData', JSON.stringify({startsLogged: this.startsLogged,
                                  endsLogged: this.endsLogged, tipOffsLogged: this.tipOffsLogged}));
  }

  periodEnd(period: number) {
    if (!this.alreadyLoggedPeriodMessage("End", period)) {
      var play = new Play();
      play.period = period;
      play.minutes = 0;
      play.seconds = 0;
      play.priority = 0;
      play.periodMessage("End");
      if (this.mostRecent(play)) {
        this.plays.unshift(play);
      } else {
        this.insertPlay(play);
      }
      this.endsLogged++;
      this.savePlays();
    }
  }

  periodStart(play: Play) {
    if (!this.alreadyLoggedPeriodMessage("Start", play.period)) {
      play.periodMessage("Start");
      if (this.mostRecent(play)){
        this.plays.unshift(play);
      } else {
        this.insertPlay(play);
      } 
      this.startsLogged++;
      this.savePlays();
    }
  }

  alreadyLoggedPeriodMessage(status: string, period: number): boolean {
    
    if (status == "Start") {
      if (period <= this.startsLogged) return true;
    }
    if (status == "End") {
      if (period <= this.endsLogged) return true;
    }
    // pretty sure below is not needed..... shouldn't reach if already logged
    // if (status == "Tip-Off") {
    //   // first logged is period one. subsequent ones are OT periods.
    //   if (period <= this.tipOffsLogged) return true;
    //   // overtime periods will be 101, 102, etc. 
    // }
    return false;
  }

  add(play: Play) {
    play.setMessage();
    if (this.mostRecent(play)){
      this.plays.unshift(play);
    } else {
      this.insertPlay(play);
    }
    this.savePlays();
  }

//   function(a, b) {          
//     if (a.city === b.city) {
//        // Price is only important when cities are the same
//        return b.price - a.price;
//     }
//     return a.city > b.city ? 1 : -1;
//  });

//  (a,b) => a.number-b.number

  substitution(play: Play) {
    play.subMessage();
    if (this.mostRecent(play)){
      this.plays.unshift(play);
    } else {
      this.insertPlay(play);
    }
    this.savePlays();
  }

  tipControl(play: Play) {
    //if (!this.alreadyLoggedPeriodMessage("Tip-Off", play.period)) {

      play.tipControlMessage();
      if (this.mostRecent(play)){
        this.plays.unshift(play);
      } else {
        this.insertPlay(play);
      }
      this.tipOffsLogged++;   // shouldn't need this either....
      this.savePlays();
    }
  //}

  jumpBall(play: Play) {
    play.jumpBallMessage();
    if (this.mostRecent(play)){
      this.plays.unshift(play);
    } else {
      this.insertPlay(play);
    }
    this.savePlays();
  }

  timeOut(play: Play) {
    play.timeOutMessage();
    if (this.mostRecent(play)){
      this.plays.unshift(play);
    } else {
      this.insertPlay(play);
    }
    this.savePlays();
  }

  mostRecent(play: Play): boolean {
    // console.log(play.period + " " + play.minutes + ":" + play.seconds );
    // console.log(this.plays[0].period + " " + this.plays[0].minutes + ":" + this.plays[0].seconds);
    if (this.plays.length == 0) {
      return true;
    }
    if (play.period > this.plays[0].period) {
      return true;
    } else if (play.period == this.plays[0].period) {
      if (play.minutes < this.plays[0].minutes) {
        return true;
      } else if (play.minutes == this.plays[0].minutes) {
        if (play.seconds <= this.plays[0].seconds) {
          return true;
        }
      }
    }
    return false;   
  }

  insertPlay(play: Play) {
    this.plays.unshift(play);
    this.plays.sort((a, b) => {
      if (a.period == b.period) {
        if (a.minutes == b.minutes) {
          if (a.seconds == b.seconds) {
            return a.priority < b.priority ? 1 : -1;
          }
          return a.seconds > b.seconds ? 1 : -1;
        }
        return a.minutes > b.minutes ? 1 : -1;
      }
      return a.period < b.period ? 1 : -1;
    })
    switch (play.playType) {
      case PlayType.FOUL:
        this.rewriteFoulMessages(play, this.plays.indexOf(play));
        break;

      case PlayType.OFFENSIVE_FOUL:
        console.log("in offensive foul case of insert play");
        this.rewriteFoulMessages(play, this.plays.indexOf(play));
        break;

      case PlayType.JUMP:
        this.rewritePossessions(play, this.plays.indexOf(play), "inserted");
        break;

      case PlayType.PERIOD:
        this.rewritePossessions(play, this.plays.indexOf(play), "inserted");
        break;

        // Timout case only to be used if message is to include the number of the timeout
      // case PlayType.TIMEOUT:
      //   this.rewriteTimeouts(play, this.plays.indexOf(play), "deleted");
      //   break;
    }
  }

  rewriteFoulMessages(play: Play, index: number) {
    console.log("in rewriteFoulMessages(), periods: " + this.periods);
    // fix all subsequent foul messages after deleting a foul or inserting one
    // must iterate through array backwards as newest play has lowest index
    // iterate through entire period to count number of team fouls, 
    // but only making changes to fouls after the deleted foul or beginning with the inserted one  
    var teamFouls: number = 0;
    var personalFouls: number = 0;
    for (let i = this.plays.length - 1; i >= 0; i--) {
      console.log( i );
      // team fouls to be counted in plays period only, and message changed for 
      // fouls after deleted and in the same period
      // personal fouls to be counted in entire list, and message to be changed
      // for subsequent fouls by same player
      var curPlay: Play = this.plays[i];
      
      if (curPlay.team == play.team                   // fouls by team
                && curPlay.playType == PlayType.FOUL) { 
        if (curPlay.period == play.period || // same period
              (play.period >= this.periods && curPlay.period >= this.periods)) { // or last period or OT 
          teamFouls++;
          console.log("team foul")
          if (i <= index) {  // fouls after deleted 
            curPlay.extraTF = " Team Foul: " + teamFouls;
            curPlay.setMessage();
            console.log("Team foul after deleted " + teamFouls);
            console.log(curPlay);
          }
        }
        if (curPlay.primary == play.primary) { // same fouler
          personalFouls++;
          if (i <= index) {  // after deleted 
            curPlay.extra = "Personal Foul: " + personalFouls;
            curPlay.setMessage();
          }
        }
      }
      if (curPlay.primary == play.primary && curPlay.playType == PlayType.OFFENSIVE_FOUL) {
        personalFouls++;
        if (i <= index) { // after deleted 
          curPlay.extra = "Personal Foul: " + personalFouls;
          curPlay.setMessage();
        }
      } 
    }
  }

  rewritePossessions(play: Play, index: number, type: string): boolean {
    // fix all subsequent jumb ball and period start messages after deleting or inserting
    // iterate backwards, but only need to start at the first prior jump ball or period start
    // to get the possession arrow at the time of the insert or delete. so first, it is needed to
    // find that previous occurrance by iterating forward from this index to next occurrance, at 
    // most iterating will only go to start of this play's period
    
    // if it is deleted, we know who had possession arrow, no need to find previous

    // incorporating type "tip toggled in function"
    
    console.log("in rewrite possessions()");

    var previousTeam: Team;
    var changePossArrow: boolean = true;

    if (type === "inserted") {
      // find previous possession arrow change 
      console.log("in inserted condition of rewritePossessions");
      var searchIndex = index + 1;
      while (!previousTeam) {
        if (this.plays[searchIndex].playType == PlayType.JUMP ||
            this.plays[searchIndex].playType == PlayType.PERIOD ||
            this.plays[searchIndex].playType == PlayType.TIP) { 
          previousTeam = this.plays[searchIndex].team;
          console.log("found previous team from jump ball: " + previousTeam.name);
        }
        searchIndex++;
        console.log(searchIndex);
      }
      // inserted play needs to be opposite if gameService jump ball set it to same as previous
      // team, but the inserted play will be included in following for loop which will change 
      // all plays teams, so here we change team only if the inserted team is the other team than the previous
      // ******************** kind of a mess look at this later
      console.log(play.team.name + " " + previousTeam.name)
      if (play.team != previousTeam) {
        play.changeTeam();
        //play.jumpBallMessage();
      }
    }

    if (type === "deleted") {
      index--; // do not want to rewrite previous play
    }

    if (type === "tip toggled") {
      // rewrite the tip that is being toggled (play passed into function)
      // and decrement index so as not to have following for loop break 
      // instantly
      console.log("in tip toggled condition of rewrite possession arrow, team is: " + play.team.name );
      play.changeTeam();
      console.log("after play.changeTeam(), team is now: " + play.team.name);
      play.tipControlMessage();
      index--; 
    }

    // change team to opposite team for all subsequent jump ball and period starts     
    for (let i = index; i >= 0; i--) {
      // do not want to overwrite plays beginning at next TIP play (ovetime plays)
      // and don't want to change game possession arrow
      // break out of loop at TIP play
      if (this.plays[i].playType == PlayType.TIP) {
        changePossArrow = false;
        break;
      }
        
      if (this.plays[i].playType == PlayType.JUMP) {
        console.log("Jump Ball team = " + this.plays[i].team.name + 
                    " other team = " + this.plays[i].otherTeam.name
                    + " play number = " + i);
        this.plays[i].changeTeam();
        this.plays[i].jumpBallMessage();
      } else if (this.plays[i].playType == PlayType.PERIOD){
        this.plays[i].changeTeam();
        this.plays[i].periodMessage("Start");
      }

      
    }
    return changePossArrow;
  }

  /*
  rewriteTimouts function is not being used unless we decide to put in the message, the 
  number of the timeout (i.e. "Team A takes timeout, their 4th"). If we do decide to do that, 
  we will need to write this method much like the rewrite possession function above. In fact, 
  it is currently a copy of the function, and necessary changes will need to be made if indeed 
  we decide to implement it.
  */
  rewriteTimeouts(play: Play, index: number, type: string) {
    // fix all subsequent timeout messages of the team after deleting or inserting
    // iterate backwards, but only need to start at the first prior timeout
    // to get the possession arrow at the time of the insert or delete. so first, it is needed to
    // find that previous occurrance by iterating forward from this index to next occurrance, at 
    // most iterating will only go to start of this play's period
    
    // if it is deleted, we know who had possession arrow, no need to find previous
    
    console.log("in rewrite possessions()");

    var previousTeam: Team;

    if (type === "inserted") {
      // find previous possession arrow change 
      console.log("in inserted condition of rewritePossessions");
      var searchIndex = index + 1;
      while (!previousTeam) {
        if (this.plays[searchIndex].playType == PlayType.JUMP ||
            this.plays[searchIndex].playType == PlayType.PERIOD ||
            this.plays[searchIndex].playType == PlayType.TIP) { 
          previousTeam = this.plays[searchIndex].team;
          console.log("found previous team from jump ball: " + previousTeam.name);
        }
        searchIndex++;
        console.log(searchIndex);
      }
      // inserted play needs to be opposite if gameService jump ball set it to same as previous
      // team, but the inserted play will be included in following for loop which will change 
      // all plays teams, so here we change team only if the inserted team is the other team than the previous
      // ******************** kind of a mess look at this later
      console.log(play.team.name + " " + previousTeam.name)
      if (play.team != previousTeam) {
        play.changeTeam();
        //play.jumpBallMessage();
      }
    }

    if (type === "deleted") {
      index--; // do not want to rewrite previous play
    }

    // change team to opposite team for all subsequent jump ball and period starts     
    for (let i = index; i >= 0; i--) {
      // do not want to overwrite plays beginning at next TIP play (ovetime plays)
      // break out of loop at TIP play
      if (this.plays[i].playType == PlayType.TIP) {
        break;
      }
        
      if (this.plays[i].playType == PlayType.JUMP) {
        console.log("Jump Ball team = " + this.plays[i].team.name + 
                    " other team = " + this.plays[i].otherTeam.name
                    + " play number = " + i);
        this.plays[i].changeTeam();
        this.plays[i].jumpBallMessage();
      } else if (this.plays[i].playType == PlayType.PERIOD){
        this.plays[i].changeTeam();
        this.plays[i].periodMessage("Start");
      }

      
    }
  }
}
