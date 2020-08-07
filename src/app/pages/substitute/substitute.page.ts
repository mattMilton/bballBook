import { Component, OnInit, ɵAPP_ID_RANDOM_PROVIDER } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GameService } from 'src/app/services/game.service';
import { PlaysLogService } from 'src/app/services/plays-log.service';
import { Team } from 'src/app/model/team';
import { Player } from 'src/app/model/player';
import { Play, PlayType } from 'src/app/model/play';
import { SubType, Substitution } from 'src/app/model/substitution'; 
import { OnCourt } from 'src/app/model/onCourt';
import { OnCourtHistoryService } from 'src/app/services/on-court-history.service';

@Component({
  selector: 'app-substitute',
  templateUrl: './substitute.page.html',
  styleUrls: ['./substitute.page.scss'],
})
export class SubstitutePage implements OnInit {

  team: Team;
  primaryPlayer: Player;
  dir: string;
  secondaryPlayer: Player;
  play: Play = new Play();
  subType: SubType;
  subIn: Substitution;
  subOut: Substitution;

  constructor(public route: ActivatedRoute,
    public router: Router,
    public gameService: GameService,
    public plays: PlaysLogService,
    public onCourtHistory: OnCourtHistoryService) { }

  ngOnInit() {
    if (this.route.snapshot.paramMap.get('team') == "away") {
      this.team = this.gameService.awayTeam;
    } else {
      this.team = this.gameService.homeTeam;
    }
    this.primaryPlayer = this.team.getPlayerByNumber(+this.route.snapshot.paramMap.get('number'));
    console.log("player selected was: " + this.primaryPlayer.name);
    this.dir = this.route.snapshot.paramMap.get('dir');
    this.play.period = +this.route.snapshot.paramMap.get('period');
    this.play.minutes = +this.route.snapshot.paramMap.get('minutes');
    this.play.seconds = +this.route.snapshot.paramMap.get('seconds');

    this.subIn = { subType: SubType.SUB_IN, period: this.play.period, minutes: this.play.minutes, 
                    seconds: this.play.seconds};
    this.subOut = { subType: SubType.SUB_OUT, period: this.play.period, minutes: this.play.minutes,
                    seconds: this.play.seconds};

    this.play.team = this.team;
    this.play.type = "Substitution";

  }

  sub(player: Player) {
    this.secondaryPlayer = player;
    this.play.playType = PlayType.SUB;
    
    // swap primary and secondary player
    if (this.dir == "out") {
      this.team.onBench.push(this.primaryPlayer);
      this.team.onCourt.push(this.secondaryPlayer);
      this.subType = SubType.SUB_OUT;

      // remove secondary player from the bench
      const indexBench = this.team.onBench.indexOf(this.secondaryPlayer, 0);
      if (indexBench > -1) {
         this.team.onBench.splice(indexBench, 1);
      }

      // remove primary player from the court
      const indexCourt = this.team.onCourt.indexOf(this.primaryPlayer, 0);
      if (indexCourt > -1) {
        this.team.onCourt.splice(indexCourt, 1);
      }
      
      // log both players substitutions
      this.primaryPlayer.subLog.push(this.subOut);
      this.secondaryPlayer.subLog.push(this.subIn);

      // for play log primary is always considered to be the player substituting in
      // and secondary the player subing out
      this.play.primary = this.secondaryPlayer;
      this.play.secondary = this.primaryPlayer;

    }
    
    if (this.dir == "in") {
      this.team.onCourt.push(this.primaryPlayer);
      this.team.onBench.push(this.secondaryPlayer);
      
      // remove secondary player from court
      const indexCourt = this.team.onCourt.indexOf(this.secondaryPlayer, 0);
      if (indexCourt > -1) {
        this.team.onCourt.splice(indexCourt, 1);
      }
      
      // remove primary player from bench
      const indexBench = this.team.onBench.indexOf(this.primaryPlayer, 0);
      if (indexBench > -1) {
        this.team.onBench.splice(indexBench, 1);
      }

       // log both players substitutions
       this.primaryPlayer.subLog.push(this.subIn);
       this.secondaryPlayer.subLog.push(this.subOut);

       // for play log primary is always considered to be the player substituting in
      // and secondary the player subing out
      this.play.primary = this.primaryPlayer;
      this.play.secondary = this.secondaryPlayer;
    }

    // sort both lists by number
    this.team.onCourt.sort((a,b) => a.number-b.number);
    this.team.onBench.sort((a,b) => a.number-b.number);

    


    console.log(this.primaryPlayer.subLog);
    console.log(this.secondaryPlayer.subLog);

    // log play to playLog
    this.plays.substitution(this.play);

    this.primaryPlayer.updateMinutes(this.play.period, this.play.minutes, this.play.seconds,
                                    this.gameService.periodMinutes);

    // call on gameService to create and add an onCourtHistory record
    // this.gameService.addOnCourtRecord(this.play.period, this.play.minutes * 60 +
    //                                         this.play.seconds);

    // instead create an onCourt and add it with onCourtHistoryService
    var onCourt: OnCourt = new OnCourt();
    onCourt.play = this.play;
    onCourt.period = this.play.period;
    onCourt.timeLeft = this.play.minutes * 60 + this.play.seconds;
    this.gameService.awayTeam.onCourt.forEach(player => {
      onCourt.awayOnCourt.push(player);
    });
    this.gameService.homeTeam.onCourt.forEach(player => {
      onCourt.homeOnCourt.push(player);
    });
    this.onCourtHistory.add(onCourt);

    // navigate back to game page
    this.gameService.saveGameData();
    this.router.navigate(['game']);
  }

  noSub() {
    this.router.navigate(['game']);
  }
}
