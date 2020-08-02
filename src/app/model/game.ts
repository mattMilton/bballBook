import { TeamEditPage } from '../pages/team-edit/team-edit.page';
import { Play } from './play';
import { Team } from './team';

export class Game {
    numPeriods: number;
    minPeriod: number;
    awayTeam: Team;
    homeTeam: Team;
    plays: Array<Play>;
}