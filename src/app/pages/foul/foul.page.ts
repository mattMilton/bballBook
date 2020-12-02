import { Component, OnInit } from '@angular/core';
import { Player } from 'src/app/model/player';
import { Team } from 'src/app/model/team';
import { Play, PlayType } from 'src/app/model/play';
import { ActivatedRoute, Router } from '@angular/router';
import { GameService } from 'src/app/services/game.service';
import { PlaysLogService } from 'src/app/services/plays-log.service';
import { TeamFouls } from 'src/app/model/teamFouls';

@Component({
  selector: 'app-foul',
  templateUrl: './foul.page.html',
  styleUrls: ['./foul.page.scss'],
})
export class FoulPage implements OnInit {

  fouler: Player;
  team: Team;
  fouledTeam: string;
  shooting: boolean;
  teamFouls: number;
  play: Play = new Play();

  constructor(public route: ActivatedRoute,
    public router: Router,
    public gameService: GameService,
    public plays: PlaysLogService) { }

  ngOnInit() {
    this.play.period = +this.route.snapshot.paramMap.get('period');
    this.play.minutes = +this.route.snapshot.paramMap.get('minutes');
    this.play.seconds = +this.route.snapshot.paramMap.get('seconds');
    this.play.priority = 0;   // higher priority than resulting free throws
  }

  fouledBy(player: Player, team: Team){
    this.fouler = player;
    this.team = team;
    this.play.team = team;
    
    // set fouledTeam to team that did not foul.
    // maybe move this to a utility for team opposite. or a function of team
    // that returns an 'opposite' team. 
    // differs from other oppositing functions in that it creates a string for url parameters
    if (this.team == this.gameService.awayTeam) {
      this.fouledTeam = "home";
    } else {
      this.fouledTeam = "away";
    }
  }

  shootingFoul(shooting: boolean){
    this.shooting = shooting;
  }

  submit(){
    // vars to hold nav parameters so we can set play to new play before navigation
    var shootingTeam;
    var per;
    var mins;
    var secs;

    // set team fouls and personal fouls
    if (this.play.period > this.gameService.periods) {
      this.teamFouls = ++this.team.fouls[this.gameService.periods - 1];
    } else {
      this.teamFouls = ++this.team.fouls[this.play.period - 1];
    }
    this.fouler.fouls++;
    this.play.primary = this.fouler;
    this.play.type = "Defensive Foul";
    this.play.playType = PlayType.FOUL;
    this.play.extra = "Personal Foul: " + this.fouler.fouls;
    this.play.extraTF = " Team Foul: " + this.teamFouls;
    if (this.fouler.fouls >= this.gameService.maxPersonalFouls){
      this.play.extra += " FOULED OUT";
    }
    this.plays.add(this.play);

    // if not shooting determine if bonus or penalty
    if (this.shooting == false){
      if (this.gameService.teamFouls == TeamFouls.BONUS || this.gameService.teamFouls == TeamFouls.BOTH) {
        // bonus is the minimun value to shoot free throws on non shooting fouls
        if (this.teamFouls >= this.gameService.bonus){
          console.log("shooting free throws over bonus limit ");

          // reset all page variables
          this.fouler = null;
          this.team = null;
          shootingTeam = this.fouledTeam;
          this.fouledTeam = null;
          this.shooting = null;
          this.teamFouls = null;
          per = this.play.period;
          mins = this.play.minutes;
          secs = this.play.seconds;
          this.play = new Play();

          this.router.navigate(['/free-throws/team-fouls/' + shootingTeam + "/" + per + "/"
                + mins + "/" + secs]);
        } else {
          // no free throws not yet to limit
          console.log ("not yet to limit, no free throws");
          // no resulting free-throws return to game page
          this.gameService.saveGameData();

          // reset all page variables
          this.fouler = null;
          this.team = null;
          this.fouledTeam = null;
          this.shooting = null;
          this.teamFouls = null;
          this.play = new Play();

          this.router.navigate(['/game']);
        }
      } else {
        // penalty is the minimum value to shoot free throws on non shooting fouls
        if (this.teamFouls >= this.gameService.penalty){
          console.log("shooting free throws over penalty limit");

          // reset all page variables
          this.fouler = null;
          this.team = null;
          shootingTeam = this.fouledTeam;
          this.fouledTeam = null;
          this.shooting = null;
          this.teamFouls = null;
          per = this.play.period;
          mins = this.play.minutes;
          secs = this.play.seconds;
          this.play = new Play();

          this.router.navigate(['/free-throws/team-fouls/' + shootingTeam + "/" + per + "/"
                + mins + "/" + secs]);
        } else {
          // no free throws not yet to limit
          console.log ("not yet to limit, no free throws");
          // no resulting free-throws return to game page
          this.gameService.saveGameData();

          // reset all page variables
          this.fouler = null;
          this.team = null;
          this.fouledTeam = null;
          this.shooting = null;
          this.teamFouls = null;
          this.play = new Play();

          this.router.navigate(['/game']);
        }
      }
    } else {
      // shooting foul

      // reset all page variables
      this.fouler = null;
      this.team = null;
      shootingTeam = this.fouledTeam;
      this.fouledTeam = null;
      this.shooting = null;
      this.teamFouls = null;
      per = this.play.period;
      mins = this.play.minutes;
      secs = this.play.seconds;
      this.play = new Play();

      this.router.navigate(['/free-throws/shooting/' + shootingTeam + "/" + per + "/"
                + mins + "/" + secs]);
    }

  }

  help() {
    this.router.navigate(['/help']);
  }
}
