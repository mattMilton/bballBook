import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FoulPage } from './foul.page';

describe('FoulPage', () => {
  let component: FoulPage;
  let fixture: ComponentFixture<FoulPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FoulPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FoulPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
