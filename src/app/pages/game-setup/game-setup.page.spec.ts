import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GameSetupPage } from './game-setup.page';

describe('GameSetupPage', () => {
  let component: GameSetupPage;
  let fixture: ComponentFixture<GameSetupPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GameSetupPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GameSetupPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
