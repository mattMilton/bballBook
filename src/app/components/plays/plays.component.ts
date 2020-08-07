import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { PlaysLogService } from 'src/app/services/plays-log.service';
import { Play } from 'src/app/model/play';

@Component({
  selector: 'app-plays',
  templateUrl: './plays.component.html',
  styleUrls: ['./plays.component.scss'],
})
export class PlaysComponent implements OnInit {

  @Output() deletePlayEmitter = new EventEmitter();
  @Output() togglePlayEmitter = new EventEmitter();

  // below 3 attributes are for future version for selecting period from which to 
  // see plays. numPeriods gets the number of periods from parent. then in ngOnInit, 
  // the arrays are initialized. But I will want to create a class, that will hold
  // the period, a boolean for if it is selected, as well as a boolean, for if it has begun.
  // That way <> file will be able to display only selected period's plays (but only being 
  // able to select from periods with plays), based on these
  // boolean fields.
  // @Input() numPeriods;
  // periodsArr:number[] = [];
  // periodSelected = 0;

  constructor(public plays: PlaysLogService) { }

  ngOnInit(
    ) {
      // for (let i = 0; i < this.numPeriods; i++) {
      //   this.periodsArr.push(i + 1);
      //}

  }

  // selectPeriod(period: number) {
  //   this.periodSelected = period;
  // }

  delete(play: Play) { 
    // make sure period start message is not deletable
    // tip-off play should be a toggle instead of delete
    const index: number = this.plays.plays.indexOf(play);
    if (index !== -1) {
      this.plays.plays.splice(index, 1);
    }
  
    this.deletePlayEmitter.emit({event: event, play: play, index: index});
    
  }

  toggle(play: Play) {
    // change controller of tip off
    // change possession arrow, then all jump balls occurring after tip-off, until another 
    // tip-off change possessing team ..^^^ this done in game.ts with gameService attributes
    // not sure if play need be sent, maybe for sake of which tip-off is being toggled, so
    // method knows where to begin changing jump balls. and if this method and emitter is 
    // eventually used for something other than jump balls.
    const index: number = this.plays.plays.indexOf(play);
    this.togglePlayEmitter.emit({event: event, play: play, index: index});
    
  }
}
