import { Component, OnInit } from '@angular/core';
import { Player } from 'src/app/model/player';
import { Team } from 'src/app/model/team';
import { Play, PlayType } from 'src/app/model/play';
import { ActivatedRoute, Router } from '@angular/router';
import { GameService } from 'src/app/services/game.service';
import { PlaysLogService } from 'src/app/services/plays-log.service';

@Component({
  selector: 'app-technical',
  templateUrl: './technical.page.html',
  styleUrls: ['./technical.page.scss'],
})
export class TechnicalPage implements OnInit {

  player: Player;
  bench: boolean;
  team: Team;
  shootingTeam: string;
  play:Play = new Play();

  constructor(public route: ActivatedRoute,
    public router: Router,
    public gameService: GameService,
    public plays: PlaysLogService) { }

  ngOnInit() {
    this.play.period = +this.route.snapshot.paramMap.get('period');
    this.play.minutes = +this.route.snapshot.paramMap.get('minutes');
    this.play.seconds = +this.route.snapshot.paramMap.get('seconds');
    this.play.priority = 0; // higher priority than resulting free throw(s)
  }

  technical(player: Player, team: Team){
    this.player = player;
    this.team = team;
    this.play.team = team;

    if (!player) {
      this.bench = true;
    } else {
      this.bench = false;
    }
    
    // set shootingTeam to team that did not commit technical.
    // maybe move this to a utility for team opposite. or a function of team
    // that returns an 'opposite' team. 
    // differs from other oppositing functions in that it creates a string for url parameters
    // COPIED FROM FOUL.PAGE.TS
    if (this.team == this.gameService.awayTeam) {
      this.shootingTeam = "home";
    } else {
      this.shootingTeam = "away";
    }
  }

  submit(){
    // increment technical count and log play
    if (this.player){
      this.player.technicalFouls++;
      this.play.extra = "Technical Foul: " + this.player.technicalFouls;
    } else {
      this.team.benchTechnicals++;
      this.play.extra = "Technical Foul: " + this.team.benchTechnicals;
      console.log("this.player testing false");
    }

    this.play.primary = this.player;
    this.play.type = "Technical Foul";
    this.play.playType = PlayType.TECH;
    this.plays.add(this.play);

    // shooting foul
    this.router.navigate(['/free-throws/technical/' + this.shootingTeam + "/" + this.play.period + "/"
    + this.play.minutes + "/" + this.play.seconds]);
  }
}
