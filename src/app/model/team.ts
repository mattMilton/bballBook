import { Player } from './player'


export class Team {
    name: string;
    roster: Array<Player> = [];
    onCourt: Array<Player> = [];
    onBench: Array<Player> = [];
    fouls: Array<number> = [];
    benchTechnicals: number = 0;    // player technicals kept in player class
    timeouts: number; 
    points: number = 0;
    
    constructor(name: string) {
        this.name = name;
    }

    getPlayerByNumber(num: number): Player {

      var playerToReturn: Player;  

      this.roster.forEach(player => {
          if (player.number == num) {
              console.log("player: " + player.name);
              playerToReturn = player;
          }
      })
      return playerToReturn;
    }
}