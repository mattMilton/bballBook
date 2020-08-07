import { Component, OnInit } from '@angular/core';
import { Player } from 'src/app/model/player';
import { Team } from 'src/app/model/team';
import { ActivatedRoute, Router } from '@angular/router';
import { GameService } from 'src/app/services/game.service';
import { Play, PlayType } from 'src/app/model/play';
import { PlaysLogService } from 'src/app/services/plays-log.service';

@Component({
  selector: 'app-missed-fg',
  templateUrl: './missed-fg.page.html',
  styleUrls: ['./missed-fg.page.scss'],
})
export class MissedFgPage implements OnInit {

  type: number;
  attempter: Player;
  team: Team;
  blocker: Player;
  blockerTeam: Team;
  blockerSet: boolean;
  rebounder: Player;
  reboundingTeam: Team;
  rebounderSet: boolean;
  play: Play = new Play();


  constructor(public route: ActivatedRoute,
    public router: Router,
    public gameService: GameService,
    public plays: PlaysLogService) { }
  
  ngOnInit() {
    this.type = +this.route.snapshot.paramMap.get('type');
    this.play.period = +this.route.snapshot.paramMap.get('period');
    this.play.minutes = +this.route.snapshot.paramMap.get('minutes');
    this.play.seconds = +this.route.snapshot.paramMap.get('seconds');
  }

  missedBy(player: Player, team: Team) {
    this.attempter = player;
    this.team = team;
    this.play.team = team;
    
    // set blockerTeam to team that did not miss the shot.
    // maybe move this to a utility for team opposite. or a function of team
    // that returns an 'opposite' team.
    if (this.team == this.gameService.awayTeam) {
      this.blockerTeam = this.gameService.homeTeam;
    } else {
      this.blockerTeam = this.gameService.awayTeam;
    }
  }

  blockedBy(player: Player) {
    this.blocker = player;
    this.blockerSet = true;
    console.log(player);
  }

  reboundedBy(player: Player, team: Team) {
    this.rebounder = player;
    this.reboundingTeam = team;
    this.rebounderSet = true;
    console.log(player);
  }

  submit() {
    // credit players with their stats
  
    this.attempter.fgAttempts++;
    this.play.primary = this.attempter;

    if (this.type == 3) {
      this.attempter.thrPtAttempts++;
      this.play.type = "3 point Field Goal Missed";
      this.play.playType = PlayType.MISSED_3;
    } else {
      this.play.type = "2 point Field Goal Missed";
      this.play.playType = PlayType.MISSED_2;
    }  
    
    if (this.blocker){
      this.blocker.blocks++;
      this.play.secondaryType = "Blocked";
      this.play.secondary = this.blocker;
      console.log(this.blocker.name + " " + this.blocker.blocks + " blocks"); 
    }

    if (this.reboundingTeam == this.team) {
      // kept following condition separate from above condition due to eventual adding of team rebound stat
      if (this.rebounder) {
        this.rebounder.offRebounds++;
        this.play.tertiaryType = "Offensive Rebound";
        this.play.tertiary = this.rebounder;
      }
    } else {
      if (this.rebounder) {
        this.rebounder.defRebounds++;
        this.play.tertiaryType = "Defensive Rebound";
        this.play.tertiary = this.rebounder;
      }
    }
    
    // create and post a plays entry
    this.plays.add(this.play);
    console.log(this.play);


    // return to the game page
    this.gameService.saveGameData();
    this.router.navigate(['/game']);
  }
}
