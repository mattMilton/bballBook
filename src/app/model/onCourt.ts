import { Player } from './player';
import { Play } from './play';

export class OnCourt {

    period: number;
    timeLeft: number;
    awayOnCourt: Player[] = [];
    homeOnCourt: Player[] = [];
    play: Play;

    constructor() {}
}