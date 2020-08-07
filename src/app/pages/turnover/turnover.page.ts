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

  player: Player;
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
    this.player = player;
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
    // credit players their stats

    this.player.turnovers++;
    this.play.primary = this.player;

    if (this.offensive){
      this.play.type = "Offensive Foul";
      this.play.playType = PlayType.OFFENSIVE_FOUL;
      this.player.fouls++;
      this.play.extra = "Personal Foul: " + this.player.fouls;
      if (this.player.fouls >= this.gameService.maxPersonalFouls){
        this.play.extra += " FOULED OUT";
      }
    } else {
      this.play.type = "Turnover";
      this.play.playType = PlayType.TO;

      if (this.stealer){
        this.play.secondary = this.stealer;
        this.play.secondaryType = "Stolen";
        this.stealer.steals++;
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
