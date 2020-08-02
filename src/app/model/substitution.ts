export enum SubType { SUB_IN, SUB_OUT }

export class Substitution {

    subType: SubType;
    period: number;
    minutes: number;
    seconds: number;

    // constructor (subType: SubType, period: number, minutes: number, seconds: number) {
    //     this.subType = subType;
    //     this.period = period;
    //     this.minutes = minutes;
    //     this.seconds = seconds;
    // }
}