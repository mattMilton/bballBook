import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubstitutePage } from './substitute.page';

describe('SubstitutePage', () => {
  let component: SubstitutePage;
  let fixture: ComponentFixture<SubstitutePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubstitutePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubstitutePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
