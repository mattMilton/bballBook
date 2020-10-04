import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GameService } from 'src/app/services/game.service';
import { PlaysLogService } from 'src/app/services/plays-log.service';
import { Play, PlayType } from 'src/app/model/play';
import { Team } from 'src/app/model/team';
import { FreeThrowsType } from 'src/app/model/freeThrowsType';
import { Player } from 'src/app/model/player';
import { TeamFouls } from 'src/app/model/teamFouls';

@Component({
  selector: 'app-free-throws',
  templateUrl: './free-throws.page.html',
  styleUrls: ['./free-throws.page.scss'],
})
export class FreeThrowsPage implements OnInit {

  team: Team;                 // set in onInit
  reason: string;             //
  type: FreeThrowsType;       // for tech, set in onInit; fgMade in fgMade(),
                              // type and typeString are set in fgType(), 
  typeString: string;         // whether made or missed. set in shooter() if reason is team-fouls
  fgMade: boolean;
  fgMissedType: number;
  fgMadeType: number;
  typeSet: boolean;
  shooter: Player;
  assist: Player;
  assistQuery: boolean;
  freeThrowsReady: boolean;
  foulingTeam: Team;
  ftSuccess: string[] = [];
  next: string;
  madeFrontEnd: boolean;
  play: Play = new Play();
  rebounder: Player;
  reboundingTeam: Team;
  rebounderSet: boolean;

  constructor(public route: ActivatedRoute,
    public router: Router,
    public gameService: GameService,
    public plays: PlaysLogService) { }

  ngOnInit() {
    if (this.route.snapshot.paramMap.get('team') == "away") {
      this.team = this.gameService.awayTeam;
    } else {
      this.team = this.gameService.homeTeam;
    } 
    this.reason = this.route.snapshot.paramMap.get('reason');
    if (this.reason == "technical") {
      if (this.gameService.technicals == 1){
        this.type = FreeThrowsType.ONE;
      } else {
        this.type = FreeThrowsType.TWO;
      }
      this.typeSet = true;
    }
    this.play.period = +this.route.snapshot.paramMap.get('period');
    this.play.minutes = +this.route.snapshot.paramMap.get('minutes');
    this.play.seconds = +this.route.snapshot.paramMap.get('seconds');
  }

  // reasons to include technical, shooting, and team-fouls. team-fouls needs to be broken down 
  // into what type of free throws. shooting needs to be determined whether shooting was on 2 or 3 
  // point field goal as well as whether the field goal was made. results of these inquiries should 
  // be stored as enum FreeThrowsType then used to determine flow

  // technical dealt with in ngOnInit()


  // must develop a play for this condition and determine if made field goal was 2 or 3
  //******************IMPORTANT***********************************
  fieldGoalMade(made: boolean) {
    this.fgMade = made;
    if (made) {
      this.type = FreeThrowsType.ONE;
      this.setTypeString();         // can be changed with button
      this.fgMissedType = null;
    } else {
      this.typeString = null;
      this.fgMadeType = null;
    }
    this.typeSet = null;
    this.shooter = null;
    this.assist = null;
    this.assistQuery = false;
    this.freeThrowsReady = false;
    this.ftSuccess = [];
    this.rebounder = null;
    this.next = null;
  }

  fgType(fgType: number) {
   
    // this conditions does not need play, just set types
    if (!this.fgMade){
      if (fgType == 2) {
        this.type = FreeThrowsType.TWO;
      } else {
        this.type = FreeThrowsType.THREE;
      }
      this.setTypeString();           // can be changed with button
      this.fgMissedType = fgType;
      this.typeSet = true;
      this.fgMadeType = null;
    } else {
      this.type = FreeThrowsType.ONE;
      this.setTypeString();
      this.fgMadeType = fgType;
      this.typeSet = true;
      this.fgMissedType = null;
    }
    this.shooter = null;
    this.assist = null;
    this.assistQuery = false;
    this.freeThrowsReady = false;
    this.ftSuccess = [];
    this.rebounder = null;
    this.next = null;
  }

