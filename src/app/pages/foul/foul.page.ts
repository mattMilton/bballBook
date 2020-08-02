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
  blocker: Player;
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
    // set team fouls and personal fouls
    this.teamFouls = ++this.team.fouls[this.play.period - 1];
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
          this.router.navigate(['/free-throws/team-fouls/' + this.fouledTeam + "/" + this.play.period + "/"
                + this.play.minutes + "/" + this.play.seconds]);
        } else {
          // no free throws not yet to limit
          console.log ("not yet to limit, no free throws");
          // no resulting free-throws return to game page
          this.router.navigate(['/game']);
        }
      } else {
        // penalty is the minimum value to shoot free throws on non shooting fouls
        if (this.teamFouls >= this.gameService.penalty){
          console.log("shooting free throws over penalty limit");
          this.router.navigate(['/free-throws/team-fouls/' + this.fouledTeam + "/" + this.play.period + "/"
                + this.play.minutes + "/" + this.play.seconds]);
        } else {
          // no free throws not yet to limit
          console.log ("not yet to limit, no free throws");
          // no resulting free-throws return to game page
          this.router.navigate(['/game']);
        }
      }
    } else {
      // shooting foul
      this.router.navigate(['/free-throws/shooting/' + this.fouledTeam + "/" + this.play.period + "/"
                + this.play.minutes + "/" + this.play.seconds]);
    }

  }
}
