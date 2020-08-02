import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MissedFgPage } from './missed-fg.page';

describe('MissedFgPage', () => {
  let component: MissedFgPage;
  let fixture: ComponentFixture<MissedFgPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MissedFgPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MissedFgPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
