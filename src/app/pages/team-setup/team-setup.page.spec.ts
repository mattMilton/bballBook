import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamSetupPage } from './team-setup.page';

describe('TeamSetupPage', () => {
  let component: TeamSetupPage;
  let fixture: ComponentFixture<TeamSetupPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeamSetupPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamSetupPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
