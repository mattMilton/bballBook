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

    buildFromPlainObject(object: any) {
        this.name = object.name;
        this.number = object.number;
        this.points = object.points;
        this.assists = object.assists;
        this.fgAttempts = object.fgAttempts;
        this.fgMakes = object.fgMakes;
        this.thrPtAttempts = object.thrPtAttempts;
        this.thrPtMakes = object.thrPtMakes;
        this.blocks = object.blocks;
        this.defRebounds = object.defRebounds;
        this.offRebounds = object.offRebounds;
        this.steals = object.steals;
        this.turnovers = object.turnovers;
        this.fouls = object.fouls;
        this.technicalFouls = object.technicalFouls;
        this.minutes = object.minutes;

        for(let i = 0; i < object.subLog.length; i++) {
        
            var sub = new Substitution();
            sub.subType = object.subLog[i].subType;
            sub.period = object.subLog[i].period;
            sub.minutes = object.subLog[i].minutes;
            sub.seconds = object.subLog[i].seconds;
            
            this.subLog.push(sub);
        }
    }

    updateMinutes(period: number, minutes: number, seconds: number, 
                    periodLength: number, numPeriods: number, otPeriodLength: number) {

        let secondsPlayed = 0;               
        var lastIn = new Substitution();
        const regOtPeriodDiff = periodLength - otPeriodLength;

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
                if (lastIn.period != sub.period) {

                    let fullPeriodSeconds = periodLength * 60;                    
                    let periodSecondsToAdd = (sub.period - lastIn.period) * fullPeriodSeconds;
                    
                    secondsPlayed += periodSecondsToAdd;
    
                    // need to subtract 60 seconds for each minute that ovetime periods is less 
                    // than reg periods, for each overtime period player started
                    if (sub.period > numPeriods) {
                        
                        let periodsStarted = (sub.period - lastIn.period);
                        let regulationPeriods;
                        if (lastIn.period < numPeriods) { // at least one period started wasn't OT
                            regulationPeriods = numPeriods - lastIn.period;
                        } 
                        let otPeriodsStarted = periodsStarted - regulationPeriods;

                        secondsPlayed -= otPeriodsStarted * regOtPeriodDiff * 60;
                    }
                }
                
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

            if (period != lastInPeriod) { // started at least one period in span
                
                let fullPeriodSeconds = periodLength * 60;
                let periodSecondsToAdd = (period - lastInPeriod) * fullPeriodSeconds;
    
                secondsPlayed += periodSecondsToAdd;
    
                // need to subtract 60 seconds for each minute that ovetime periods is less 
                // than reg periods, for each overtime period player started
                if (period > numPeriods) {

                    let periodsStarted = (period - lastInPeriod);
                    let regulationPeriods;
                    if (lastInPeriod < numPeriods) { // at least one period started wasn't OT
                        regulationPeriods = numPeriods - lastInPeriod;
                    }
                    let otPeriodsStarted = periodsStarted - regulationPeriods;

                    secondsPlayed -= (period - numPeriods) * regOtPeriodDiff * 60;
                }
            }

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