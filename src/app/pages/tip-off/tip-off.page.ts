import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { GameService } from 'src/app/services/game.service';
import { PlaysLogService } from 'src/app/services/plays-log.service';
import { Play, PlayType } from 'src/app/model/play';

@Component({
  selector: 'app-tip-off',
  templateUrl: './tip-off.page.html',
  styleUrls: ['./tip-off.page.scss'],
})
export class TipOffPage implements OnInit {

  play: Play = new Play();

  constructor( public route: ActivatedRoute,
    public gameService: GameService,
    public router: Router,
    public plays: PlaysLogService) { }

  ngOnInit() {
    
    this.play.period = +this.route.snapshot.paramMap.get('period');
    if (this.play.period == 1) {
      this.play.minutes = this.gameService.periodMinutes;
    } else {
      this.play.minutes = this.gameService.overtimeMinutes;
    }
    this.play.seconds = 0;
    this.play.priority = 1;
    this.play.playType = PlayType.TIP;
  }

  controlledBy(team: string){

    if(team == "away"){
      this.gameService.possArrow = this.gameService.homeTeam;
      console.log("contolled by Away ");
      this.play.team = this.gameService.awayTeam;
      this.play.otherTeam = this.gameService.homeTeam;

    } else {
      this.gameService.possArrow = this.gameService.awayTeam;
      console.log("contolled by Home ");
      this.play.team = this.gameService.homeTeam;
      this.play.otherTeam = this.gameService.awayTeam;
    }

    // some sort of play log to add to plays
    this.plays.tipControl(this.play);

    this.gameService.saveGameData();
    this.router.navigate(['/game']);
  }

  help() {
    this.router.navigate(['/help']);
  }
}
