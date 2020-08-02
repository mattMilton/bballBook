import { Substitution, SubType } from './substitution';
import { Play } from './play';

export class Player {
    name: string;
    number: number;
    points: number = 0;
    assists: number = 0;
    fgAttempts: number = 0;
    fgMakes: number = 0;
    thrPtAttempts: number = 0;
    thrPtMakes: number = 0;
    ftAttempts: number = 0;
    ftMakes: number = 0;
    blocks: number = 0;
    defRebounds: number = 0;
    offRebounds: number = 0;
    steals: number = 0;
    turnovers: number = 0;
    fouls: number = 0;
    technicalFouls: number = 0;
    minutes: number = 0;

    subLog: Array<Substitution> = [];

    constructor(number: number) {
        this.number = number;
    }

    updateMinutes(period: number, minutes: number, seconds: number, 
                    periodLength: number) {

        let secondsPlayed = 0;               
        var lastIn = new Substitution();

        // iterate the sub log, assign each sub-in as the new lastIn, 
        // each sub-out is then subtracted from the last sub-in 
        this.subLog.forEach(sub => {
            console.log(sub.subType);
            if (sub.subType == SubType.SUB_IN) {
                lastIn = sub;
            } else {                
                // get value for seconds from both lastIn and 
                let lastInSeconds = lastIn.minutes * 60 + lastIn.seconds;

                // from sub (it should be a sub-out)
                let subOutSeconds = sub.minutes * 60 + sub.seconds;

                // subtract sub seconds from lastIn seconds
                let secondsDifference = lastInSeconds - subOutSeconds;

                console.log(lastInSeconds + " " + subOutSeconds + " " + secondsDifference);

                // increment this functions seconds by this value
                secondsPlayed += secondsDifference;

                
                // increment this.seconds by period length in seconds times
                // difference in lastIn period and sub period (player played through
                // at least on period change)
                let lastInPeriod = lastIn.period;
                let subOutPeriod = sub.period;
                let fullPeriodSeconds = periodLength * 60;
                
                let periodSecondsToAdd = (subOutPeriod - lastInPeriod) * fullPeriodSeconds;
                
                secondsPlayed += periodSecondsToAdd;
                
            } 
        });
        
        // if last element of subLog is a SUB_IN, seconds should be 
        // incemented from the last SUB_IN until current time. 
        
        if (this.subLog[this.subLog.length - 1].subType == 0) {

            // value of last sub in
            let lastInSeconds = this.subLog[this.subLog.length - 1].minutes * 60 
                                    + this.subLog[this.subLog.length - 1].seconds;

            // current seconds
            let currentSeconds = minutes * 60 + seconds;
            let secondsDifference = lastInSeconds - currentSeconds;

            console.log(lastInSeconds + " " + currentSeconds + " " + secondsDifference);

            // increment this functions seconds by this value
            secondsPlayed += secondsDifference;

            // increment this functions seconds by period length in seconds times
            // difference in lastIn period and current period (player has been 
            // playing through at least one period change)
            let lastInPeriod = this.subLog[this.subLog.length -1].period;
            let fullPeriodSeconds = periodLength * 60;

            let periodSecondsToAdd = (period - lastInPeriod) * fullPeriodSeconds;

            secondsPlayed += periodSecondsToAdd;

            this.minutes = Math.round(secondsPlayed / 60);
            console.log(Math.round(secondsPlayed / 60));
        }

    }

    removeSubLogEntry(play: Play) {
        console.log("*********Remove Sub Log Entry**********Player: " + this.name);
        console.log("Play Primary: " + play.primary.name);
        console.log("Play Secondary: " + play.secondary.name);
        console.log("Play Time/Period: " + play.period + "--" + play.minutes + ":" + play.seconds);
        this.subLog.some((entry, index) => {
            console.log("entry number: " + index);
            console.log("entry subType: " + entry.subType);
            console.log("entry Time/Period: " + entry.period + "--" + entry.minutes + ":" + entry.seconds);
            // must be correct substitution, same period, minutes, and seconds
            if (play.period == entry.period && play.minutes == entry.minutes && play.seconds == entry.seconds) {
                console.log("met period and time conditions");
                // and must be same direction
                if (this == play.primary && entry.subType == SubType.SUB_IN) {
                    console.log("and direction condition");
                    this.subLog.splice(index, 1);
                    return true;
                } else if (this == play.secondary && entry.subType == SubType.SUB_OUT) {
                    console.log("and direction condition");
                    this.subLog.splice(index, 1);
                    return true;
                }


            }
        })
    }

    sortSubLog() {    
        this.subLog.sort((a, b) => {
            if (a.period == b.period) {
            if (a.minutes == b.minutes) {
                return a.seconds < b.seconds ? 1 : -1;
            }
            return a.minutes < b.minutes ? 1 : -1;
            }
            return a.period > b.period ? 1 : -1;
        })  
    
        // // above sort does not assure proper ordering in same time instances     
        this.subLog.forEach((sub, index) => {
            sub.subType = index % 2;
            console.log("sub number: " + index + " type: " + sub.subType)
        })
    }
}