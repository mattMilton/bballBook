import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GameService } from 'src/app/services/game.service';
import { Player } from 'src/app/model/player';
import { Team } from 'src/app/model/team';
import { PlaysLogService } from 'src/app/services/plays-log.service';
import { Play, PlayType } from 'src/app/model/play';

@Component({
  selector: 'app-made-fg',
  templateUrl: './made-fg.page.html',
  styleUrls: ['./made-fg.page.scss'],
})
export class MadeFgPage implements OnInit {
 
  pts: number;
  scorer: Player;
  team: Team;
  assist: Player;
  assisterSet: boolean = false;
  play: Play = new Play();

  constructor(public route: ActivatedRoute,
    public router: Router,
    public gameService: GameService,
    public plays: PlaysLogService) { }
 
  ngOnInit() {
    this.pts = +this.route.snapshot.paramMap.get('pts');
    this.play.period = +this.route.snapshot.paramMap.get('period');
    this.play.minutes = +this.route.snapshot.paramMap.get('minutes');
    this.play.seconds = +this.route.snapshot.paramMap.get('seconds');
  }

  madeBy(player: Player, team: Team) {
    this.scorer = player;
    this.team = team;
    this.play.team = team;
  }

  assistedBy(player: Player) {
    this.assist = player;
    this.assisterSet = true;
    console.log(player);
  }

  submit() {
    // credit players with their stats
    this.scorer.points += this.pts;
    console.log(this.scorer.name + " " + this.scorer.points + " points");
    this.scorer.fgAttempts++;
    this.scorer.fgMakes++;
    this.team.points += this.pts;
    this.play.primary = this.scorer;

    if (this.pts == 3) {
      this.scorer.thrPtAttempts++;
      this.scorer.thrPtMakes++;
      console.log(this.scorer.thrPtMakes);
      this.play.type = "3 point Field Goal Made";
      this.play.playType = PlayType.MADE_3;
    } else {
      this.play.type = "2 point Field Goal Made";
      this.play.playType = PlayType.MADE_2;
    }
    
    if (this.assist){
      this.assist.assists++;
      console.log(this.assist.name + " " + this.assist.assists + " assists"); 
      this.play.secondaryType = "Assisted";
      this.play.secondary = this.assist;
    }
    
    // create and post a plays entry
    this.plays.add(this.play);
    console.log(this.play);

    // return to the game page
    this.gameService.saveGameData();
    this.router.navigate(['/game']);
  }
}
