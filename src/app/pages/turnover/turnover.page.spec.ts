import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TurnoverPage } from './turnover.page';

describe('TurnoverPage', () => {
  let component: TurnoverPage;
  let fixture: ComponentFixture<TurnoverPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TurnoverPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TurnoverPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
