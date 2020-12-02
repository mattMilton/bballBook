import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GameService } from 'src/app/services/game.service';
import { PlaysLogService } from 'src/app/services/plays-log.service';
import { Play, PlayType } from 'src/app/model/play';
import { Team } from 'src/app/model/team';
import { Player } from 'src/app/model/player';

@Component({
  selector: 'app-turnover',
  templateUrl: './turnover.page.html',
  styleUrls: ['./turnover.page.scss'],
})
export class TurnoverPage implements OnInit {

  committer: Player;
  team: Team;
  offensive: boolean;
  stealer: Player;
  stealerTeam: Team;
  stealerSet: boolean;
  play: Play = new Play();

  constructor(public route: ActivatedRoute,
    public router: Router,
    public gameService: GameService,
    public plays: PlaysLogService) { }

  ngOnInit() {
    this.play.period = +this.route.snapshot.paramMap.get('period');
    this.play.minutes = +this.route.snapshot.paramMap.get('minutes');
    this.play.seconds = +this.route.snapshot.paramMap.get('seconds');
  }

  turnoverBy(player: Player, team: Team){
    this.committer = player;
    this.team = team;
    this.play.team = team;

    // set stealerTeam to team that did not turn ball over.
    // maybe move this to a utility for team opposite. or a function of team
    // that returns an 'opposite' team. 
    // COPIED AND PASTED FROM BLOCKERTEAM IN MISSED FG
    if (this.team == this.gameService.awayTeam) {
      this.stealerTeam = this.gameService.homeTeam;
    } else {
      this.stealerTeam = this.gameService.awayTeam;
    }
  }

  offensiveFoul(off: boolean){
    this.offensive = off;
    if (off) {
      this.stealer = null;
      this.stealerSet = null;
      this.play.playType = PlayType.OFFENSIVE_FOUL;
    }
  }

  stolenBy(player: Player){
    this.stealer = player;
    this.stealerSet = true;
  }

  submit(){

    // var for navigation parameter
    var whistle = true;  // set to false only if steal

    // credit players their stats

    this.committer.turnovers++;
    this.play.primary = this.committer;
    if (this.offensive){
      this.play.type = "Offensive Foul";
      this.play.playType = PlayType.OFFENSIVE_FOUL;
      this.committer.fouls++;
      this.play.extra = "Personal Foul: " + this.committer.fouls;
      if (this.committer.fouls >= this.gameService.maxPersonalFouls){
        this.play.extra += " FOULED OUT";
      }
    } else {
      this.play.type = "Turnover";
      this.play.playType = PlayType.TO;

      if (this.stealer){
        this.play.secondary = this.stealer;
        this.play.secondaryType = "Stolen";
        this.stealer.steals++;
        whistle = false;
      }
    }


    // create and post a plays entry
    this.plays.add(this.play);
    console.log(this.play);


    // return to the game page
    this.gameService.saveGameData();
    this.committer = null;
    this.team = null;
    this.offensive = null;
    this.stealer = null;
    this.stealerTeam = null;
    this.stealerSet = null;
    this.play = new Play();

    // if (whistle) {
    //   this.router.navigate(['/game', {clock: 'stop'}]);
    // } else {
    //   this.router.navigate(['/game']);
    // }

    this.router.navigate(['/game']);
  }

  help() {
    this.router.navigate(['/help']);
  }
}
