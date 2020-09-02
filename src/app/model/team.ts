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

    buildFromPlainObject(object: any) {

        this.name = object.name;
        this.benchTechnicals = object.benchTechnicals;
        this.timeouts = object.timeouts;
        this.points = object.points;

        object.fouls.forEach((fouls, index) => {        
            this.fouls[index] = fouls;
        });

        

        for(let i = 0; i < object.onCourt.length; i++) {
            console.log("player number: " + object.onCourt[i].name);
            var ocPlayer = new Player(object.onCourt[i].number);
                ocPlayer.buildFromPlainObject(object.onCourt[i]);
                this.onCourt.push(ocPlayer);
                this.roster.push(ocPlayer);
        }

        for(let i = 0; i < object.onBench.length; i++) {
            
            var benchPlayer = new Player(object.onBench[i].number);
                benchPlayer.buildFromPlainObject(object.onBench[i]);
                this.onBench.push(benchPlayer);
                this.roster.push(benchPlayer);
        }
                
        this.onCourt.sort((a,b) => a.number - b.number);
        this.onBench.sort((a,b) => a.number-b.number);
        this.roster.sort((a,b) => a.number-b.number);
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