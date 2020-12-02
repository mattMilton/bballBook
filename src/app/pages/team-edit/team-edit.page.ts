import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Team } from 'src/app/model/team';
import { Player } from 'src/app/model/player';
import { GameService } from 'src/app/services/game.service';
import { Loc } from 'src/app/model/loc';
import { SubType } from 'src/app/model/substitution';



@Component({
  selector: 'app-team-edit',
  templateUrl: './team-edit.page.html',
  styleUrls: ['./team-edit.page.scss'],
})
export class TeamEditPage implements OnInit {

  aOrH: Loc;
  locString: string;
  team: Team = new Team("");
  newPlayerNumber: number;
  newPlayerName: string;
  message: string;

  constructor(public route: ActivatedRoute,
              public router: Router,
              public game: GameService) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')
    if (id === "1") {
      this.aOrH = Loc.AWAY;
      this.locString = "Away";
      if (this.game.awayTeam) {
        this.team = this.game.awayTeam;
      }
    } else {
      this.aOrH = Loc.HOME;
      this.locString = "Home";
      if (this.game.homeTeam) {
        this.team = this.game.homeTeam;
      }
    }
  }

  removePlayer(player) {
    const index: number = this.team.roster.indexOf(player);
    if (index !== -1) {
      this.team.roster.splice(index, 1);
    }
  }

  addPlayer() {
    // assure number not in use
    let numberInUse = false;
    numberInUse = this.team.roster.some(a => a.number == this.newPlayerNumber)
  
    if (!numberInUse && this.newPlayerNumber) {

      let playerToAdd = new Player(this.newPlayerNumber);
      if (this.newPlayerName) {
        playerToAdd.name = this.newPlayerName;
      }
      // add to roster and sort by number
      this.team.roster.push(playerToAdd);
      this.team.roster.sort((a,b) => a.number-b.number);
      // add to starting roster til full then to bench
      if (this.team.onCourt.length < 5) {
        console.log("in condition adding player to onCourt");
        this.team.onCourt.push(playerToAdd);
        this.team.onCourt.sort((a,b) => a.number-b.number);
      } else {
        console.log("in condition adding player to onBench");
        this.team.onBench.push(playerToAdd);
        this.team.onBench.sort((a,b) => a.number-b.number);
      }
      this.newPlayerNumber = null;
      this.newPlayerName = null;
      this.message = ""
    } else {
      // number in use or no number given, alert user somehow
      if (!this.newPlayerNumber) {
        this.message = "New Player must have a number. ";
      } else {
        this.message = "Number already in use. ";
      }
    }

  }

  saveTeam() {
    this.game.saveTeam(this.team, this.aOrH);
    this.router.navigate(['/game-setup']);
  }

  help() {
    this.router.navigate(['/help']);
  }
}