  ftShooter(freeThrowShooter: Player) {
    this.shooter = freeThrowShooter;
        // not sure if next two lines are necessary. reason they may be is if buttons are pushed in 
        // unplanned order, or repressed, does it mess things up with type and need to be reset.
        // I think it is needed as there are some conditions where this may be the first and/or 
        // only method that calls them (non-shooting fouls).
    this.setType();
    this.setTypeString();           // can be changed with button
    this.freeThrowsReady = true;

    // if field goal made need to ask for assist at this time
    if (this.fgMade){
      this.assistQuery = true;
      this.freeThrowsReady = false;
    }
    this.ftSuccess = [];
    this.madeFrontEnd = null;
    this.rebounder = null;
    this.next = null;
  }

  assistedBy(assistedBy: Player) {
    this.assist = assistedBy;
    this.freeThrowsReady = true;
  }

  ftMade(made: boolean, ftNum: number){
    var madeString: string;
    if (made) {
      madeString = "Made"
    } else { madeString = "Missed";}

    this.ftSuccess[ftNum - 1] = madeString;
    this.ftSuccess.length = ftNum;
    this.setNext(made, ftNum);
    console.log("Free throw: " + ftNum + this.ftSuccess[ftNum - 1]);
  }

  setType() {
    if (this.reason == "team-fouls") {
      console.log("in setType()");
      if (this.gameService.teamFouls == TeamFouls.PENALTY) {
        this.type = FreeThrowsType.TWO;
      } else if (this.gameService.teamFouls == TeamFouls.BOTH) {
        this.setFoulingTeam();
        // in overtime, check final period team fouls
        if (this.play.period > this.gameService.periods) {
          if (this.foulingTeam.fouls[this.gameService.periods - 1] >= this.gameService.penalty) {
            this.type = FreeThrowsType.TWO;
            console.log("in OT and over Penalty");
          } else {
            this.type = FreeThrowsType.ONE_AND_ONE;
          }  
        } else { // not in overtime, check fouls for play's period
          if (this.foulingTeam.fouls[this.play.period - 1]  >= this.gameService.penalty) {
            this.type = FreeThrowsType.TWO;
            console.log("not in OT and over Penalty");
          } else {
            this.type = FreeThrowsType.ONE_AND_ONE;
          }
        }
      } else {
        this.type = FreeThrowsType.ONE_AND_ONE;
      }
    }
  }

  setTypeString() {
    if (this.type == FreeThrowsType.TWO) {
      this.typeString = "Two";
    } else if (this.type == FreeThrowsType.ONE_AND_ONE) {
      this.typeString = "One and One";
    } else if (this.type == FreeThrowsType.ONE) {
      this.typeString = "One";
    } else {
      this.typeString = "Three";
    }
  }

  setFoulingTeam() {
    // set foulingTeam to team that commited the foul.
    // only needed when determining if bonus or penalty, so not used as 
    // optional parameter. 
    // BELOW IS SAME MESSAGE AS ALL TIMES USING THIS POTENTIAL UTILITY
    // maybe move this to a utility for team opposite. or a function of team
    // that returns an 'opposite' team. 
    if (this.team == this.gameService.awayTeam) {
      this.foulingTeam = this.gameService.homeTeam;
    } else {
      this.foulingTeam = this.gameService.awayTeam;
    }
  }

  setNext(made: boolean, ftNum: number){
    this.next = null;

    // first test for techcnical so missing type ONE doesnt bring rebound
    if (this.reason == "technical"){
      if (this.gameService.technicals == ftNum) {
        this.next = "submit";
      }
    } else { // not technical

      // find all conditions which a miss brings rebound into play
      if (!made && this.type == FreeThrowsType.ONE || !made && this.type == FreeThrowsType.ONE_AND_ONE
          || !made && this.type == FreeThrowsType.TWO && ftNum == 2 
          || !made && this.type == FreeThrowsType.THREE && ftNum == 3) {
            this.next = "rebound";
            if(this.type == FreeThrowsType.ONE_AND_ONE && ftNum == 1){
              this.madeFrontEnd = false;
            }
      } 
      // and those conditions which a make brings submit into play
      else if (made && this.type == FreeThrowsType.ONE 
          || made && this.type == FreeThrowsType.ONE_AND_ONE && ftNum == 2
          || made && this.type == FreeThrowsType.TWO && ftNum == 2
          || made && this.type == FreeThrowsType.THREE && ftNum == 3){
            this.next = "submit";
          }
      // set madeFrontEnd to shoot second bonus
      else if (made && this.type == FreeThrowsType.ONE_AND_ONE && ftNum == 1){
        this.madeFrontEnd = true;
      }
    }
    
  }

