import { Player } from './player';
import { Team } from './team';

export enum PlayType { MADE_2, MADE_3, MISSED_2, MISSED_3, TO, FOUL, TECH,
                    MADE_FT, MISSED_FT, SUB, TIP, JUMP, TIMEOUT, OFFENSIVE_FOUL, PERIOD }

export class Play {
    team: Team;
    period: number;
    minutes: number;
    seconds: number;
    priority: number;
    type: string;    
    playType: PlayType;       
    primary: Player;
    secondaryType: string;
    secondary: Player;
    tertiary: Player;
    tertiaryType: string;
    extra: string;
    extraTF: string;
    deletable: boolean;
    otherTeam: Team;


    message: string;

    constructor() {}

    setPrimData(data: any) {
        this.period = data.period;
        this.minutes = data.minutes;
        this.seconds = data.seconds;
        this.priority = data.priority;
        this.type = data.type;
        this.playType = data.playType;
        this.secondaryType = data.secondaryType;
        this.tertiaryType = data.tertiaryType;
        this.extra = data.extra;
        this.extra = data.extraTF;
        this.deletable = data.deletable;
        this.message = data.message;
    }

    periodMessage(status: string) {
        this.message = status + " of Period " + this.period;
        if (status == "Start" && this.team) {
            this.message += " " + this.team.name + " Starts with the Ball.";
        }
    }

    setMessage() {
        this.deletable = true; // any type that uses this method is deletable
    
        this.message = this.minutes.toString() + ":"; 
        
        if (this.seconds < 10) {
            this.message += "0"
        }
        this.message += this.seconds.toString() + " " + this.team.name + " " + this.type + " by "; 

        if (this.primary) {
            this.message += "#" + this.primary.number;
            if (this.primary.name) {
                this.message += " " + this.primary.name;
            }
        } else {
            // so far only condition without a primary player is technical foul on bench
            if (this.type == "Technical Foul"){
                this.message += "Bench";
            }
            // and team rebound
            // pretty sure this condition is no longer ever met now that rebound is now only
            // a secondary type, had been primary type on free throw rebound, but 
            // this has been changed vvvvv
            if (this.type == "Offensive Rebound" || this.type == "Defensive Rebound"){
                this.message += "Team";
            }
        }

        if (this.secondary) {
            this.message += ", " + this.secondaryType + " by #" + this.secondary.number;
            if (this.secondary.name) {
                this.message += " " + this.secondary.name;
            }
        }

        if (this.tertiary) {
            this.message += ", " + this.tertiaryType + " by #" + this.tertiary.number;
            if (this.tertiary.name) {
                this.message += " " + this.tertiary.name;
            }
        }

        if (this.extra) {
            this.message += ", " + this.extra;
        }

        if (this.extraTF) {
            this.message += ", " + this.extraTF;
        }
    }

    subMessage() {
        this.deletable = true; // andy type that uses this method is deletable
        this.message = this.minutes.toString() + ":";

        if (this.seconds < 10) {
            this.message += "0";
        }
        this.message += this.seconds.toString() + " " + this.team.name + " Substitutes #" + this.primary.number; 
        
        if (this.primary.name) {
            this.message += " " + this.primary.name; + " in for "
        }

        this.message += " in for #" + this.secondary.number;

        if (this.secondary.name) {
            this.message += " " + this.secondary.name;
        }
    }

    tipControlMessage() {
        this.type = "Tip-Off";
        this.priority = 1;
        this.message = this.minutes.toString() + ":00 Tip-off Controlled by " + this.team.name;
    }

    jumpBallMessage() {
        this.deletable = true; // andy type that uses this method is deletable
        this.type = "Jump Ball"
        this.message = this.minutes.toString() + ":";

        if (this.seconds < 10) {
            this.message += "0";
        }
        this.message += this.seconds.toString() + " Jump Ball. Possession Goes to " 
            + this.team.name;
    }

    timeOutMessage() {
        this.deletable = true; // andy type that uses this method is deletable
        this.type = "Timeout"
        this.message = this.minutes.toString() + ":";

        if (this.seconds < 10) {
            this.message += "0";
        }
        this.message += this.seconds.toString() + " Timeout Taken by " + this.team.name; 
    }

    changeTeam() {
        var team: Team = this.otherTeam;
        this.otherTeam = this.team;
        this.team = team;
    }
}