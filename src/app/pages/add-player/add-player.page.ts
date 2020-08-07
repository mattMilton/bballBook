import { Component, OnInit } from '@angular/core';
import { Team } from 'src/app/model/team';
import { ActivatedRoute, Router } from '@angular/router';
import { GameService } from 'src/app/services/game.service';
import { Player } from 'src/app/model/player';

@Component({
  selector: 'app-add-player',
  templateUrl: './add-player.page.html',
  styleUrls: ['./add-player.page.scss'],
})
export class AddPlayerPage implements OnInit {

  team: Team;
  newPlayerNumber: number;
  newPlayerName: string;
  player: Player;
  message: string;

  constructor(public route: ActivatedRoute,
              public router: Router,
              public game: GameService) { }

  ngOnInit() {
    const teamName = this.route.snapshot.paramMap.get('team');
    if (teamName === "away") {
        this.team = this.game.awayTeam;
    } else {
        this.team = this.game.homeTeam;
    }
  }

  submit() {

    // need to check for number // must have a number..........
    let numberInUse = false;
    numberInUse = this.team.roster.some(a => a.number == this.newPlayerNumber);

    if (!numberInUse && this.newPlayerNumber) {
      this.player = new Player(this.newPlayerNumber);
      if (this.newPlayerName) {
        this.player.name = this.newPlayerName;
      }
      this.team.roster.push(this.player);
      this.team.roster.sort((a,b) => a.number-b.number);
      this.team.onBench.push(this.player);
      this.team.onBench.sort((a,b) => a.number-b.number);
  
      this.game.saveGameData();
      this.router.navigate(['/game']);
    } else {
      // either number in use or no number given, alert user somehow
      if (!this.newPlayerNumber) {
        this.message = "New Player must have a number. ";
      } else {
        this.message = "Number already in use. ";
      }
    }

    
  }
}