  reboundedBy(player: Player, team: Team) {
    this.rebounder = player;
    this.reboundingTeam = team;
    this.rebounderSet = true;
    console.log(player);
  }

  submit() {
    // credit all stats

    // should know everything we need to know. if fgMadeType is non null, the shot was made and field goal
    // attempt and make should be credited. 
    // ******************* need to include assist question after made field goal is affirmed *************
    // assist should be credited. 

    // if made fg att and make ++ and add points and assist?
    if (this.fgMade) {
      this.shooter.fgAttempts++;
      this.shooter.fgMakes++;
      this.shooter.points += this.fgMadeType;
      this.play.primary = this.shooter;
      this.play.team = this.team;

      if (this.fgMadeType == 3) {
        this.shooter.thrPtAttempts++;
        this.shooter.thrPtMakes++;
        this.team.points += 3;
        console.log(this.shooter.thrPtMakes);
        this.play.type = "3 point Field Goal Made";
        this.play.playType = PlayType.MADE_3;
      } else {
        this.team.points += 2;
        this.play.type = "2 point Field Goal Made";
        this.play.playType = PlayType.MADE_2;
      }
        
      if (this.assist){
        this.assist.assists++;
        console.log(this.assist.name + " " + this.assist.assists + " assists"); 
        this.play.secondaryType = "Assisted";
        this.play.secondary = this.assist;
      }
      
      this.play.extra = "Fouled on the shot";
      this.plays.add(this.play);
    }


    // whether fg made or not
    // credit free throw attempts and makes to shooter
    
    
    this.ftSuccess.forEach((ft, index) => {  
      this.play = new Play();
      this.play.primary = this.shooter;
      this.play.team = this.team;
      this.play.period = +this.route.snapshot.paramMap.get('period');
      this.play.minutes = +this.route.snapshot.paramMap.get('minutes');
      this.play.seconds = +this.route.snapshot.paramMap.get('seconds');
      this.play.priority = index + 1;

      this.shooter.ftAttempts++;
      if (ft == "Made"){
        this.shooter.ftMakes++;
        this.shooter.points++;
        this.team.points++;
        this.play.playType = PlayType.MADE_FT;
      } else {
        this.play.playType = PlayType.MISSED_FT;
      }

      if (this.type == FreeThrowsType.ONE_AND_ONE){
        if (index == 0){
          this.play.type = "Front End of Bonus " + ft;
        } else {
          this.play.type = "Second Shot of Bonus " + ft;
        }
      } else {
        this.play.type = "Free Throw " + (index + 1) + " of " + this.ftSuccess.length + " " + ft;
      }

      // need to only enter this condition for final rebounded free throw, not all free throws
      // when rebounding team is set
      if (this.reboundingTeam && (index + 1) == this.ftSuccess.length) {
  
        if (this.reboundingTeam == this.team) {
          // kept following condition separate from above condition due to eventual adding of team rebound stat
          if (this.rebounder) {
            this.rebounder.offRebounds++;
            this.play.secondary = this.rebounder;
          }
          this.play.secondaryType = "Offensive Rebound";
        } else { // call and use setFoulingTeam to get and credit defensive team for rebound
          if (this.rebounder) {
            this.rebounder.defRebounds++;
            this.play.secondary = this.rebounder;
          }
          this.setFoulingTeam();
          this.play.secondaryType = "Defensive Rebound";
        }
      }

      this.plays.add(this.play);
      
    });

    // navigate back to game page
    this.gameService.saveGameData();
    this.router.navigate(['/game']);
  }
}
